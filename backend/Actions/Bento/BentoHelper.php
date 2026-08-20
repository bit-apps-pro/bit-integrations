<?php

/**
 * Bento Record Api
 */

namespace BitApps\Integrations\Actions\Bento;

use BitApps\Integrations\Core\Util\HttpHelper;

class BentoHelper
{
    public static function checkResponseCode()
    {
        return empty(HttpHelper::$responseCode) ? false : substr(HttpHelper::$responseCode, 0, 2) == 20;
    }

    public static function setReqParams($siteUUID, $publishableKey, $secretKey)
    {
        return (object) [
            'site_uuid'       => $siteUUID,
            'publishable_key' => $publishableKey,
            'secret_key'      => $secretKey,
        ];
    }

    public static function setEndpoint($endpoint, $siteUUID)
    {
        return "https://app.bentonow.com/api/v1/fetch/{$endpoint}?site_uuid={$siteUUID}";
    }

    public static function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->publishable_key) || empty($fieldsRequestParams->secret_key || empty($fieldsRequestParams->site_uuid)) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    public static function setHeaders($publishableKey, $secretKey)
    {
        return [
            'Authorization' => 'Basic ' . base64_encode("{$publishableKey}:{$secretKey}"),
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json'
        ];
    }
}
