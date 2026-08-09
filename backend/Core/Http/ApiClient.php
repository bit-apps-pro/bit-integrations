<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\Contract\AuthStrategyInterface;
use BitApps\Integrations\Authorization\Exception\AuthorizationException;
use BitApps\Integrations\Authorization\RequestContext;
use BitApps\Integrations\Core\Database\ConnectionModel;
use BitApps\Integrations\Core\Util\HttpHelper;
use Throwable;

/**
 * Authenticated HTTP client for an integration, configured from a saved connection.
 *
 *     $api = new ApiClient($connectionId);
 *     $api->setBaseURL($api->getBaseURL() . '/v1');
 *     $api->setHeaders(['Accept' => 'application/json']);
 *
 *     $api->setBody($payload);
 *     $response = $api->post('records');
 *     $response = $api->get('records', ['limit' => 100]);
 *
 * The auth type and app slug come from the connection row, so nothing but the id is
 * needed. Credentials resolve on the first request, not on construction: building a
 * client stays free of side effects (an OAuth2 getter can trigger a token refresh).
 * A ready AuthStrategyInterface can be passed instead of an id, for callers that
 * already hold one.
 *
 * setBody() sets the payload for the NEXT request only — it is cleared once sent, so a
 * client reused across calls never leaks one request's body into the next.
 *
 * Contract notes:
 * - credential() is fetched per call and never memoized: strategies may compute
 *   per-request values (KirimEmail HMAC + Timestamp).
 * - The HTTP status is captured immediately after the request, before any nested call
 *   can clobber the HttpHelper::$responseCode static.
 * - Multipart/CURLFile bodies are untested on this path.
 */
class ApiClient
{
    /**
     * @var null|AuthStrategyInterface
     */
    protected $auth;

    /**
     * @var array<string, string>
     */
    protected $defaultHeaders = [];

    /**
     * @var int
     */
    private $connectionId = 0;

    /**
     * @var null|string when set, the connection must belong to this app
     */
    private $appSlug;

    /**
     * @var mixed payload for the next request
     */
    private $body;

    /**
     * @var bool
     */
    private $authResolved = false;

    /**
     * @var null|string set by setBaseURL(), overrides the connection's endpoint base
     */
    private $baseUrlOverride;

    /**
     * @var null|string resolved endpoint base, cached so an OAuth2 getter runs once
     */
    private $resolvedBase;

    /**
     * @var bool
     */
    private $baseResolved = false;

    /**
     * @var null|ApiResponse the most recent response, for callers that inspect it
     */
    private $response;

    /**
     * @var null|string why the client could not be prepared
     */
    private $setupError;

    /**
     * @var null|AuthorizationException set by the last request that failed to build a credential
     */
    private $lastAuthException;

    /**
     * @param AuthStrategyInterface|int $connection a connection id, or a ready handler
     */
    public function __construct($connection = 0)
    {
        if ($connection instanceof AuthStrategyInterface) {
            $this->auth = $connection;
            $this->authResolved = true;

            return;
        }

        if (!empty($connection)) {
            $this->setConnectionId($connection);
        }
    }

    public function setConnectionId($connectionId): self
    {
        $this->connectionId = (int) $connectionId;
        $this->auth = null;
        $this->authResolved = false;
        $this->setupError = null;
        // The old base belonged to the old connection's tenant.
        $this->baseUrlOverride = null;
        $this->resolvedBase = null;
        $this->baseResolved = false;

        return $this;
    }

    public function getConnectionId(): int
    {
        return $this->connectionId;
    }

    /**
     * Bind this client to the integration using it. A connection_id arrives as a bare
     * integer, so nothing about it says which app it belongs to: without this, pointing
     * one integration's action at another's connection_id decrypts that app's token and
     * ships it to this app's endpoint. Mirrors CredentialInjector::belongsToIntegration().
     */
    public function setAppSlug(?string $appSlug): self
    {
        $this->appSlug = $appSlug;
        $this->auth = null;
        $this->authResolved = false;

        return $this;
    }

    /**
     * The API base saved with the connection — the account's own host for per-tenant
     * providers, empty when the connection stores none. Empty string rather than null
     * keeps `getBaseURL() . '/v1'` from emitting a deprecation on PHP 8.1+.
     */
    public function getBaseURL(): string
    {
        if ($this->baseUrlOverride !== null) {
            return $this->baseUrlOverride;
        }

        if (!$this->baseResolved) {
            $this->baseResolved = true;
            $auth = $this->auth();
            $this->resolvedBase = $auth === null ? '' : rtrim((string) $auth->getEndpointBase(), '/');
        }

        return (string) $this->resolvedBase;
    }

    public function setBaseURL(?string $baseUrl): self
    {
        $this->baseUrlOverride = $baseUrl === null ? null : rtrim($baseUrl, '/');

        return $this;
    }

    /**
     * Headers sent on every request. Replaces what was set before.
     *
     * @param array<string, string> $headers
     */
    public function setHeaders(array $headers): self
    {
        $this->defaultHeaders = $headers;

        return $this;
    }

    /**
     * @param array<string, string> $headers
     */
    public function addHeaders(array $headers): self
    {
        $this->defaultHeaders = array_merge($this->defaultHeaders, $headers);

        return $this;
    }

    /**
     * @param mixed $body
     */
    public function setBody($body): self
    {
        $this->body = $body;

        return $this;
    }

