<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\Contract\AuthStrategyInterface;
use BitApps\Integrations\Authorization\Exception\AuthorizationException;
use BitApps\Integrations\Core\Util\HttpHelper;

class ApiClient
{
    protected $auth;

    protected $defaultHeaders = [];

    private $body;

    private $method = 'GET';

    private $url = '';

    private $payload;

    private $headers = [];

    private $baseUrl;

    private $resolvedBaseUrl;

    private $isBaseUrlResolved = false;

    private $response;

    private $lastAuthException;

    public function __construct(AuthStrategyInterface $connection)
    {
        $this->auth = $connection;
    }

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
