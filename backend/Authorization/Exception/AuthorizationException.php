<?php

namespace BitApps\Integrations\Authorization\Exception;

if (!defined('ABSPATH')) {
    exit;
}

use Exception;

/**
 * Thrown by auth strategies when credentials cannot be produced (missing
 * fields, decrypt failure, invalid handler config). Must never escape the
 * Flow engine: BaseApi::request() converts it to ApiResponse::failure(),
 * and CredentialInjector::inject() catches all Throwables.
 */
class AuthorizationException extends Exception
{
    /**
     * @var null|array the handler's own error array, when it produced one
     */
    private $errorDetails;

    /**
     * Carry a handler's original ['error' => true, 'message' => ...] array so the
     * credential-test path can return it verbatim. Handlers are not consistent —
     * those routing through errorResult() also carry a 'response' key — and the
     * legacy authorize() passed whatever it got straight back to the caller.
     */
    public static function fromErrorArray(array $errorDetails, string $message): self
    {
        $exception = new self($message);
        $exception->errorDetails = $errorDetails;

        return $exception;
    }

    public function errorDetails(): ?array
    {
        return $this->errorDetails;
    }
}
