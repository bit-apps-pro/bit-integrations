<?php

namespace BitApps\Integrations\Actions\ZendeskSupport;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;

class ZendeskSupportAuthorization extends AbstractBaseAuthorization
{
    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();

        if (
            empty($authDetails['email'])
            || empty($authDetails['apiToken'])
        ) {
            return [
                'error'   => true,
                'message' => __('Zendesk email or API token is missing', 'bit-integrations'),
            ];
        }

        return 'Basic ' . base64_encode($authDetails['email'] . '/token:' . $authDetails['apiToken']);
    }

    public function getAuthHeadersOrParams()
    {
        $token = $this->getAccessToken();

        if (\is_array($token) && !empty($token['error'])) {
            return $token;
        }

        return [
            'authLocation' => 'header',
            'data'         => ['Authorization' => $token],
        ];
    }

    public function authorize(string $apiEndpoint, string $method = 'GET', $payload = null, array $headers = []): array
    {
        $result = parent::authorize($apiEndpoint, $method, $payload, $headers);

        if (!empty($result['error'])) {
            return $result;
        }

        $response = $result['response'] ?? null;
        $user = \is_object($response) ? ($response->user ?? null) : (\is_array($response) ? ($response['user'] ?? null) : null);
        $userId = \is_object($user) ? ($user->id ?? null) : (\is_array($user) ? ($user['id'] ?? null) : null);

        if (empty($userId)) {
            return [
                'error'    => true,
                'message'  => __('Invalid Zendesk subdomain, email, or API token', 'bit-integrations'),
                'response' => $response,
            ];
        }

        return $result;
    }

    public function getEndpointBase(): ?string
    {
        $authDetails = $this->getAuthDetails();

        if (empty($authDetails['subdomain'])) {
            return null;
        }

        return 'https://' . $authDetails['subdomain'] . '.zendesk.com/api/v2';
    }
}
