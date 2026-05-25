<?php

/**
 * Heffl CRM Integration
 */

namespace BitApps\Integrations\Actions\HefflCRM;

use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Heffl CRM integration
 */
class HefflCRMController
{
    private const BASE_URL = 'https://api.heffl.com/api/v1';

    public static function hefflCRMAuthorize($requestParams)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('API key is required', 'bit-integrations'), 400);
        }

        HttpHelper::get(self::BASE_URL . '/leads?limit=1', null, self::buildHeaders($requestParams->api_key));

        if (HttpHelper::$responseCode >= 200 && HttpHelper::$responseCode < 300) {
            wp_send_json_success(__('Authorization successful', 'bit-integrations'), 200);
        }

        wp_send_json_error(__('Invalid Heffl CRM API key', 'bit-integrations'), 400);
    }

    public static function refreshLeadSources($requestParams)
    {
        wp_send_json_success(self::fetchOptions($requestParams, '/leads/sources'), 200);
    }

    public static function refreshLeadStages($requestParams)
    {
        wp_send_json_success(self::fetchOptions($requestParams, '/leads/stages'), 200);
    }

    public static function refreshPipelines($requestParams)
    {
        wp_send_json_success(self::fetchOptions($requestParams, '/pipelines'), 200);
    }

    public static function refreshPipelineStages($requestParams)
    {
        if (empty($requestParams->pipelineId)) {
            wp_send_json_success([], 200);
        }

        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('API key is required', 'bit-integrations'), 400);
        }

        $response = HttpHelper::get(
            self::BASE_URL . '/pipelines/' . rawurlencode($requestParams->pipelineId),
            null,
            self::buildHeaders($requestParams->api_key)
        );

        if (HttpHelper::$responseCode < 200 || HttpHelper::$responseCode >= 300) {
            wp_send_json_error(__('Failed to fetch pipeline stages', 'bit-integrations'), HttpHelper::$responseCode ?: 400);
        }

        $stages = \is_object($response) && isset($response->stages) ? $response->stages : [];
        $items = [];

        foreach ($stages as $stage) {
            $stage = (object) $stage;
            $id = $stage->id ?? null;
            if ($id !== null) {
                $items[] = ['value' => (string) $id, 'label' => $stage->name ?? $stage->label ?? ('#' . $id)];
            }
        }

        wp_send_json_success($items, 200);
    }

    public static function refreshClients($requestParams)
    {
        wp_send_json_success(self::fetchOptions($requestParams, '/clients'), 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key ?? '';
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap) || empty($apiKey)) {
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('API key and field map are required for %s api', 'bit-integrations'), 'Heffl CRM'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    public static function buildHeaders($apiKey)
    {
        return [
            'x-api-key'    => $apiKey,
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
        ];
    }

    private static function fetchOptions($requestParams, $path)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('API key is required', 'bit-integrations'), 400);
        }

        $response = HttpHelper::get(self::BASE_URL . $path, null, self::buildHeaders($requestParams->api_key));
        error_log('Heffl CRM API Response: ' . print_r($response, true));
        if (HttpHelper::$responseCode < 200 || HttpHelper::$responseCode >= 300) {
            wp_send_json_error(__('Failed to fetch from Heffl CRM', 'bit-integrations'), HttpHelper::$responseCode ?: 400);
        }

        $list = [];
        if (\is_object($response) && isset($response->items)) {
            $list = $response->items;
        } elseif (\is_array($response)) {
            $list = $response;
        }

        $items = [];
        foreach ($list as $item) {
            $item = (object) $item;
            $id = $item->id ?? null;
            $name = $item->name ?? $item->label ?? $item->title ?? ('#' . $id);

            if (\is_object($name) || \is_array($name)) {
                $name = '#' . $id;
            }

            if ($id !== null) {
                $items[] = ['value' => (string) $id, 'label' => (string) $name];
            }
        }

        return $items;
    }
}
