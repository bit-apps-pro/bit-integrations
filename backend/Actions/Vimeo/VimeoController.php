<?php

/**
 * Vimeo Integration
 */

namespace BitApps\Integrations\Actions\Vimeo;

use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Vimeo integration
 */
class VimeoController
{
    public const BASE_URL = 'https://api.vimeo.com';

    public const ACCEPT_HEADER = 'application/vnd.vimeo.*+json;version=3.4';

    public function vimeoAuthorize($requestParams)
    {
        if (empty($requestParams->token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $response = HttpHelper::get(self::BASE_URL . '/me', null, self::authHeader($requestParams->token));

        if (HttpHelper::$responseCode == 200) {
            wp_send_json_success(__('Authorization Successful', 'bit-integrations'), 200);

            return;
        }

        wp_send_json_error($response->error ?? ($response->message ?? __('Authorization Failed', 'bit-integrations')), 400);
    }

    public function refreshVideos($requestParams)
    {
        $this->refreshList($requestParams, '/me/videos');
    }

    public function refreshShowcases($requestParams)
    {
        $this->refreshList($requestParams, '/me/albums');
    }

    public function refreshFolders($requestParams)
    {
        $this->refreshList($requestParams, '/me/projects');
    }

    public function refreshChannels($requestParams)
    {
        $this->refreshList($requestParams, '/me/channels');
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $token              = $integrationDetails->token ?? '';
        $fieldMap           = $integrationDetails->field_map ?? '';
        $action             = $integrationDetails->mainAction ?? '';

        if (empty($token) || empty($action)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('token and action are required for %s api', 'bit-integrations'), 'Vimeo'));
        }

        $recordApiHelper = new RecordApiHelper($token, $integrationDetails, $integId);

        return $recordApiHelper->execute($integrationDetails, $fieldValues, $fieldMap, $action);
    }

    public static function authHeader($token)
    {
        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => self::ACCEPT_HEADER,
            'Content-Type'  => 'application/json',
        ];
    }

    private function refreshList($requestParams, $path)
    {
        if (empty($requestParams->token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $endpoint = self::BASE_URL . $path . '?per_page=100&fields=uri,name';
        $response = HttpHelper::get($endpoint, null, self::authHeader($requestParams->token));

        if (HttpHelper::$responseCode != 200 || empty($response->data)) {
            wp_send_json_error(__('Could not fetch the list from Vimeo', 'bit-integrations'), 400);
        }

        $formatted = [];
        foreach ($response->data as $item) {
            $formatted[] = [
                'id'   => substr(strrchr($item->uri, '/'), 1),
                'name' => $item->name,
            ];
        }

        wp_send_json_success($formatted, 200);
    }
}
