<?php

namespace BitApps\Integrations\Authorization;

if (!defined('ABSPATH')) {
    exit;
}

final class RequestContext
{
    private $method;

    private $url;

    private $params;

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

    public function params(): array
    {
        return $this->params;
    }
}
