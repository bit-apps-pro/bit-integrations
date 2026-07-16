<?php

namespace BitApps\Integrations\Authorization\ApiKey;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AbstractBaseAuthorization;

class ApiKeyAuthorization extends AbstractBaseAuthorization
{
    public function getAccessToken()
    {
        $authDetails = $this->getAuthDetails();

        if (empty($authDetails) || !isset($authDetails['value']) || $authDetails['value'] === '') {
            return [
                'error'   => true,
                'message' => __('Token field is missing', 'bit-integrations'),
            ];
        }

        return $authDetails['value'];
    }

    public function getAuthHeadersOrParams()
    {
        $authDetails = $this->getAuthDetails();

        // Mirrors getAccessToken(): an empty string is a missing key, not a usable one.
        // Accepting it here shipped a blank `X-API-Key:` header to the provider, whose
        // 401 reads as "wrong key" rather than "no key was saved". A decrypt failure
        // surfaces the same way (Hash::decrypt returns null), so this also stops a
        // corrupted credential from being sent as an empty header.
        if (empty($authDetails) || !isset($authDetails['value']) || $authDetails['value'] === '') {
            return [
                'error'   => true,
                'message' => __('Token field is missing', 'bit-integrations'),
            ];
        }

        $key = $authDetails['key'] ?? 'X-API-Key';
        $location = $authDetails['addTo'] ?? 'header';

        return [
            'authLocation' => $location,
            'data'         => [$key => $authDetails['value']],
        ];
    }
}
