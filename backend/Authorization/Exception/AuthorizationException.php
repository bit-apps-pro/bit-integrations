<?php

namespace BitApps\Integrations\Authorization\Exception;

if (!defined('ABSPATH')) {
    exit;
}

use Exception;

class AuthorizationException extends Exception
{
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
