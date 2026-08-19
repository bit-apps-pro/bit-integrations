<?php

/**
 * Brilliant Directories Integration.
 */

namespace BitApps\Integrations\Actions\BrilliantDirectories;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class BrilliantDirectoriesController
{
    /**
     * Credentials are read off the connection by the client, so nothing needs
     * flattening onto flow_details or the request params. The slug is still declared —
     * client() passes it to getConnectionHandler(), which rejects another app's connection_id.
     */
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'BrilliantDirectories',
        'fields'   => [],
    ];

    public function getMembershipPlans($queryParams)
    {
        $plans = [];
        foreach (self::fetchList($queryParams, 'subscription_types/get') as $plan) {
            $plans[] = (object) [
                'planId'   => ApiResponse::getValue($plan, 'subscription_id') ?? '',
                'planName' => ApiResponse::getValue($plan, 'subscription_name') ?? '',
            ];
        }

        wp_send_json_success($plans, 200);
    }

    public function getTopCategories($queryParams)
    {
        $categories = [];
        foreach (self::fetchList($queryParams, 'list_professions/get') as $category) {
            $categories[] = (object) [
                'categoryId'   => ApiResponse::getValue($category, 'profession_id') ?? '',
                'categoryName' => ApiResponse::getValue($category, 'name') ?? '',
            ];
        }

        wp_send_json_success($categories, 200);
    }

    public function getPostTypes($queryParams)
    {
        $postTypes = [];
        foreach (self::fetchList($queryParams, 'data_categories/get') as $postType) {
            $postTypes[] = (object) [
                'postTypeId'   => (ApiResponse::getValue($postType, 'data_id') ?? '') . ':' . (ApiResponse::getValue($postType, 'data_type') ?? ''),
                'postTypeName' => ApiResponse::getValue($postType, 'data_name') ?? '',
            ];
        }

        wp_send_json_success($postTypes, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return self::validationError($integId, __('Field map is required for Brilliant Directories api', 'bit-integrations'));
        }

        $client = self::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            return self::validationError($integId, __('A Brilliant Directories connection with an API Key and Site URL is required', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId, $client))->execute($fieldValues, $fieldMap);
    }

    /**
     * BD answers HTTP 200 with `{"status":"error"}` on validation failures, so a 2xx
     * alone does not mean the call did anything. Null when the response is good.
     *
     * @param mixed $response
     */
    public static function failureReason($response): ?string
    {
        if (!$response->success()) {
            // ApiClient leaves the error null on a non-2xx, so the reason BD sent in the
            // body is the only one there is.
            return $response->getError()
                ?: self::bodyMessage($response)
                ?: __('Could not reach Brilliant Directories', 'bit-integrations');
        }

        if ($response->getBodyValue('status') !== 'error') {
            return null;
        }

        return self::bodyMessage($response) ?: __('Brilliant Directories rejected the request', 'bit-integrations');
    }

    /**
     * `message` carries the rows on a good list call and the reason on a bad one, so
     * only a string is a reason.
     *
     * @param mixed $response
     */
    private static function bodyMessage($response): ?string
    {
        $message = $response->getBodyValue('message');

        return \is_string($message) && $message !== '' ? $message : null;
    }

    private static function client($connectionId): ?ApiClient
    {
        $connection = AuthorizationFactory::getConnectionHandler($connectionId);

        if ($connection === null) {
            return null;
        }

        $apiClient = new ApiClient($connection);

        $siteUrl = $apiClient->getBaseURL();

        if ($siteUrl === '') {
            return null;
        }

        $apiClient->setBaseURL($siteUrl . '/api/v2');
        $apiClient->setHeaders(
            [
                'Accept'       => 'application/json',
                'Content-Type' => 'application/x-www-form-urlencoded',
            ]
        );

        return $apiClient;
    }

    /**
     * Rows live in `message` on every list endpoint, never in `data`.
     *
     * @param mixed $queryParams
     * @param mixed $path
     *
     * @return array<int, mixed>
     */
    private static function fetchList($queryParams, $path)
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if ($client === null) {
            wp_send_json_error(__('Select a connection with an API Key and Site URL first', 'bit-integrations'), 400);
        }

        $response = $client->get($path, ['limit' => 100]);
        $failure = self::failureReason($response);

        if ($failure !== null) {
            wp_send_json_error($failure, 400);
        }

        $rows = $response->getBodyValue('message');

        return \is_array($rows) ? $rows : [];
    }

    private static function validationError($integId, $message)
    {
        $error = new WP_Error('REQ_FIELD_EMPTY', $message);
        LogHandler::save($integId, 'record', 'validation', $error);

        return $error;
    }
}
