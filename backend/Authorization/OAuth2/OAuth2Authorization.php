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
    private $bodyParams;

    private $refreshTokenUrl;

    private $tokenPrefix = 'Bearer ';

    /** Unique value written to the refresh-lock option so we can confirm ownership. */
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

    public function getAuthDetails(): ?array
    {
        $this->clearLastError();

        $authDetails = parent::getAuthDetails();

        if (empty($authDetails)) {
            $this->setLastError(__('Connection auth details are missing', 'bit-integrations'));

            return null;
        }

        $generatedAt = $authDetails['generated_at'] ?? null;
        $expiresIn = $authDetails['expires_in'] ?? null;

        if ($this->isTokenExpired($generatedAt, $expiresIn)) {
            return $this->refreshAccessToken($authDetails);
        }

        return $authDetails;
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
        $lockKey = Config::VAR_PREFIX . 'oauth_refresh_lock_' . $connectionId;
        $lockAcquired = $connectionId > 0 ? $this->acquireRefreshLock($lockKey) : false;

        if ($connectionId > 0 && !$lockAcquired) {
            // Another request is already refreshing. Block briefly for it to finish
            // and reload the token it persisted, rather than issuing our own refresh —
            // a second POST would replay/rotate the refresh token and can brick the
            // connection on providers that rotate it (see performTokenRefresh).
            $fresh = $this->waitForRefreshedToken($lockKey);

            if ($fresh !== null) {
                return $fresh;
            }

            // Winner released the lock without producing a fresh token (it failed or
            // timed out); fall through to a best-effort refresh so we never block forever.
        }

        try {
            if ($lockAcquired) {
                // Double-checked read: a concurrent request may have refreshed the
                // token while we contended for the lock. Force a fresh DB read
                // (bypassing the in-memory connection cache) and re-evaluate expiry
                // before spending a refresh token on a network call.
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
            }

            return $this->performTokenRefresh($authDetails);
        } finally {
            if ($lockAcquired) {
                $this->releaseRefreshLock($lockKey);
            }
        }
    }

    /**
     * Per-connection refresh lock that works without a persistent object cache.
     *
     * add_option() is NOT a reliable mutex on its own: WP core does a non-atomic
     * get_option() pre-check then INSERT ... ON DUPLICATE KEY UPDATE, so two racers
     * can both get a truthy return. But the INSERT sets option_value only once (the
     * duplicate branch updates option_name to itself, never the value), so the FIRST
     * writer's unique token survives. We therefore write a unique value and re-read to
     * confirm we actually own the row. A lock older than the timeout is reclaimed so a
     * crashed request can never deadlock refreshes.
     */
    private function acquireRefreshLock(string $lockKey, int $timeout = 15): bool
    {
        if ($this->claimLock($lockKey, $this->newLockValue())) {
            return true;
        }

        $current = (string) $this->readLockOption($lockKey);
        $lockedAt = (int) substr(strrchr('|' . $current, '|'), 1);

        if ($current !== '' && $lockedAt > 0 && (time() - $lockedAt) < $timeout) {
            return false;
        }

        // Stale (or unreadable) lock: drop it and re-claim with ownership confirmation.
        delete_option($lockKey);

        return $this->claimLock($lockKey, $this->newLockValue());
    }

    /**
     * Write our unique token and confirm the persisted value is ours (see acquire doc).
     */
    private function claimLock(string $lockKey, string $value): bool
    {
        add_option($lockKey, $value, '', 'no');

        if ($this->readLockOption($lockKey) === $value) {
            $this->refreshLockValue = $value;

            return true;
        }

        return false;
    }

    private function releaseRefreshLock(string $lockKey): void
    {
        // Only delete the row if it is still the one we own — never clobber a lock a
        // stale-reclaim handed to another request.
        if ($this->refreshLockValue !== null && $this->readLockOption($lockKey) === $this->refreshLockValue) {
            delete_option($lockKey);
        }

        $this->refreshLockValue = null;
    }

    private function readLockOption(string $lockKey)
    {
        // Bypass the per-request options cache so we observe another request's write/release.
        wp_cache_delete($lockKey, 'options');

        return get_option($lockKey, '');
    }

    private function newLockValue(): string
    {
        $random = function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : bin2hex(random_bytes(16));

        return $random . '|' . time();
    }

    /**
     * Loser path: block up to $maxWaitMs for the lock holder to persist a refreshed
     * token, polling the connection row directly (a fresh ConnectionModel query, not
     * the option cache) so we observe the holder's write. Returns the fresh auth
     * details once the token is no longer expired; returns null if the holder released
     * the lock without a valid token (it failed) or the wait timed out — the caller
     * then performs its own best-effort refresh so we never block indefinitely.
     */
    private function waitForRefreshedToken(string $lockKey, int $maxWaitMs = 8000, int $intervalMs = 250): ?array
    {
        $elapsed = 0;

        while ($elapsed < $maxWaitMs) {
            usleep($intervalMs * 1000);
            $elapsed += $intervalMs;

            // Force a fresh DB read of the connection so we see the holder's persisted token.
            $this->connection = null;
            $fresh = parent::getAuthDetails();

            if (!empty($fresh) && !$this->isTokenExpired($fresh['generated_at'] ?? null, $fresh['expires_in'] ?? null)) {
                return $fresh;
            }

            // Holder released the lock but the token is still expired => it failed;
            // stop waiting and let the caller do a best-effort refresh.
            if (!$this->isRefreshLocked($lockKey)) {
                return null;
            }
        }

        return null;
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

        $requestOptions = [];
        $sslVerify = AuthDataCodec::normalizeSslVerify($authDetails['ssl_verify'] ?? null);

        if ($sslVerify !== null) {
            $requestOptions = [
                'sslverify' => $sslVerify,
                'verify'    => $sslVerify,
            ];
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
