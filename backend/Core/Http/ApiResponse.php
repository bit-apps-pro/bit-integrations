<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Normalized outcome of one BaseApi request. Captures the HTTP status per
 * call so consumers never read the process-global HttpHelper::$responseCode,
 * which is clobbered by any nested request.
 */
final class ApiResponse
{
    private $ok;

    private $status;

    private $body;

    private $error;

    /**
     * @param mixed $body
     */
    private function __construct(bool $ok, int $status, $body, ?string $error)
    {
        $this->ok = $ok;
        $this->status = $status;
        $this->body = $body;
        $this->error = $error;
    }

    /**
     * @param mixed $body decoded JSON (object/array/scalar) or raw body string
     */
    public static function success(int $status, $body): self
    {
        return new self(true, $status, $body, null);
    }

    /**
     * @param mixed $body decoded body, WP_Error, or null when no request was sent
     */
    public static function failure(int $status, ?string $error, $body = null): self
    {
        return new self(false, $status, $body, $error);
    }

    public function ok(): bool
    {
        return $this->ok;
    }

    public function status(): int
    {
        return $this->status;
    }

    /**
     * @return mixed
     */
    public function body()
    {
        return $this->body;
    }

    public function error(): ?string
    {
        return $this->error;
    }
}
