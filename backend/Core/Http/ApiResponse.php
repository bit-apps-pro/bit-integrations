<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\HttpHelper;

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
     * Build the outcome of the request that just completed.
     *
     * MUST be called immediately after the request returns. The status is read from
     * HttpHelper::$responseCode, a process-global that the next request anywhere in
     * the process overwrites — a nested call, a related action — so anything sending
     * a request between the two loses this one's status.
     *
     * A WP_Error means no HTTP exchange completed, so it carries status 0 and the
     * transport's own message; otherwise the status alone decides success. The raw
     * value is kept as the body either way — providers report failures inside a 2xx
     * body, and callers need to read it on both outcomes.
     *
     * @param mixed $raw decoded JSON (object/array/scalar), raw body string, or WP_Error
     */
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

    /**
     * Why a request failed, in the order the reason is actually available: the
     * transport error, then whatever the provider put in the body. ApiClient leaves
     * the error null on a non-2xx, so the body is usually the only source.
     *
     * Null on a successful transport — a provider that reports failure inside a 2xx
     * body is still the caller's business, as success() says.
     */
    public function errorMessage(string $fallback, string $bodyKey = 'message'): ?string
    {
        if ($this->success()) {
            return null;
        }

        $message = $this->getBodyValue($bodyKey);

        return $this->getError()
            ?: (\is_string($message) && $message !== '' ? $message : null)
            ?: $fallback;
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
