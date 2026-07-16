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
 * Outbound authenticated HTTP base. Applies the injected auth strategy to
 * every request and returns a normalized ApiResponse — it never throws
 * across the Flow engine boundary.
 *
 * Contract notes:
 * - credential() is fetched per call and never memoized: strategies may
 *   compute per-request values (KirimEmail HMAC + Timestamp).
 * - The HTTP status is captured immediately after the request, before any
 *   nested call can clobber the HttpHelper::$responseCode static.
 * - Multipart/CURLFile bodies are untested on this path (no pilot exercises
 *   them yet); the bulk RecordApiHelper migration must not assume coverage.
 */
abstract class BaseApi
{
    /**
     * @var AuthStrategyInterface
     */
    protected $auth;

    /**
     * @var null|string
     */
    protected $baseUrl;

    /**
     * @var array<string, string>
     */
    protected $defaultHeaders = [];

    /**
     * @var bool guards the lazy getEndpointBase() resolution, which may hit the network
     */
    private $baseUrlResolved = false;

    /**
     * @var null|AuthorizationException set by the last request() that failed to build a credential
     */
    private $lastAuthException;

    public function __construct(AuthStrategyInterface $auth, ?string $baseUrl = null)
    {
        $this->auth = $auth;

        if ($baseUrl !== null) {
            $this->baseUrl = rtrim($baseUrl, '/');
            $this->baseUrlResolved = true;
        }
    }

    /**
     * Resolved on first use, not in the constructor: getEndpointBase() reads
     * auth details, and on OAuth2 that getter can trigger a token refresh
     * (network POST + DB write). Constructing a client must stay free of side
     * effects — callers that pass an absolute URL never resolve a base at all.
     */
    protected function baseUrl(): ?string
    {
        if (!$this->baseUrlResolved) {
            $base = $this->auth->getEndpointBase();
            $this->baseUrl = $base === null ? null : rtrim($base, '/');
            $this->baseUrlResolved = true;
        }

        return $this->baseUrl;
    }

    /**
     * @param null|array|object $payload
     */
    protected function get(string $path, $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('GET', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    protected function post(string $path, $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('POST', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    protected function put(string $path, $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('PUT', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    protected function delete(string $path, $payload = null, array $headers = []): ApiResponse
    {
        return $this->request('DELETE', $path, $payload, $headers);
    }

    /**
     * @param null|array|object|string $payload
     */
    protected function request(string $method, string $path, $payload = null, array $headers = []): ApiResponse
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

            return ApiResponse::failure(0, $e->getMessage());
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
            return ApiResponse::failure(0, $raw->get_error_message(), $raw);
        }

        // Capture immediately: the static is rewritten by the next request anywhere
        // in the process (nested calls, related actions).
        $status = isset(HttpHelper::$responseCode) ? (int) HttpHelper::$responseCode : 0;

        return $this->normalize($raw, $status);
    }

    /**
     * The AuthorizationException from the most recent request(), when the strategy
     * could not produce a credential and no request was sent. Distinguishing that
     * from a real transport/HTTP failure by inspecting the response body alone is
     * not reliable, so the signal is explicit.
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
            return ApiResponse::success($status, $raw);
        }

        return ApiResponse::failure($status, null, $raw);
    }

    protected function resolveUrl(string $path): string
    {
        if ($path === '' || preg_match('#^https?://#i', $path)) {
            return $path;
        }

        $base = $this->baseUrl();

        if ($base === null || $base === '') {
            return $path;
        }

        return $base . '/' . ltrim($path, '/');
    }
}
