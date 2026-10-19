<?php

/**
 * Bento Record Api
 */

namespace BitApps\Integrations\Actions\Bento;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Hooks;
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

    public function getAllFields($fieldsRequestParams)
    {
        BentoHelper::checkValidation($fieldsRequestParams, $fieldsRequestParams->action ?? '');

        switch ($fieldsRequestParams->action) {
            case 'add_people':
                $defaultFields = [(object) ['label' => __('Email Address', 'bit-integrations'), 'key' => 'email', 'required' => true]];
                $fields = Hooks::apply(Config::withPrefix('bento_get_user_fields'), $defaultFields, $fieldsRequestParams);

                if (empty($fields)) {
                    /**
                     * @deprecated 2.7.8 Use `bit_integrations_bento_get_user_fields` filter instead.
                     * @since 2.7.8
                     */
                    $fields = Hooks::apply('btcbi_bento_get_user_fields', $defaultFields, $fieldsRequestParams);
                }

                break;
            case 'add_event':
                $fields = Hooks::apply(Config::withPrefix('bento_get_event_fields'), []);

                if (empty($fields)) {
                    /**
                     * @deprecated 2.7.8 Use `bit_integrations_bento_get_event_fields` filter instead.
                     * @since 2.7.8
                     */
                    $fields = Hooks::apply('btcbi_bento_get_event_fields', []);
                }

                break;

            default:
                $fields = [];

                break;
        }

        wp_send_json_success($fields, 200);
    }

    public function getAlTags($fieldsRequestParams)
    {
        BentoHelper::checkValidation($fieldsRequestParams);

        $tags = Hooks::apply(Config::withPrefix('bento_get_all_tags'), [], $fieldsRequestParams);

        if (empty($tags)) {
            /**
             * @deprecated 2.7.8 Use `bit_integrations_bento_get_all_tags` filter instead.
             * @since 2.7.8
             */
            $tags = Hooks::apply('btcbi_bento_get_all_tags', [], $fieldsRequestParams);
        }

        wp_send_json_success($tags, 200);
    }
}
