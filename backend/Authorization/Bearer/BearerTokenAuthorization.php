<?php

namespace BitApps\Integrations\Authorization\Bearer;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;

class BearerTokenAuthorization extends AbstractBaseAuthorization
{
    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();

        if (empty($authDetails) || empty($authDetails['token'])) {
            return [
                'error'   => true,
                'message' => __('access token field is missing', 'bit-integrations'),
            ];
        }

        return 'Bearer ' . $authDetails['token'];
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
}
