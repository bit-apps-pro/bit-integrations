<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\HttpHelper;

final class ApiResponse
{
    private $success;

    private $status;

    private $body;

    private $error;

    private function __construct(bool $success, int $status, $body, ?string $error)
    {
        $this->success = $success;
        $this->status = $status;
        $this->body = $body;
        $this->error = $error;
    }

    public static function ok(int $status, $body): self
    {
        return new self(true, $status, $body, null);
    }

    public static function fail(int $status, ?string $error, $body = null): self
    {
        return new self(false, $status, $body, $error);
    }

    public static function from($raw): self
    {
        if (is_wp_error($raw)) {
            return self::fail(0, $raw->get_error_message(), $raw);
        }

        $status = isset(HttpHelper::$responseCode) ? (int) HttpHelper::$responseCode : 0;

        if ($status >= 200 && $status < 300) {
            return self::ok($status, $raw);
        }

        return self::fail($status, null, $raw);
    }

    public function success(): bool
    {
        return $this->success;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    public function getBody()
    {
        return $this->body;
    }

    public function setBody($body): self
    {
        $this->body = $body;

        return $this;
    }

    public function getError(): ?string
    {
        return $this->error;
    }

    public function setError(?string $error): self
    {
        $this->error = $error;

        return $this;
    }

    public function getBodyValue(string $key)
    {
        return self::getValue($this->body, $key);
    }

    public static function getValue($data, string $key)
    {
        if (\is_array($data)) {
            return $data[$key] ?? null;
        }

        return \is_object($data) ? ($data->{$key} ?? null) : null;
    }
}
