<?php

namespace BitApps\Integrations\Authorization\OAuth1;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;

class OAuth1Authorization extends AbstractBaseAuthorization
{
    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();

        if (empty($authDetails) || empty($authDetails['access_token'])) {
            return [
                'error'   => true,
                'message' => __('OAuth1 access token field is missing', 'bit-integrations'),
            ];
        }

        return $authDetails['access_token'];
    }

    public function getAuthHeadersOrParams()
    {
        $authDetails = $this->getAuthDetails();

        if (empty($authDetails['consumer_key']) || empty($authDetails['access_token'])) {
            return [
                'error'   => true,
                'message' => __('OAuth1 consumer key or access token is missing', 'bit-integrations'),
            ];
        }

        $consumerKeyParam = $authDetails['consumer_key_param'] ?? ($authDetails['consumerKeyParam'] ?? 'oauth_consumer_key');
        $tokenParam = $authDetails['token_param'] ?? ($authDetails['tokenParam'] ?? 'oauth_token');
        $location = $authDetails['addTo'] ?? 'query';

        return [
            'authLocation' => $location,
            'data'         => [
                $consumerKeyParam => $authDetails['consumer_key'],
                $tokenParam       => $authDetails['access_token'],
            ],
        ];
    }
}
