<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\Contract\AuthStrategyInterface;
use BitApps\Integrations\Authorization\Exception\AuthorizationException;
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
 * - ApiResponse::from() must run on the line after the request returns: it reads the
 *   HttpHelper::$responseCode static, which any nested call clobbers.
 * - Multipart/CURLFile bodies are untested on this path.
 */
class ApiClient
{
    protected $auth;

    protected $defaultHeaders = [];

    private $body;

    /**
     * The request currently being sent. Every one of these is ASSIGNED at the top of
     * request(), never appended to, so nothing from one call can survive into the next
     * — unlike $defaultHeaders, which is deliberately cumulative across calls.
     *
     * @var string
     */
    private $method = 'GET';

    private $url = '';

    private $payload;

    private $headers = [];

    /**
     * @var null|string set by setBaseURL(), overrides the connection's endpoint base
     */
    private $baseUrl;

    /**
     * @var null|string resolved endpoint base, cached so an OAuth2 getter runs once
     */
    private $resolvedBaseUrl;

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

    public function addHeaders(array $additionalHeaders): self
    {
        $this->headers = array_unique(
            array_merge($this->defaultHeaders, $additionalHeaders),
            SORT_REGULAR
        );

        return $this;
    }

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
        return $this->request('GET', $path, $payload, $headers);
    }

    public function post(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('POST', $path, $payload, $headers);
    }

    public function put(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('PUT', $path, $payload, $headers);
    }

    public function patch(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('PATCH', $path, $payload, $headers);
    }

    public function delete(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('DELETE', $path, $payload, $headers);
    }

    /**
     * Build and send one authenticated request.
     *
     * Every exit assigns $this->response, and $this->body is cleared before the first
     * one: getResponse() must reflect THIS call, and a payload must never survive into
     * the next request. Both invariants sit on separate return paths, so an added early
     * return has to carry them too.
     *
     * $method, $url, $payload and $headers are all assigned before anything reads them,
     * which is what keeps this call's values out of the next one.
     *
     * @param null|array|object|string $payload
     */
    public function request(string $method, string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        if ($payload === null) {
            $payload = $this->body;
        }

        $this->body = null;
        $this->lastAuthException = null;

        $this->method = strtoupper(trim($method)) ?: 'GET';
        $this->url = $this->resolveUrl($path);
        $this->payload = $payload;
        $this->addHeaders($headers);

        try {
            $this->auth->applyCredential($this);
        } catch (AuthorizationException $e) {
            $this->lastAuthException = $e;

            return $this->response = ApiResponse::fail(401, $e->getMessage());
        }

        $raw = HttpHelper::request(
            $this->url,
            $this->method,
            $this->payload,
            $this->headers,
            $this->auth->requestOptions()
        );

        return $this->response = ApiResponse::from($raw);
    }

    /**
     * The request being sent, read and rewritten by the auth strategy during
     * applyCredential(). These are NOT configuration like setHeaders() or setBody():
     * they hold one call's state and are reassigned at the top of every request(), so
     * anything set through them outside that window is discarded by the next call.
     */
    public function getRequestMethod(): string
    {
        return $this->method;
    }

    public function getRequestUrl(): string
    {
        return $this->url;
    }

    public function setRequestUrl(string $url): self
    {
        $this->url = $url;

        return $this;
    }

    public function getRequestPayload()
    {
        return $this->payload;
    }

    public function setRequestPayload($payload): self
    {
        $this->payload = $payload;

        return $this;
    }

    public function getRequestHeaders(): array
    {
        return $this->headers;
    }

    public function setRequestHeaders(array $headers): self
    {
        $this->headers = $headers;

        return $this;
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

    protected function resolveUrl(string $path): string
    {
        $base = $this->getBaseURL();
        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        return trim($base . '/' . $path, '/');
    }
}
