<?php

namespace BitApps\Integrations\Authorization\Exception;

if (!defined('ABSPATH')) {
    exit;
}

use Exception;

class AuthorizationException extends Exception
{
    private $errorDetails;

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
