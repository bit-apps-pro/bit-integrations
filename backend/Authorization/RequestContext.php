<?php

namespace BitApps\Integrations\Authorization;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * The request an auth strategy is being asked to authenticate.
 *
 * Most strategies produce a credential from stored secrets alone and ignore this.
 * OAuth 1.0a cannot: its signature is computed over the HTTP method, the target URL
 * and the full parameter set, so a credential built without them is unusable. This
 * carries that detail from the caller down to the strategy.
 *
 * Immutable — a strategy must not be able to rewrite the request it is signing.
 */
final class RequestContext
{
    private $method;

    private $url;

    private $params;

    /**
     * @param array<string, mixed> $params request parameters that travel in the query
     *                                     string or a form-encoded body — the ones an
     *                                     OAuth1 signature must cover
     */
    public function __construct(string $method, string $url, array $params = [])
    {
        $this->method = strtoupper(trim($method)) ?: 'GET';
        $this->url = $url;
        $this->params = $params;
    }

    public function method(): string
    {
        return $this->method;
    }

    public function url(): string
    {
        return $this->url;
    }

    /**
     * @return array<string, mixed>
     */
    public function params(): array
    {
        return $this->params;
    }
}
