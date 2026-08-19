<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\Contract\AuthStrategyInterface;
use BitApps\Integrations\Authorization\Exception\AuthorizationException;
use BitApps\Integrations\Authorization\RequestContext;
use BitApps\Integrations\Core\Util\HttpHelper;

/**
 * Authenticated HTTP client for an integration, driven by a resolved connection.
 *
 *     $connection = AuthorizationFactory::getConnectionHandler($connectionId, 'SureContact');
 *
 *     if ($connection === null) {
 *         return null; // no connection, or it belongs to another app
 *     }
 *
 *     $api = new ApiClient($connection);
 *     $api->setBaseURL($api->getBaseURL() . '/v1');
 *     $api->setHeaders(['Accept' => 'application/json']);
 *
 *     $api->setBody($payload);
 *     $response = $api->post('records');
 *     $response = $api->get('records', ['limit' => 100]);
 *
 * The client takes an AuthStrategyInterface, never a connection id: turning an id into
 * a strategy means reading the connection row and checking it belongs to the calling
 * app — the Authorization layer's job (AuthorizationFactory::getConnectionHandler),
 * and it has to happen before a client is worth building. That keeps "which connection
 * is this, and may this app use it" in one place instead of duplicated here, and leaves
 * this class with a single concern: signing and sending requests.
 *
 * Building a client is still free of side effects — the strategy reads its stored
 * secrets, and an OAuth2 getter refreshes a token, only when the first request or
 * getBaseURL() asks for them.
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
     * @var AuthStrategyInterface
     */
    protected $auth;

    /**
     * @var array<string, string>
     */
    protected $defaultHeaders = [];

    /**
     * @var mixed payload for the next request
     */
    private $body;

    /**
     * @var null|string set by setBaseURL(), overrides the connection's endpoint base
     */
    private $baseUrl;

    /**
     * @var null|string resolved endpoint base, cached so an OAuth2 getter runs once
     */
    private $resolvedBaseUrl;

    /**
     * @var bool
     */
    private $isBaseUrlResolved = false;

    /**
     * @var null|ApiResponse the most recent response, for callers that inspect it
     */
    private $response;

    /**
     * @var null|AuthorizationException set by the last request that failed to build a credential
     */
    private $lastAuthException;

    /**
     * @param AuthStrategyInterface $connection strategy for the connection to call with
     */
    public function __construct(AuthStrategyInterface $connection)
    {
        $this->auth = $connection;
    }

    /**
     * The API base saved with the connection — the account's own host for per-tenant
     * providers, empty when the connection stores none. Empty string rather than null
     * keeps `getBaseURL() . '/v1'` from emitting a deprecation on PHP 8.1+.
     */
    public function getBaseURL(): string
    {
        if ($this->baseUrl !== null) {
            return $this->baseUrl;
        }

        if (!$this->isBaseUrlResolved) {
            $this->isBaseUrlResolved = true;
            $this->resolvedBaseUrl = rtrim((string) $this->auth->getEndpointBase(), '/');
        }

        return (string) $this->resolvedBaseUrl;
    }

    public function setBaseURL(?string $url): self
    {
        $this->baseUrl = $url === null ? null : rtrim($url, '/');

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
     * @param array<string, string> $additionalHeaders
     */
    public function addHeaders(array $additionalHeaders): self
    {
        $this->defaultHeaders = array_unique(
            array_merge($this->defaultHeaders, $additionalHeaders),
            SORT_REGULAR
        );

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

    /**
     * The most recent response, for callers that judge failure from the body.
     */
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
}
