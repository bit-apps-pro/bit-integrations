<?php

/**
 * Brilliant Directories Integration.
 */

namespace BitApps\Integrations\Actions\BrilliantDirectories;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

/**
 * Provide functionality for Brilliant Directories integration.
 */
class BrilliantDirectoriesController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'brilliant-directories',
        'fields'   => [
            'api_key'  => 'value',
            'site_url' => 'site_url',
        ],
    ];

    public function getMembershipPlans($queryParams)
    {
        $response = self::fetchList($queryParams, 'subscription_types/get');

        $plans = [];
        foreach ($response as $plan) {
            $plans[] = (object) [
                'planId'   => $plan->subscription_id ?? '',
                'planName' => $plan->subscription_name ?? '',
            ];
        }

        wp_send_json_success($plans, 200);
    }

    public function getTopCategories($queryParams)
    {
        $response = self::fetchList($queryParams, 'list_professions/get');

        $categories = [];
        foreach ($response as $category) {
            $categories[] = (object) [
                'categoryId'   => $category->profession_id ?? '',
                'categoryName' => $category->name ?? '',
            ];
        }

        wp_send_json_success($categories, 200);
    }

    public function getPostTypes($queryParams)
    {
        $response = self::fetchList($queryParams, 'data_categories/get');

        $postTypes = [];
        foreach ($response as $postType) {
            // `data_type` is required on create but is only exposed as a column of the
            // post type row, so both values ride in the option value.
            $postTypes[] = (object) [
                'postTypeId'   => ($postType->data_id ?? '') . ':' . ($postType->data_type ?? ''),
                'postTypeName' => $postType->data_name ?? '',
            ];
        }

        wp_send_json_success($postTypes, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $apiKey = $integrationDetails->api_key ?? ($integrationDetails->value ?? '');
        $siteUrl = $integrationDetails->site_url ?? '';

        if (empty($apiKey) || empty($siteUrl) || empty($fieldMap)) {
            $error = new WP_Error(
                'REQ_FIELD_EMPTY',
                __('API key, Site URL and field map are required for Brilliant Directories api', 'bit-integrations')
            );
            LogHandler::save($integId, 'record', 'validation', $error);

            return $error;
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiKey, $siteUrl);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    /**
     * BD returns `{ status, total, message: [...] }` on every list endpoint —
     * the rows always live in `message`, never in `data`.
     */
    private static function fetchList($queryParams, $path)
    {
        $apiKey = $queryParams->api_key ?? ($queryParams->value ?? '');
        $siteUrl = $queryParams->site_url ?? '';

        if (empty($apiKey) || empty($siteUrl)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = rtrim($siteUrl, '/') . '/api/v2/' . $path . '?limit=100';
        $headers = [
            'Accept'    => 'application/json',
            'X-Api-Key' => $apiKey,
        ];

        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);

        if (is_wp_error($apiResponse) || empty($apiResponse->message) || !\is_array($apiResponse->message)) {
            wp_send_json_error(
                $apiResponse->message ?? __('Could not fetch data from Brilliant Directories', 'bit-integrations'),
                400
            );
        }

        return $apiResponse->message;
    }
}
