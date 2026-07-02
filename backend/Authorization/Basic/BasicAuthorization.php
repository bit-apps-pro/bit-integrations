<?php

namespace BitApps\Integrations\Authorization\Basic;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;

class BasicAuthorization extends AbstractBaseAuthorization
{
    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();

        if (empty($authDetails) || empty($authDetails['username'])) {
            return [
                'error'   => true,
                'message' => __('username field is missing', 'bit-integrations'),
            ];
        }

        $password = $authDetails['password'] ?? '';

        return 'Basic ' . base64_encode($authDetails['username'] . ':' . $password);
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
