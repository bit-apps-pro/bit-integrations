<?php

namespace BitApps\Integrations\Authorization\OAuth2;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;
use BitApps\Integrations\Authorization\Support\AuthDataCodec;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\HttpHelper;

class OAuth2Authorization extends AbstractBaseAuthorization
{
    /**
     * These three must keep this order:
     *
     *     REFRESH_HTTP_TIMEOUT < WAIT_FOR_REFRESH_MS < STALE_LOCK_SECONDS
     *
     * A waiter has to outlast the slowest legitimate refresh, or it gives up while the
     * holder is still working; and a lock must not be declared stale while its holder
     * could still be inside the HTTP call, or a second request reclaims a live lock.
     * Getting this backwards turns one slow token endpoint into a refresh stampede.
     */
    private const REFRESH_HTTP_TIMEOUT = 10;

    private const WAIT_FOR_REFRESH_MS = 12000;

    private const STALE_LOCK_SECONDS = 15;

    private const WAIT_POLL_MS = 250;

    private $bodyParams;

    private $refreshTokenUrl;

    private $tokenPrefix = 'Bearer ';

    /**
     * Unique value written to the refresh-lock option so we can confirm ownership.
     */
    private $refreshLockValue;

    public function setBodyParams(array $bodyParams)
    {
        $this->bodyParams = $bodyParams;

        return $this;
    }

    public function setRefreshTokenUrl($refreshTokenUrl)
    {
        $this->refreshTokenUrl = $refreshTokenUrl;

        return $this;
    }

    public function setTokenPrefix($prefix)
    {
        $this->tokenPrefix = $prefix === null ? '' : (string) $prefix;

        return $this;
    }

    /**
     * Reading auth details can refresh the token as a side effect (network POST
     * + DB write) — see ensureFreshToken(), which the getter delegates to so
     * existing callers keep their implicit refresh. Prefer calling
     * ensureFreshToken() explicitly at the point a fresh token is actually
     * needed; the getter will stop refreshing once its callers have migrated.
     */
    public function getAuthDetails(): ?array
    {
        return $this->ensureFreshToken();
    }

    /**
     * Return auth details, refreshing the access token first when it has expired.
     * Null only when the connection has no auth details at all.
     *
     * A FAILED refresh falls back to the stored (stale) details rather than null.
     * Returning null here is not "no fresh token", it reads to every caller as "no
     * credentials": CredentialInjector skips injection entirely, so an action that
     * would have worked reports missing parameters instead of an auth error. Several
     * integrations also carry their own refresh (ZohoCRM::_refreshAccessToken builds
     * its endpoint from dataCenter) and recover on their own once the stored details
     * reach them. A stale token surfaces as the provider's 401 — an accurate error —
     * which beats silently withholding the credentials. getLastError() still carries
     * why the refresh failed.
     */
    public function ensureFreshToken(): ?array
    {
        $this->clearLastError();

        $authDetails = parent::getAuthDetails();

        if (empty($authDetails)) {
            $this->setLastError(__('Connection auth details are missing', 'bit-integrations'));

            return null;
        }

        $generatedAt = $authDetails['generated_at'] ?? null;
        $expiresIn = $authDetails['expires_in'] ?? null;

        if (!$this->isTokenExpired($generatedAt, $expiresIn)) {
            return $authDetails;
        }

        $refreshed = $this->refreshAccessToken($authDetails);

        return $refreshed !== null ? $refreshed : $authDetails;
    }

    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();

        if ($authDetails === null) {
            return $this->getLastError() ?: [
                'error'   => true,
                'message' => __('Connection auth details are missing', 'bit-integrations'),
            ];
        }

        if (empty($authDetails['access_token'])) {
            $this->setLastError(__('Access token is missing', 'bit-integrations'));

            return $this->getLastError();
        }

