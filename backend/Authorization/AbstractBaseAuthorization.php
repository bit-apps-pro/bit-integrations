<?php

namespace BitApps\Integrations\Authorization;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\Support\AuthDataCodec;
use BitApps\Integrations\Core\Database\ConnectionModel;
use BitApps\Integrations\Core\Util\HttpHelper;

abstract class AbstractBaseAuthorization
{
    protected $connectionId;

    protected $connection;

    protected $authDetailsOverride;

    protected $lastError;

    public function __construct($connectionId)
    {
        $this->connectionId = (int) $connectionId;
    }

    abstract public function getAccessToken();

    abstract public function getAuthHeadersOrParams();

    /**
     * Test authorization credentials by calling an API endpoint.
     *
     * @param null|mixed $payload
     */
    public function authorize(string $apiEndpoint, string $method = 'GET', $payload = null, array $headers = []): array
    {
        $apiEndpoint = trim($apiEndpoint);
        $method = strtoupper(trim($method));

        if ($apiEndpoint === '') {
            return [
                'error'   => true,
                'message' => __('API endpoint is required', 'bit-integrations'),
            ];
        }

        $authConfig = $this->getAuthHeadersOrParams();

        if (!\is_array($authConfig)) {
            return [
                'error'   => true,
                'message' => __('Invalid authorization config', 'bit-integrations'),
            ];
        }

        if (isset($authConfig['error']) && $authConfig['error']) {
            return $authConfig;
        }

        $url = $apiEndpoint;
        $authLocation = $authConfig['authLocation'] ?? 'header';
        $authData = (isset($authConfig['data']) && \is_array($authConfig['data'])) ? $authConfig['data'] : [];

        if (!empty($authData)) {
            if ($authLocation === 'query') {
                if ($method === 'GET') {
                    // HttpHelper::get appends $payload as query string. Merge auth data
                    // into $payload so a single, deduplicated query is emitted. Caller
                    // payload keys win on collision.
                    $payload = array_merge($authData, \is_array($payload) ? $payload : []);
                } else {
                    $query = http_build_query($authData);
                    $separator = strpos($url, '?') !== false ? '&' : '?';
                    $url .= $separator . $query;
                }
            } else {
                $headers = array_merge($headers, $authData);
            }
        }

        $requestOptions = $this->buildRequestOptionsFromAuthDetails();
        $response = $this->sendRequest($url, $method === '' ? 'GET' : $method, $payload, $headers, $requestOptions);

        if (is_wp_error($response)) {
            return [
                'error'    => true,
                'message'  => $response->get_error_message(),
                'response' => $response,
            ];
        }

        if ((\is_object($response) && !empty($response->error)) || (\is_array($response) && !empty($response['error']))) {
            $fallback = __('Authorization failed', 'bit-integrations');

            return [
                'error'    => true,
                'message'  => \is_object($response) ? ($response->error ?? $fallback) : ($response['error'] ?? $fallback),
                'response' => $response,
            ];
        }

        if (isset(HttpHelper::$responseCode) && ((int) HttpHelper::$responseCode < 200 || (int) HttpHelper::$responseCode >= 300)) {
            return [
                'error'    => true,
                'message'  => __('Authorization failed', 'bit-integrations'),
                'response' => $response,
            ];
        }

        return [
            'success'  => true,
            'response' => $response,
        ];
    }

    public function getConnectionId(): int
    {
        return (int) $this->connectionId;
    }

    /**
     * Region-aware providers (Zoho .com/.in/.eu, Salesforce instance_url, MailChimp dc-prefix)
     * should persist their resolved API base in auth_details under `endpoint_base` or
     * `api_domain`. RecordApiHelper reads it via $handler->getEndpointBase() to avoid
     * scattering region logic across the codebase. Subclasses may override.
     */
    public function getEndpointBase(): ?string
    {
        $details = $this->getAuthDetails();

        if (!\is_array($details)) {
            return null;
        }

        foreach (['endpoint_base', 'api_domain', 'instance_url', 'apiDomain'] as $key) {
            if (!empty($details[$key]) && \is_string($details[$key])) {
                return rtrim($details[$key], '/');
            }
        }

        return null;
    }

