<?php

namespace BitApps\Integrations\Authorization\OAuth2;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;
use BitApps\Integrations\Authorization\Support\AuthDataCodec;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\HttpHelper;

class OAuth2Authorization extends AbstractBaseAuthorization
{
    private const REFRESH_HTTP_TIMEOUT = 10;

    private const WAIT_FOR_REFRESH_MS = 12000;

    private const STALE_LOCK_SECONDS = 15;

    private const WAIT_POLL_MS = 250;

    private const ASSUMED_EXPIRES_IN = 3600;

    private $bodyParams;

    private $refreshTokenUrl;

    private $tokenPrefix = 'Bearer ';

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
        return $this->ensureFreshToken();
    }

    public function ensureFreshToken(): ?array
    {
        $this->clearLastError();

        $authDetails = parent::getAuthDetails();

        if (empty($authDetails)) {
            $this->setLastError(__('Connection auth details are missing', 'bit-integrations'));

            return null;
        }

        if (!$this->isStoredTokenExpired($authDetails)) {
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

        if ($connectionId <= 0) {
            return $this->performTokenRefresh($authDetails);
        }

        $lockKey = Config::VAR_PREFIX . 'oauth_refresh_lock_' . $connectionId;

        if (!$this->acquireRefreshLock($lockKey)) {
            $fresh = $this->waitForRefreshedToken($lockKey);

            if ($fresh !== null) {
                return $fresh;
            }

            $this->setLastError(__('Token refresh is already in progress', 'bit-integrations'));

            return null;
        }

        try {
            $this->connection = null;
            $freshDetails = parent::getAuthDetails();

            if (!empty($freshDetails)) {
                if (!$this->isStoredTokenExpired($freshDetails)) {
                    return $freshDetails;
                }

                $authDetails = $freshDetails;
            }

            return $this->performTokenRefresh($authDetails);
        } finally {
            $this->releaseRefreshLock($lockKey);
        }
    }

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

        if (!$this->deleteLockIfValueMatches($lockKey, $current)) {
            return false;
        }

        return $this->claimLock($lockKey, $value);
    }

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
            $this->deleteLockIfValueMatches($lockKey, $this->refreshLockValue);
        }

        $this->refreshLockValue = null;
    }

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

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Reading a mutex through a cache is the bug this avoids: a cached value cannot observe another worker's write, which is the entire point of the read. Table from $wpdb->options, key bound via prepare().
        $value = $wpdb->get_var(
            $wpdb->prepare("SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", $lockKey)
        );

        return $value === null ? '' : $value;
    }

    private function isStoredTokenExpired(array $authDetails): bool
    {
        return $this->isTokenExpired(
            $authDetails['generated_at'] ?? null,
            $this->effectiveExpiresIn($authDetails)
        );
    }

    private function effectiveExpiresIn(array $authDetails): int
    {
        $expiresIn = (int) ($authDetails['expires_in'] ?? 0);

        if ($expiresIn > 0) {
            return $expiresIn;
        }

        $isClientCredentials = ($authDetails['grant_type'] ?? '') === 'client_credentials';

        if (empty($authDetails['refresh_token']) && !$isClientCredentials) {
            return 0;
        }

        return self::ASSUMED_EXPIRES_IN;
    }

    private function newLockValue(): string
    {
        $random = \function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : bin2hex(random_bytes(16));

        return $random . '|' . time();
    }

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
                return $this->readPersistedToken();
            }
        }

        return null;
    }

    private function readPersistedToken(): ?array
    {
        $this->connection = null;
        $fresh = parent::getAuthDetails();

        if (empty($fresh) || $this->isStoredTokenExpired($fresh)) {
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

        if (!Common::isPublicHttpsUrl((string) $url)) {
            $this->setLastError(__('Refresh token endpoint must be a public https URL', 'bit-integrations'));

            return null;
        }

        $body = $this->bodyParams ?: $this->buildRefreshBody($authDetails);
        $headers = $this->buildRefreshHeaders($authDetails);

        $requestOptions = ['timeout' => self::REFRESH_HTTP_TIMEOUT];

        $sslVerify = AuthDataCodec::normalizeSslVerify($authDetails['ssl_verify'] ?? null);

        if ($sslVerify === true) {
            $requestOptions['sslverify'] = true;
            $requestOptions['verify'] = true;
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

        $response = \is_object($response) ? Helper::jsonEncodeDecode($response) : (array) $response;

        if (empty($response['access_token'])) {
            $this->setLastError(__('Token refresh response did not contain an access token', 'bit-integrations'), $response);

            return null;
        }

        $authDetails['access_token'] = $response['access_token'];

        if (!empty($response['refresh_token'])) {
            $authDetails['refresh_token'] = $response['refresh_token'];
        }

        if (isset($response['expires_in'])) {
            $authDetails['expires_in'] = (int) $response['expires_in'];
        }

        $authDetails['generated_at'] = time();

        if (\is_array($this->authDetailsOverride)) {
            $this->authDetailsOverride = $authDetails;
        }

        if ($this->getConnectionId() > 0 && !$this->updateAuthDetails($authDetails)) {
            $this->setLastError(__('Refreshed token could not be saved to the connection', 'bit-integrations'));
        }

        return $authDetails;
    }

    private function buildRefreshBody(array $authDetails): array
    {
        $grantType = $authDetails['grant_type'] ?? 'authorization_code';
        $body = [
            'grant_type' => $grantType === 'client_credentials' ? 'client_credentials' : 'refresh_token',
        ];

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
