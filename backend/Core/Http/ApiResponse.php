<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Normalized outcome of one request. Captures the HTTP status per call so consumers
 * never read the process-global HttpHelper::$responseCode, which is clobbered by any
 * nested request.
 */
final class ApiResponse
{
    private $success;

    private $status;

    private $body;

    private $error;

    /**
     * @param mixed $body
     */
    private function __construct(bool $success, int $status, $body, ?string $error)
    {
        $this->success = $success;
        $this->status = $status;
        $this->body = $body;
        $this->error = $error;
    }

    /**
     * @param mixed $body decoded JSON (object/array/scalar) or raw body string
     */
    public static function ok(int $status, $body): self
    {
        return new self(true, $status, $body, null);
    }

    /**
     * @param mixed $body decoded body, WP_Error, or null when no request was sent
     */
    public static function fail(int $status, ?string $error, $body = null): self
    {
        return new self(false, $status, $body, $error);
    }

    /**
     * Whether the transport succeeded. Providers that report failures inside a 2xx
     * body are the caller's business — check getBody() or getBodyValue() for those.
     */
    public function success(): bool
    {
        return $this->success;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    /**
     * @return mixed
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * @param mixed $body
     */
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

    /**
     * Read a key off the response body. Named for what it returns rather than `get()`,
     * which on the client means an HTTP GET.
     *
     * @return mixed
     */
    public function getBodyValue(string $key)
    {
        return self::getValue($this->body, $key);
    }

    /**
     * Read a key off any decoded value — a body, or one row out of a list. WPKit
     * decodes JSON to stdClass by default, but arrays turn up too, so every caller
     * would otherwise repeat this check.
     *
     * @param mixed $data
     *
     * @return mixed
     */
    public static function getValue($data, string $key)
    {
        if (\is_array($data)) {
            return $data[$key] ?? null;
        }

        return \is_object($data) ? ($data->{$key} ?? null) : null;
    }
}
