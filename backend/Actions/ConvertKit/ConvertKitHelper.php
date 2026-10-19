<?php

/**
 * Convert Kit Integration
 */

namespace BitApps\Integrations\Actions\ConvertKit;

use BitApps\Integrations\Core\Util\HttpHelper;

class ConvertKitHelper
{
    public static function _apiEndpoint($method, $apiSecret)
    {
        return "https://api.convertkit.com/v3/{$method}?api_secret={$apiSecret}";
    }

    public static function convertKitForms($queryParams)
    {
        if (empty($queryParams->api_secret)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = self::_apiEndpoint('forms', $queryParams->api_secret);
        $convertKitResponse = HttpHelper::get($apiEndpoint, null);

        $forms = [];
        if (!is_wp_error($convertKitResponse)) {
            $allForms = $convertKitResponse->forms;

            foreach ($allForms as $form) {
                $forms[$form->name] = (object) [
                    'formId'   => $form->id,
                    'formName' => $form->name,
                ];
            }
            $response['convertKitForms'] = $forms;
            wp_send_json_success($response);
        }
    }

    public static function convertKitTags($queryParams)
    {
        if (empty($queryParams->api_secret)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = self::_apiEndpoint('tags', $queryParams->api_secret);

        $convertKitResponse = HttpHelper::get($apiEndpoint, null);

        $tags = [];
        if (!is_wp_error($convertKitResponse)) {
            $allTags = $convertKitResponse->tags;

            foreach ($allTags as $key => $tag) {
                $tags[$key] = (object) [
                    'tagId'   => $tag->id,
                    'tagName' => $tag->name,
                ];
            }
            $response['convertKitTags'] = $tags;

            wp_send_json_success($response);
        }
    }

    public static function convertKitHeaders($queryParams)
    {
        if (empty($queryParams->api_secret)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = self::_apiEndpoint('custom_fields', $queryParams->api_secret);

        $convertKitResponse = HttpHelper::get($apiEndpoint, null);

        $fields = [];
        if (!is_wp_error($convertKitResponse)) {
            $allFields = $convertKitResponse->custom_fields;

            foreach ($allFields as $field) {
                $fields[$field->key] = (object) [
                    'fieldId'   => $field->key,
                    'fieldName' => $field->key,
                    'required'  => false
                ];
            }
            $fields['FirstName'] = (object) ['fieldId' => 'firstName', 'fieldName' => 'First Name', 'required' => false];
            $fields['Email'] = (object) ['fieldId' => 'email', 'fieldName' => 'Email', 'required' => true];

            $response['convertKitField'] = $fields;
            wp_send_json_success($response);
        }
    }
}