        return $this->tokenPrefix . $authDetails['access_token'];
    }

    public function getAuthHeadersOrParams()
    {
        $token = $this->getAccessToken();

        if (\is_array($token) && !empty($token['error'])) {
            return $token;
        }

        return [
            'authLocation' => 'header',
            'data'         => ['Authorization' => $token],
        ];
    }

    public function refreshAccessToken(array $authDetails): ?array
    {
        $connectionId = $this->getConnectionId();

        // No persisted row to serialize on (inline credentials / the credential-test
        // path): there is nothing for a concurrent request to race against and nowhere
        // to publish the result, so refresh directly.
        if ($connectionId <= 0) {
            return $this->performTokenRefresh($authDetails);
        }

        $lockKey = Config::VAR_PREFIX . 'oauth_refresh_lock_' . $connectionId;

        if (!$this->acquireRefreshLock($lockKey)) {
            // Someone else holds the lock. Wait for the token they persist.
            $fresh = $this->waitForRefreshedToken($lockKey);

            if ($fresh !== null) {
                return $fresh;
            }

            // The holder failed or outlived the wait. Do NOT refresh anyway: a second
            // POST replays a refresh_token the holder may already have consumed, and
            // providers that rotate it (Google, Dropbox, Zoho) revoke the whole grant
            // on replay — turning a slow refresh into a bricked connection. Returning
            // null lets ensureFreshToken() fall back to the stored token, so the
            // provider answers 401 and the request fails honestly instead.
            $this->setLastError(__('Token refresh is already in progress', 'bit-integrations'));

            return null;
        }

        try {
            // Double-checked read: a concurrent request may have refreshed the token
            // while we contended for the lock. Force a fresh DB read (bypassing the
            // in-memory connection cache) and re-evaluate expiry before spending a
            // refresh token on a network call.
            $this->connection = null;
            $freshDetails = parent::getAuthDetails();

            if (!empty($freshDetails)) {
                $generatedAt = $freshDetails['generated_at'] ?? null;
                $expiresIn = $freshDetails['expires_in'] ?? null;

                if (!$this->isTokenExpired($generatedAt, $expiresIn)) {
                    // Already refreshed by another request — no network call.
                    return $freshDetails;
                }

                // Still expired: refresh using the freshest persisted details.
                $authDetails = $freshDetails;
            }

            return $this->performTokenRefresh($authDetails);
        } finally {
            $this->releaseRefreshLock($lockKey);
        }
    }

    /**
     * Per-connection refresh lock that works without a persistent object cache.
     *
     * Implemented as a compare-and-set directly on the options table rather than via
     * add_option(): core's add_option() runs `INSERT ... ON DUPLICATE KEY UPDATE
     * option_value = VALUES(option_value)` (wp-includes/option.php), which is
     * last-writer-wins, so two racers can each write and then confirm-read their own
     * token and both believe they hold the lock. `INSERT IGNORE` + rows_affected === 1
     * is decided by the unique index on option_name and admits exactly one winner.
     *
     * A lock older than STALE_LOCK_SECONDS is reclaimed so a crashed request cannot
     * deadlock refreshes forever; the reclaim is itself a CAS on the exact value
     * observed, so it can never delete a lock another request just took.
     *
     * All reads go to the DB directly — get_option() would consult the `notoptions`
     * cache, which wp_cache_delete() does not clear, and a live lock could read as
     * absent.
     */
    private function acquireRefreshLock(string $lockKey): bool
    {
        $value = $this->newLockValue();

        if ($this->claimLock($lockKey, $value)) {
            return true;
        }

        $current = (string) $this->readLockOption($lockKey);
        $lockedAt = (int) substr(strrchr('|' . $current, '|'), 1);

        if ($current === '' || $lockedAt <= 0 || (time() - $lockedAt) < self::STALE_LOCK_SECONDS) {
            return false;
        }

        // Stale lock: delete only if it is still the exact row we observed, then race
        // for it normally. If another request reclaimed it first, our DELETE matches
        // nothing and our INSERT loses — either way only one winner emerges.
        if (!$this->deleteLockIfValueMatches($lockKey, $current)) {
            return false;
        }

        return $this->claimLock($lockKey, $value);
    }

    /**
     * INSERT IGNORE: the unique index on option_name means exactly one concurrent
     * caller gets rows_affected === 1.
     */
    private function claimLock(string $lockKey, string $value): bool
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- A mutex must be decided by the unique index on option_name; add_option() cannot express INSERT IGNORE and its non-atomic pre-check lets two racers both win. Caching this would defeat the lock outright: a cached read is exactly how a live lock reads as absent. Table from $wpdb->options, values bound via prepare().
        $wpdb->query(
            $wpdb->prepare(
                "INSERT IGNORE INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s, %s, 'no')",
                $lockKey,
                $value
            )
        );

        if ((int) $wpdb->rows_affected !== 1) {
            return false;
        }

        $this->refreshLockValue = $value;

        return true;
    }

    private function releaseRefreshLock(string $lockKey): void
    {
        if ($this->refreshLockValue !== null) {
            // Delete only our own lock — never clobber one a stale-reclaim handed on.
            $this->deleteLockIfValueMatches($lockKey, $this->refreshLockValue);
        }

        $this->refreshLockValue = null;
    }

    /**
     * CAS delete: removes the row only while it still holds $value.
     */
    private function deleteLockIfValueMatches(string $lockKey, string $value): bool
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Compare-and-set: the WHERE on option_value is what stops one request deleting a lock another just took, and delete_option() cannot express it. Caching a mutex would defeat it. Table from $wpdb->options, values bound via prepare().
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name = %s AND option_value = %s",
                $lockKey,
                $value
            )
        );

        return (int) $wpdb->rows_affected === 1;
    }

    private function readLockOption(string $lockKey)
    {
        global $wpdb;

        // Read the table directly: get_option() consults the `notoptions` cache before
        // the per-key cache, and wp_cache_delete() clears only the latter — so a live
        // lock written by another worker can read back as absent.
        //
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Reading a mutex through a cache is the bug this avoids: a cached value cannot observe another worker's write, which is the entire point of the read. Table from $wpdb->options, key bound via prepare().
        $value = $wpdb->get_var(
            $wpdb->prepare("SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", $lockKey)
        );

        return $value === null ? '' : $value;
    }

    private function newLockValue(): string
    {
        $random = \function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : bin2hex(random_bytes(16));

        return $random . '|' . time();
    }

    /**
     * Loser path: block for the lock holder to persist a refreshed token, polling the
     * connection row directly so we observe its write. Returns the fresh auth details,
     * or null if the holder failed or the wait ran out — the caller must NOT refresh on
     * its own afterwards (see refreshAccessToken).
     *
     * The wait outlasts REFRESH_HTTP_TIMEOUT so a legitimately slow refresh is never
     * abandoned mid-flight.
     */
    private function waitForRefreshedToken(string $lockKey): ?array
    {
        $elapsed = 0;

        while ($elapsed < self::WAIT_FOR_REFRESH_MS) {
            usleep(self::WAIT_POLL_MS * 1000);
            $elapsed += self::WAIT_POLL_MS;

            $fresh = $this->readPersistedToken();

            if ($fresh !== null) {
                return $fresh;
            }

            if (!$this->isRefreshLocked($lockKey)) {
                // The holder is gone. Re-read once more before giving up: it may have
                // persisted the token and released between our two reads above, and
                // treating that as a failure would discard a perfectly good token.
                return $this->readPersistedToken();
            }
        }

        return null;
    }

    /**
     * Fresh DB read of the connection (bypassing the in-memory cache); returns the auth
     * details only when they carry a non-expired token, else null.
     */
    private function readPersistedToken(): ?array
    {
        $this->connection = null;
        $fresh = parent::getAuthDetails();

        if (empty($fresh) || $this->isTokenExpired($fresh['generated_at'] ?? null, $fresh['expires_in'] ?? null)) {
            return null;
        }

        return $fresh;
    }

    private function isRefreshLocked(string $lockKey): bool
    {
        return (string) $this->readLockOption($lockKey) !== '';
    }

    private function performTokenRefresh(array $authDetails): ?array
    {
        $url = $this->refreshTokenUrl ?: ($authDetails['refresh_token_url'] ?? ($authDetails['refreshTokenUrl'] ?? ''));

        if (empty($url)) {
            $this->setLastError(__('Refresh token endpoint is missing', 'bit-integrations'));

            return null;
        }

        $body = $this->bodyParams ?: $this->buildRefreshBody($authDetails);
        $headers = $this->buildRefreshHeaders($authDetails);

        // Bound explicitly: HttpHelper's 30s default would outlive both the waiters
        // blocking on this refresh and the stale-lock window (see the constants above).
        $requestOptions = ['timeout' => self::REFRESH_HTTP_TIMEOUT];
        $sslVerify = AuthDataCodec::normalizeSslVerify($authDetails['ssl_verify'] ?? null);

        if ($sslVerify !== null) {
            $requestOptions['sslverify'] = $sslVerify;
            $requestOptions['verify'] = $sslVerify;
        }

        $response = HttpHelper::post($url, $body, $headers, $requestOptions);

        if (is_wp_error($response)) {
            $this->setLastError($response->get_error_message(), $response);

            return null;
        }

        if (HttpHelper::$responseCode < 200 || HttpHelper::$responseCode >= 300 || (\is_object($response) && isset($response->error))) {
            $message = \is_object($response) && isset($response->error)
                ? $response->error
                : __('Token refresh failed', 'bit-integrations');
            $this->setLastError((string) $message, $response);

            return null;
        }

        $response = \is_object($response) ? json_decode(wp_json_encode($response), true) : (array) $response;

        $authDetails['access_token'] = $response['access_token'] ?? ($authDetails['access_token'] ?? '');

        if (!empty($response['refresh_token'])) {
            $authDetails['refresh_token'] = $response['refresh_token'];
        }

        if (isset($response['expires_in'])) {
            $authDetails['expires_in'] = (int) $response['expires_in'];
        }

        $authDetails['generated_at'] = time();

        // Keep an in-memory override in sync with the refreshed token. Without this a
        // caller running on an override (the credential-test path, which builds the
        // handler with connectionId 0) has nowhere to persist to — updateAuthDetails()
        // needs a connection row — so the stale token would still read as expired and
        // every subsequent getAuthDetails() would replay the same refresh_token on a
        // second POST. Providers that rotate refresh tokens reject that replay.
        if (\is_array($this->authDetailsOverride)) {
            $this->authDetailsOverride = $authDetails;
        }

        $this->updateAuthDetails($authDetails);

        return $authDetails;
    }

    private function buildRefreshBody(array $authDetails): array
    {
        $grantType = $authDetails['grant_type'] ?? 'authorization_code';
        $body = [
            'grant_type' => $grantType === 'client_credentials' ? 'client_credentials' : 'refresh_token',
        ];

        // Body auth is the default. Header auth puts client credentials in Authorization
        // header instead — see buildRefreshHeaders.
        if ($this->resolveClientAuthMode($authDetails) !== 'header') {
            $body['client_id'] = $authDetails['client_id'] ?? ($authDetails['clientId'] ?? '');
            $body['client_secret'] = $authDetails['client_secret'] ?? ($authDetails['clientSecret'] ?? '');
        }

        if (!empty($authDetails['refresh_token'])) {
            $body['refresh_token'] = $authDetails['refresh_token'];
        }

        return $body;
    }

    private function buildRefreshHeaders(array $authDetails): array
    {
        $headers = ['Content-Type' => 'application/x-www-form-urlencoded'];

        if ($this->resolveClientAuthMode($authDetails) === 'header') {
            $clientId = $authDetails['client_id'] ?? ($authDetails['clientId'] ?? '');
            $clientSecret = $authDetails['client_secret'] ?? ($authDetails['clientSecret'] ?? '');
            $headers['Authorization'] = 'Basic ' . base64_encode($clientId . ':' . $clientSecret);
        }

        return $headers;
    }

    private function resolveClientAuthMode(array $authDetails): string
    {
        $mode = $authDetails['clientAuthentication'] ?? ($authDetails['client_authentication'] ?? 'body');

        return $mode === 'header' ? 'header' : 'body';
    }
}
