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

    private const PAGE_LIMIT = 100;

    private const PAGE_SAFETY_CAP = 50;

    public static function hefflCRMAuthorize($requestParams)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('API key is required', 'bit-integrations'), 400);
        }

        $response = HttpHelper::get(self::BASE_URL . '/leads?limit=1', null, self::buildHeaders($requestParams->api_key));

        if (is_wp_error($response)) {
            wp_send_json_error(__('Failed to connect to Heffl CRM: ', 'bit-integrations') . $response->get_error_message(), 400);
        }

        if (HttpHelper::$responseCode >= 200 && HttpHelper::$responseCode < 300) {
            wp_send_json_success(__('Authorization successful', 'bit-integrations'), 200);
        }

        wp_send_json_error(__('Invalid Heffl CRM API key', 'bit-integrations'), 400);
    }

    public static function refreshLeadSources($requestParams)
    {
        wp_send_json_success(self::fetchListItems($requestParams, '/leads/sources'), 200);
    }

    public static function refreshLeadStages($requestParams)
    {
        wp_send_json_success(self::fetchListItems($requestParams, '/leads/stages'), 200);
    }

    public static function refreshPipelines($requestParams)
    {
        wp_send_json_success(self::fetchListItems($requestParams, '/pipelines'), 200);
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

        if (is_wp_error($response)) {
            wp_send_json_error(__('Failed to connect to Heffl CRM: ', 'bit-integrations') . $response->get_error_message(), 400);
        }

        if (HttpHelper::$responseCode < 200 || HttpHelper::$responseCode >= 300) {
            wp_send_json_error(__('Failed to fetch pipeline stages', 'bit-integrations'), HttpHelper::$responseCode ?: 400);
        }

        $stages = \is_object($response) && !is_wp_error($response) && isset($response->stages) ? $response->stages : [];
        $items = [];

        foreach ($stages as $stage) {
            $stage = (object) $stage;
            $id = $stage->id ?? null;
            if ($id !== null) {
                $items[] = ['value' => (string) $id, 'label' => self::scalarLabel($stage->name ?? $stage->label ?? null, $id)];
            }
        }

        wp_send_json_success($items, 200);
    }

    public static function refreshClients($requestParams)
    {
        wp_send_json_success(
            self::fetchListItems($requestParams, '/clients', [self::class, 'clientLabel']),
            200
        );
    }

    public static function refreshLeads($requestParams)
    {
        wp_send_json_success(
            self::fetchListItems($requestParams, '/leads', [self::class, 'leadLabel']),
            200
        );
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key ?? '';
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap) || empty($apiKey)) {
            // translators: %s is the name of the integration.
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

    private static function fetchListItems($requestParams, $path, $labeler = null)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('API key is required', 'bit-integrations'), 400);
        }

        $headers = self::buildHeaders($requestParams->api_key);
        $items = [];
        $cursor = null;
        $safety = self::PAGE_SAFETY_CAP;

        do {
            $separator = strpos($path, '?') === false ? '?' : '&';
            $query = $separator . 'limit=' . self::PAGE_LIMIT . ($cursor ? '&cursor=' . rawurlencode($cursor) : '');
            $response = HttpHelper::get(self::BASE_URL . $path . $query, null, $headers);

            if (is_wp_error($response)) {
                wp_send_json_error(__('Failed to connect to Heffl CRM: ', 'bit-integrations') . $response->get_error_message(), 400);
            }

            if (HttpHelper::$responseCode < 200 || HttpHelper::$responseCode >= 300) {
                wp_send_json_error(__('Failed to fetch from Heffl CRM', 'bit-integrations'), HttpHelper::$responseCode ?: 400);
            }

            $list = self::extractList($response);

            foreach ($list as $item) {
                $item = (object) $item;
                $id = $item->id ?? null;
                if ($id === null) {
                    continue;
                }

                $label = $labeler ? \call_user_func($labeler, $item, $id) : self::defaultLabel($item, $id);
                $items[] = ['value' => (string) $id, 'label' => $label];
            }

            $cursor = self::nextCursor($response);
        } while ($cursor !== null && --$safety > 0);

        return $items;
    }

    private static function extractList($response)
    {
        if (\is_object($response) && !is_wp_error($response) && isset($response->items) && \is_array($response->items)) {
            return $response->items;
        }
        if (\is_array($response)) {
            return $response;
        }

        return [];
    }

    private static function nextCursor($response)
    {
        if (\is_object($response) && !is_wp_error($response) && !empty($response->hasMore) && !empty($response->nextCursor)) {
            return $response->nextCursor;
        }
    }

    private static function defaultLabel($item, $id)
    {
        return self::scalarLabel($item->name ?? $item->label ?? $item->title ?? null, $id);
    }

    private static function clientLabel($item, $id)
    {
        $name = $item->name ?? null;
        if (\is_string($name) && trim($name) !== '') {
            return $name;
        }

        $first = (string) ($item->firstName ?? '');
        $last = (string) ($item->lastName ?? '');
        $combined = trim($first . ' ' . $last);
        if ($combined !== '') {
            return $combined;
        }

        return '#' . $id;
    }

    private static function leadLabel($item, $id)
    {
        $name = $item->name ?? null;
        if (\is_string($name) && trim($name) !== '') {
            $number = isset($item->number) && $item->number !== '' ? ' (' . $item->number . ')' : '';

            return $name . $number;
        }

        return '#' . $id;
    }

    private static function scalarLabel($value, $id)
    {
        if (\is_string($value) && trim($value) !== '') {
            return $value;
        }

        return '#' . $id;
    }
}