    public function getLastError(): ?array
    {
        return $this->lastError;
    }

    protected function setLastError(string $message, $response = null): void
    {
        $this->lastError = [
            'error'    => true,
            'message'  => $message,
            'response' => $response,
        ];
    }

    protected function clearLastError(): void
    {
        $this->lastError = null;
    }

    public function setAuthDetailsOverride(array $authDetails)
    {
        $this->authDetailsOverride = $authDetails;

        return $this;
    }

    public function clearAuthDetailsOverride()
    {
        $this->authDetailsOverride = null;

        return $this;
    }

    public function getConnection()
    {
        if ($this->connection === null) {
            $this->connection = $this->loadConnection();
        }

        return $this->connection;
    }

    public function getAuthDetails()
    {
        if (\is_array($this->authDetailsOverride)) {
            return $this->authDetailsOverride;
        }

        $connection = $this->getConnection();

        if (!$connection) {
            return null;
        }

        $authDetails = $this->decodeAuthDetails($connection->auth_details ?? null);

        if (empty($authDetails)) {
            return $authDetails;
        }

        $encryptKeys = AuthDataCodec::parseEncryptKeys($connection->encrypt_keys ?? '');

        return AuthDataCodec::decryptValues($authDetails, $encryptKeys);
    }

    public function isTokenExpired($generatedAt, $expiresIn): bool
    {
        if (empty($generatedAt) || empty($expiresIn) || (int) $expiresIn <= 0) {
            return false;
        }

        return time() > ((int) $generatedAt + (int) $expiresIn - 30);
    }

    public function updateAuthDetails(array $authDetails): bool
    {
        $connection = $this->getConnection();

        if (!$connection) {
            return false;
        }

        $encryptKeys = AuthDataCodec::parseEncryptKeys($connection->encrypt_keys ?? '');
        $authDetails = AuthDataCodec::encryptValues($authDetails, $encryptKeys);

        $connectionModel = new ConnectionModel();
        $result = $connectionModel->update(
            [
                'auth_details' => wp_json_encode($authDetails),
                'updated_at'   => current_time('mysql'),
            ],
            ['id' => $this->connectionId]
        );

        if (is_wp_error($result) && $result->get_error_code() !== 'result_empty') {
            return false;
        }

        $this->connection = null;

        return true;
    }

    protected function decodeAuthDetails($value): array
    {
        if (\is_array($value)) {
            return $value;
        }

        if (\is_object($value)) {
            return json_decode(wp_json_encode($value), true) ?: [];
        }

        if (\is_string($value) && $value !== '') {
            $decoded = json_decode($value, true);

            return \is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    protected function http()
    {
        return new HttpHelper();
    }

    protected function sendRequest(string $url, string $method, $payload, array $headers, array $options = [])
    {
        switch ($method) {
            case 'GET':
                return HttpHelper::get($url, $payload, $headers, $options);

            case 'POST':
                return HttpHelper::post($url, $payload, $headers, $options);

            default:
                return HttpHelper::request($url, $method, $payload, $headers, $options);
        }
    }

    protected function buildRequestOptionsFromAuthDetails(): array
    {
        $authDetails = $this->getAuthDetails();

        if (!\is_array($authDetails)) {
            return [];
        }

        $sslVerify = AuthDataCodec::normalizeSslVerify($authDetails['ssl_verify'] ?? null);

        if ($sslVerify === null) {
            return [];
        }

        return [
            // WordPress HTTP API option
            'sslverify' => $sslVerify,
            // Kept for compatibility with existing code paths using "verify"
            'verify' => $sslVerify,
        ];
    }

    private function loadConnection()
    {
        if ($this->connectionId <= 0) {
            return;
        }

        $connectionModel = new ConnectionModel();
        $result = $connectionModel->get(
            ['id', 'app_slug', 'auth_type', 'connection_name', 'account_name', 'encrypt_keys', 'auth_details', 'status'],
            ['id' => $this->connectionId],
            1
        );

        if (is_wp_error($result) || empty($result[0])) {
            return;
        }

        return $result[0];
    }
}