    /**
     * @param null|array|object $payload overrides setBody() for this call
     */
    public function get(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('GET', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function post(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('POST', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function put(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('PUT', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function patch(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('PATCH', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function delete(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send('DELETE', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function send(string $method, string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        if ($payload === null) {
            $payload = $this->body;
        }

        $this->body = null;

        if ($this->auth() === null) {
            return $this->response = ApiResponse::fail(0, $this->setupError ?: __('Connection is not configured', 'bit-integrations'));
        }

        return $this->response = $this->dispatch($method, $path, $payload, $headers);
    }

    /**
     * Alias of send(), kept for callers that read as "make this request".
     *
     * @param null|array|object|string $payload
     */
    public function request(string $method, string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->send($method, $path, $payload, $headers);
    }

    /** The most recent response, for callers that judge failure from the body. */
    public function getResponse(): ?ApiResponse
    {
        return $this->response;
    }

    public function getResponseCode(): int
    {
        return $this->response === null ? 0 : $this->response->getStatus();
    }

    /**
     * @return mixed
     */
    public function getResponseBody()
    {
        return $this->response === null ? null : $this->response->getBody();
    }

    /**
     * Why the last setup or request could not run, when one failed.
     */
    public function getSetupError(): ?string
    {
        return $this->setupError;
    }

    /**
     * The AuthorizationException from the most recent request, when the strategy could
     * not produce a credential and no request was sent. Distinguishing that from a real
     * transport/HTTP failure by inspecting the response body alone is not reliable, so
     * the signal is explicit.
     */
    protected function lastAuthException(): ?AuthorizationException
    {
        return $this->lastAuthException;
    }

    /**
     * @param mixed $raw decoded JSON (object/array/scalar) or raw body string
     */
    protected function normalize($raw, int $status): ApiResponse
    {
        if ($status >= 200 && $status < 300) {
            return ApiResponse::ok($status, $raw);
        }

        return ApiResponse::fail($status, null, $raw);
    }

    protected function resolveUrl(string $path): string
    {
        if ($path === '' || preg_match('#^https?://#i', $path)) {
            return $path;
        }

        $base = $this->getBaseURL();

        if ($base === '') {
            return $path;
        }

        return $base . '/' . ltrim($path, '/');
    }

    /**
     * @param null|array|object|string $payload
     */
    private function dispatch(string $method, string $path, $payload, array $headers): ApiResponse
    {
        $this->lastAuthException = null;

        $method = strtoupper(trim($method));
        $method = $method === '' ? 'GET' : $method;
        $url = $this->resolveUrl($path);
        $headers = array_merge($this->defaultHeaders, $headers);

        // The URL and method are resolved BEFORE the credential is built: an OAuth1
        // signature is computed over them, so a credential produced first would be
        // signing a request that does not exist yet. Only array payloads are passed —
        // those are the ones sent form-encoded, and an OAuth1 signature covers form body
        // params but never a JSON or multipart body.
        try {
            $credential = $this->auth->credential(
                new RequestContext($method, $url, \is_array($payload) ? $payload : [])
            );
        } catch (AuthorizationException $e) {
            $this->lastAuthException = $e;

            return ApiResponse::fail(0, $e->getMessage());
        }

        if ($credential->isQuery()) {
            if ($method === 'GET') {
                // HttpHelper::get emits $payload as the query string; merge auth
                // params into it so one deduplicated query is sent. Caller keys
                // win on collision (matches the legacy authorize() behavior).
                $payload = array_merge($credential->data(), \is_array($payload) ? $payload : []);
            } else {
                $query = http_build_query($credential->data());
                $separator = strpos($url, '?') !== false ? '&' : '?';
                $url .= $separator . $query;
            }
        } else {
            $headers = array_merge($headers, $credential->data());
        }

        $raw = HttpHelper::request($url, $method, $payload, $headers, $this->auth->requestOptions());

        if (is_wp_error($raw)) {
            return ApiResponse::fail(0, $raw->get_error_message(), $raw);
        }

        // Capture immediately: the static is rewritten by the next request anywhere
        // in the process (nested calls, related actions).
        $status = isset(HttpHelper::$responseCode) ? (int) HttpHelper::$responseCode : 0;

        return $this->normalize($raw, $status);
    }

    /**
     * app_slug is stored as the integration's display name ("Zoho CRM") while callers
     * pass a bare slug ("zohocrm"), so both sides reduce to alphanumerics before
     * comparing. No slug set means the caller opted out of the check.
     *
     * @param mixed $storedSlug
     */
    private function belongsToApp($storedSlug): bool
    {
        if ($this->appSlug === null || $this->appSlug === '' || empty($storedSlug)) {
            return true;
        }

        $normalize = static function ($value) {
            return strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $value));
        };

        return $normalize($storedSlug) === $normalize($this->appSlug);
    }

    /**
     * The connection row carries both the auth type and the app slug, so the handler is
     * built from the id alone. Resolved once, on first use.
     */
    private function auth(): ?AuthStrategyInterface
    {
        if ($this->authResolved) {
            return $this->auth;
        }

        $this->authResolved = true;

        if ($this->connectionId <= 0) {
            $this->setupError = __('No connection selected', 'bit-integrations');

            return null;
        }

        $connection = (new ConnectionModel())->get(
            ['id', 'app_slug', 'auth_type'],
            ['id' => $this->connectionId],
            1
        );

        if (is_wp_error($connection) || empty($connection[0]->auth_type)) {
            $this->setupError = __('Connection not found', 'bit-integrations');

            return null;
        }

        if (!$this->belongsToApp($connection[0]->app_slug ?? '')) {
            $this->setupError = __('Connection belongs to a different app', 'bit-integrations');

            return null;
        }

        try {
            $this->auth = AuthorizationFactory::getAuthorizationHandler(
                $connection[0]->auth_type,
                $this->connectionId,
                $connection[0]->app_slug ?? ''
            );
        } catch (Throwable $e) {
            $this->setupError = $e->getMessage();

            return null;
        }

        return $this->auth;
    }
}
