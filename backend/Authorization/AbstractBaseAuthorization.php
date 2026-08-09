<?php

namespace BitApps\Integrations\Authorization;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\Contract\AuthStrategyInterface;
use BitApps\Integrations\Authorization\Exception\AuthorizationException;
use BitApps\Integrations\Authorization\Support\AuthDataCodec;
use BitApps\Integrations\Core\Database\ConnectionModel;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\HttpHelper;
use Throwable;

abstract class AbstractBaseAuthorization implements AuthStrategyInterface
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
     * AuthStrategyInterface adapter over getAuthHeadersOrParams(): turns the
     * legacy ['authLocation' => ..., 'data' => [...]] array into an
     * AuthCredential, and its ['error' => true, 'message' => ...] failure array
     * into an AuthorizationException.
     *
     * Adapting rather than reimplementing keeps one copy of each auth type's
     * logic, so every handler works with ApiClient without being rewritten and
     * the two paths cannot drift.
     *
     * Called once per request and never memoized — handlers may compute
     * per-call values (KirimEmail signs an HMAC over the current timestamp).
     *
     * @throws AuthorizationException
     */
    public function credential(?RequestContext $context = null): AuthCredential
    {
        $authConfig = $this->authConfigFor($context);

        if (!\is_array($authConfig)) {
            throw new AuthorizationException(esc_html__('Invalid authorization config', 'bit-integrations'));
        }

        if (!empty($authConfig['error'])) {
            // Carry the handler's array through untouched: the credential-test path
            // returns it verbatim, and handlers disagree on its exact keys.
            //
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Never reaches output: ApiClient::send() catches AuthorizationException and CredentialInjector::inject() catches Throwable. $authConfig is a structured payload, not a string, and the message is the handler's own text which ConnectionTestApi returns verbatim for byte-compatibility — escaping it here would corrupt that response.
            throw AuthorizationException::fromErrorArray($authConfig, (string) ($authConfig['message'] ?? __('Authorization failed', 'bit-integrations')));
        }

        $data = (isset($authConfig['data']) && \is_array($authConfig['data'])) ? $authConfig['data'] : [];

        return ($authConfig['authLocation'] ?? 'header') === 'query'
            ? AuthCredential::query($data)
            : AuthCredential::header($data);
    }

    /**
     * Extra WP HTTP API options applied to every ApiClient request.
     */
    public function requestOptions(): array
    {
        return $this->buildRequestOptionsFromAuthDetails();
    }

    /**
     * Reject an otherwise-successful (2xx) credential test. Return an error
     * message to fail it, or null to accept.
     *
     * Some providers answer 200 to a wrong-but-well-formed credential (a
     * mistyped Zendesk subdomain resolves and returns 200), so a status-only
     * check would silently pass. Subclasses override to assert on the payload.
     *
     * @param mixed $response
     */
    public function validateAuthResponse($response): ?string
    {
        return null;
    }

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

        // Built before the credential: a signing strategy needs the method, URL and
        // params it is about to authenticate. Only array payloads are included — those
        // are the ones sent form-encoded, and an OAuth1 signature covers form body
        // params but never a JSON or multipart body.
        $authConfig = $this->authConfigFor(
            new RequestContext($method === '' ? 'GET' : $method, $apiEndpoint, \is_array($payload) ? $payload : [])
        );

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
            return $this->errorResult($response->get_error_message(), $response);
        }

        if ((\is_object($response) && !empty($response->error)) || (\is_array($response) && !empty($response['error']))) {
            $fallback = __('Authorization failed', 'bit-integrations');

            return $this->errorResult(
                \is_object($response) ? ($response->error ?? $fallback) : ($response['error'] ?? $fallback),
                $response
            );
        }

        if (isset(HttpHelper::$responseCode) && ((int) HttpHelper::$responseCode < 200 || (int) HttpHelper::$responseCode >= 300)) {
            return $this->errorResult(__('Authorization failed', 'bit-integrations'), $response);
        }

        return $this->successResult($response);
    }

    public function getConnectionId(): int
    {
        return (int) $this->connectionId;
    }

    /**
     * Resolved API base for region/instance-aware providers (Zoho .com/.in/.eu,
     * Salesforce instance_url, ActiveCampaign per-account api_url), read from
     * auth_details so region logic is not scattered across the codebase.
     *
     * Consumed by ApiClient when a client is constructed without an explicit base
     * URL. Handlers whose base is not a stored field override this — see
     * ZendeskSupportAuthorization, which composes one from the subdomain.
     * Returns null when the integration derives its base elsewhere; callers must
     * handle that (ApiClient then only accepts absolute URLs).
     */
    public function getEndpointBase(): ?string
    {
        $details = $this->getAuthDetails();

        if (!\is_array($details)) {
            return null;
        }

        foreach (['endpoint_base', 'api_domain', 'instance_url', 'apiDomain', 'api_url'] as $key) {
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
            return;
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

        try {
            $authDetails = AuthDataCodec::encryptValues($authDetails, $encryptKeys);
        } catch (Throwable $e) {
            // Hash::encrypt throws rather than store a credential it could not encrypt.
            // Report a failed persist so callers surface it; writing the row without the
            // encrypted values would put the secret in the database in plaintext.
            return false;
        }

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

    /**
     * The auth config for a specific request.
     *
     * Seam between the context-free getAuthHeadersOrParams() every handler implements
     * and the strategies that must see the request to authenticate it. The default
     * ignores $context, which is correct for every credential derived from stored
     * secrets alone; OAuth1 overrides this to sign over the method, URL and params.
     *
     * Both credential() and authorize() route through here so a signing strategy is
     * driven identically whether it is called from ApiClient or the credential test.
     *
     * @return array the handler's ['authLocation' => ..., 'data' => [...]] config, or
     *               its ['error' => true, 'message' => ...] failure array
     */
    protected function authConfigFor(?RequestContext $context = null)
    {
        return $this->getAuthHeadersOrParams();
    }

    /**
     * Standard error result shape shared across the base and subclasses.
     *
     * @param null|mixed $response
     */
    protected function errorResult(string $message, $response = null): array
    {
        return [
            'error'    => true,
            'message'  => $message,
            'response' => $response,
        ];
    }

    /**
     * Standard success result shape shared across the base and subclasses.
     *
     * @param mixed $response
     */
    protected function successResult($response): array
    {
        return [
            'success'  => true,
            'response' => $response,
        ];
    }

    protected function setLastError(string $message, $response = null): void
    {
        $this->lastError = $this->errorResult($message, $response);
    }

    protected function clearLastError(): void
    {
        $this->lastError = null;
    }

    protected function decodeAuthDetails($value): array
    {
        if (\is_array($value)) {
            return $value;
        }

        if (\is_object($value)) {
            return Helper::jsonEncodeDecode($value) ?: [];
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
