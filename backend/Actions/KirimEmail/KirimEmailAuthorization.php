<?php

namespace BitApps\Integrations\Actions\KirimEmail;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;

class KirimEmailAuthorization extends AbstractBaseAuthorization
{
    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();
        $apiKey = $authDetails['api_key'] ?? '';

        if ($apiKey === '') {
            return [
                'error'   => true,
                'message' => __('Kirim Email api key is missing', 'bit-integrations'),
            ];
        }

        return $apiKey;
    }

    public function getAuthHeadersOrParams()
    {
        $authDetails = $this->getAuthDetails();
        $username = $authDetails['userName'] ?? '';
        $apiKey = $authDetails['api_key'] ?? '';

        if ($username === '' || $apiKey === '') {
            return [
                'error'   => true,
                'message' => __('Kirim Email username or api key is missing', 'bit-integrations'),
            ];
        }

        $time = time();
        $generatedToken = hash_hmac('sha256', "{$username}" . '::' . "{$apiKey}" . '::' . $time, "{$apiKey}");

        return [
            'authLocation' => 'header',
            'data'         => [
                'Auth-Id'    => $username,
                'Auth-Token' => $generatedToken,
                'Timestamp'  => $time,
            ],
        ];
    }
}
