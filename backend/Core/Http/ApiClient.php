<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthCredential;
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
 * - ApiResponse::from() must run on the line after the request returns: it reads the
 *   HttpHelper::$responseCode static, which any nested call clobbers.
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
        return $this->request('GET', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function post(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('POST', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function put(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('PUT', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function patch(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('PATCH', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    public function delete(string $path = '', $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('DELETE', $path, $payload, $headers);
    }

    /**
     * Build and send one authenticated request.
     *
     * Every exit assigns $this->response, and $this->body is cleared before the first
     * one: getResponse() must reflect THIS call, and a payload must never survive into
     * the next request. Both invariants sit on three separate return paths, so an added
     * early return has to carry them too.
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

        $method = strtoupper(trim($method));
        $method = $method === '' ? 'GET' : $method;
        $url = $this->resolveUrl($path);
        $headers = array_merge($this->defaultHeaders, $headers);

        $credential = $this->getCredential($method, $url, $payload);
        if ($credential === null) {
            $reason = $this->lastAuthException === null
                ? __('Authorization failed', 'bit-integrations')
                : $this->lastAuthException->getMessage();

            return $this->response = ApiResponse::fail(401, $reason);
        }

        [$url, $payload, $headers] = $this->applyCredential($credential, $method, $url, $payload, $headers);

        $raw = HttpHelper::request($url, $method, $payload, $headers, $this->auth->requestOptions());

        return $this->response = ApiResponse::from($raw);
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
     * The credential for one request, or null when the strategy could not produce one.
     *
     * A failure is recorded on $lastAuthException rather than thrown: no request is
     * sent, and the caller reports it as a failed response like any other. Only array
     * payloads reach the strategy — those are the ones sent form-encoded, and an OAuth1
     * signature covers form body params but never a JSON or multipart body.
     *
     * @param null|array|object|string $payload
     */
    private function getCredential(string $method, string $url, $payload): ?AuthCredential
    {
        try {
            return $this->auth->credential(
                new RequestContext($method, $url, \is_array($payload) ? $payload : [])
            );
        } catch (AuthorizationException $e) {
            $this->lastAuthException = $e;

            return null;
        }
    }

    /**
     * Attach the credential to the request it authenticates.
     *
     * The credential says WHERE it belongs — header or query. How a query credential
     * reaches the wire is the transport's business, not the credential's:
     * HttpHelper::get() emits $payload as the query string, so on GET the params merge
     * into the payload to keep one deduplicated query, and on every other method they
     * are appended to the URL.
     *
     * @param null|array|object|string $payload
     *
     * @return array{string, mixed, array<string, string>} [$url, $payload, $headers]
     */
    private function applyCredential(AuthCredential $credential, string $method, string $url, $payload, array $headers): array
    {
        if (!$credential->isQuery()) {
            return [$url, $payload, array_merge($headers, $credential->data())];
        }

        if ($method === 'GET') {
            // Caller keys win on collision (matches the legacy authorize() behavior).
            return [$url, array_merge($credential->data(), \is_array($payload) ? $payload : []), $headers];
        }

        $separator = strpos($url, '?') !== false ? '&' : '?';

        return [$url . $separator . http_build_query($credential->data()), $payload, $headers];
    }
}
