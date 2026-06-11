<?php

/**
 * Sender Integration
 */

namespace BitApps\Integrations\Actions\Sender;

use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Sender (sender.net) integration
 */
class SenderController
{
    private static $baseUrl = 'https://api.sender.net/v2';

    /**
     * Verify the supplied API access token by hitting the groups endpoint.
     *
     * @param object $requestParams
     */
    public static function senderAuthorize($requestParams)
    {
        if (empty($requestParams->api_token)) {
            wp_send_json_error(__('API token is required', 'bit-integrations'), 400);
        }

        $response = HttpHelper::get(self::$baseUrl . '/groups', null, self::authHeader($requestParams->api_token));

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message(), 400);
        }

        if (HttpHelper::$responseCode >= 200 && HttpHelper::$responseCode < 300) {
            wp_send_json_success(__('Authorized Successfully', 'bit-integrations'), 200);
        }

        wp_send_json_error(__('Invalid API token', 'bit-integrations'), 400);
    }

    /**
     * Fetch the account groups for the group dropdowns.
     *
     * @param object $requestParams
     */
    public static function refreshGroups($requestParams)
    {
        if (empty($requestParams->api_token)) {
            wp_send_json_error(__('API token is required', 'bit-integrations'), 400);
        }

        $response = HttpHelper::get(self::$baseUrl . '/groups', null, self::authHeader($requestParams->api_token));

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message(), 400);
        }

        if (HttpHelper::$responseCode < 200 || HttpHelper::$responseCode >= 300) {
            wp_send_json_error(__('Failed to fetch groups', 'bit-integrations'), 400);
        }

        $groups = [];
        foreach (self::dataRows($response) as $group) {
            $groups[] = [
                'id'    => $group->id ?? '',
                'title' => $group->title ?? '',
            ];
        }

        wp_send_json_success(['groups' => $groups], 200);
    }

    /**
     * Fetch the account custom fields so they can be mapped on subscriber actions.
     *
     * @param object $requestParams
     */
    public static function refreshFields($requestParams)
    {
        if (empty($requestParams->api_token)) {
            wp_send_json_error(__('API token is required', 'bit-integrations'), 400);
        }

        $response = HttpHelper::get(self::$baseUrl . '/fields', null, self::authHeader($requestParams->api_token));

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message(), 400);
        }

        if (HttpHelper::$responseCode < 200 || HttpHelper::$responseCode >= 300) {
            wp_send_json_error(__('Failed to fetch fields', 'bit-integrations'), 400);
        }

        $defaultFields = ['email', 'firstname', 'lastname', 'phone'];
        $fields        = [];
        foreach (self::dataRows($response) as $field) {
            // Sender returns the field token as `name` in {{slug}} form; the subscriber `fields`
            // payload must be keyed by the {$slug} personalization token, not the numeric/string id.
            $token = isset($field->name) ? str_replace(['{{', '}}'], ['{$', '}'], $field->name) : '';
            if ($token === '') {
                continue;
            }

            // Default subscriber fields are mapped top-level (email/firstname/lastname/phone),
            // so keep them out of the custom-field options to avoid duplicate mapping.
            $slug = strtolower(preg_replace('/[{}$\s]/', '', $token));
            if (\in_array($slug, $defaultFields, true)) {
                continue;
            }

            $fields[] = [
                'key'   => $token,
                'label' => $field->title ?? $token,
            ];
        }

        wp_send_json_success(['fields' => $fields], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map ?? [];

        if (empty($integrationDetails->api_token)) {
            return new WP_Error('api_token_empty', __('Sender API token is required', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $senderResponse  = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($senderResponse)) {
            return $senderResponse;
        }

        return $senderResponse;
    }

    private static function authHeader($token)
    {
        return [
            'Authorization' => 'Bearer ' . $token,
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json',
        ];
    }

    private static function dataRows($response)
    {
        if (isset($response->data) && \is_array($response->data)) {
            return $response->data;
        }

        return \is_array($response) ? $response : [];
    }
}
