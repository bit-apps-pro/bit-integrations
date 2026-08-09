<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;

/**
 * Credential-test client for the connections/authorize endpoint. Runs one
 * authenticated request through ApiClient and returns the legacy result array
 * byte-compatible with AbstractBaseAuthorization::authorize():
 *
 *   success: ['success' => true, 'response' => mixed]
 *   error:   ['error' => true, 'message' => string, 'response' => mixed]
 *            (credential/config failures omit 'response', as before)
 *
 * The handler's validateAuthResponse() hook runs on 2xx responses so
 * integrations like ZendeskSupport can reject a 200 that lacks the expected
 * payload (wrong subdomain still returns 200 from Zendesk).
 */
class ConnectionTestApi extends ApiClient
{
    /**
     * @var AbstractBaseAuthorization
     */
    private $handler;

    public function __construct(AbstractBaseAuthorization $handler)
    {
        parent::__construct($handler);
        $this->handler = $handler;
    }

    /**
     * @param null|mixed $payload
     */
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

        // The strategy could not produce a credential, so no request was sent.
        // Return the handler's own error array untouched — legacy handed it straight
        // back, and its keys vary by handler (those built via errorResult() also
        // carry 'response').
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

        // Body-level error key wins over the status code (legacy order).
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

    /**
     * @param mixed $message  legacy path passes body error values through untouched
     * @param mixed $response
     */
    private function errorShape($message, $response): array
    {
        return [
            'error'    => true,
            'message'  => $message,
            'response' => $response,
        ];
    }
}
