<?php

namespace BitApps\Integrations\Authorization;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Immutable value object describing where and how a request is authenticated:
 * either headers to merge into the request, or parameters to append to the
 * query string.
 */
final class AuthCredential
{
    public const LOCATION_HEADER = 'header';

    public const LOCATION_QUERY = 'query';

    private $location;

    private $data;

    private function __construct(string $location, array $data)
    {
        $this->location = $location;
        $this->data = $data;
    }

    public static function header(array $data): self
    {
        return new self(self::LOCATION_HEADER, $data);
    }

    public static function query(array $data): self
    {
        return new self(self::LOCATION_QUERY, $data);
    }

    public function isQuery(): bool
    {
        return $this->location === self::LOCATION_QUERY;
    }

    public function data(): array
    {
        return $this->data;
    }
}
