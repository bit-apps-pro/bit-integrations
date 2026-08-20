<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;

class ConnectionTestApi extends ApiClient
{
    private $handler;

    public function __construct(AbstractBaseAuthorization $handler)
    {
        parent::__construct($handler);
        $this->handler = $handler;
    }

    public function test(string $apiEndpoint, string $method = 'GET', $payload = null, array $headers = []): array
    {
        $apiEndpoint = trim($apiEndpoint);

        if ($apiEndpoint === '') {
            return [
                'error'   => true,
                'message' => __('API endpoint is required', 'bit-integrations'),
            ];
        }

        $result = $this->request($method, $apiEndpoint, $payload, $headers);
        $response = $result->getBody();
        $authException = $this->lastAuthException();

        if ($authException !== null) {
            $details = $authException->errorDetails();

            return $details !== null ? $details : [
                'error'   => true,
                'message' => $authException->getMessage(),
            ];
        }

        if (is_wp_error($response)) {
            return $this->errorShape((string) $result->getError(), $response);
        }

        if ((\is_object($response) && !empty($response->error)) || (\is_array($response) && !empty($response['error']))) {
            $fallback = __('Authorization failed', 'bit-integrations');

            return $this->errorShape(
                \is_object($response) ? ($response->error ?? $fallback) : ($response['error'] ?? $fallback),
                $response
            );
        }

        if (!$result->success()) {
            return $this->errorShape(__('Authorization failed', 'bit-integrations'), $response);
        }

        $rejection = $this->handler->validateAuthResponse($response);

        if ($rejection !== null) {
            return $this->errorShape($rejection, $response);
        }

        return [
            'success'  => true,
            'response' => $response,
        ];
    }

    private function errorShape($message, $response): array
    {
        return [
            'error'    => true,
            'message'  => $message,
            'response' => $response,
        ];
    }
}
