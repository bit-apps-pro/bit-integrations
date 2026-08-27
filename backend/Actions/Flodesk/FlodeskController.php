<?php

namespace BitApps\Integrations\Actions\Flodesk;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class FlodeskController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'Flodesk',
        'fields'   => [],
    ];

    public function getSegments($queryParams)
    {
        $segments = [];

        foreach (self::fetchList($queryParams, 'segments') as $segment) {
            $segments[] = (object) [
                'segmentId'   => ApiResponse::getValue($segment, 'id') ?? '',
                'segmentName' => ApiResponse::getValue($segment, 'name') ?? '',
            ];
        }

        wp_send_json_success($segments, 200);
    }

    public function getWorkflows($queryParams)
    {
        $workflows = [];

        foreach (self::fetchList($queryParams, 'workflows', ['perPage' => 100]) as $workflow) {
            $workflows[] = (object) [
                'workflowId'   => ApiResponse::getValue($workflow, 'id') ?? '',
                'workflowName' => ApiResponse::getValue($workflow, 'name') ?? '',
            ];
        }

        wp_send_json_success($workflows, 200);
    }

    public function getCustomFields($queryParams)
    {
        $fields = [];

        foreach (self::fetchList($queryParams, 'custom-fields/all') as $field) {
            $fields[] = (object) [
                'fieldKey'   => ApiResponse::getValue($field, 'key') ?? '',
                'fieldLabel' => ApiResponse::getValue($field, 'label') ?? '',
            ];
        }

        wp_send_json_success($fields, 200);
    }

    public function getSegmentColors($queryParams)
    {
        $colors = [];

        foreach (self::fetchList($queryParams, 'segments/colors') as $color) {
            if (\is_string($color) && $color !== '') {
                $colors[] = (object) ['colorCode' => $color, 'colorName' => $color];
            }
        }

        wp_send_json_success($colors, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return self::validationError($integId, __('Field map is required for Flodesk api', 'bit-integrations'));
        }

        $client = self::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            return self::validationError($integId, __('A Flodesk connection with an API Key is required', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId, $client))->execute($fieldValues, $fieldMap);
    }

    private static function failureReason($response): ?string
    {
        if ($response->success()) {
            return null;
        }

        // ApiClient leaves the error null on a non-2xx, so the reason Flodesk sent in
        // the body is the only one there is.
        $message = $response->getBodyValue('message');

        return $response->getError()
            ?: (\is_string($message) && $message !== '' ? $message : null)
            ?: __('Could not reach Flodesk', 'bit-integrations');
    }

    private static function client($connectionId): ?ApiClient
    {
        $connection = AuthorizationFactory::getConnectionHandler($connectionId);

        if ($connection === null) {
            return null;
        }

        $apiClient = new ApiClient($connection);
        $apiClient->setBaseURL('https://api.flodesk.com/v1');
        $apiClient->setHeaders(
            [
                'Content-Type' => 'application/json',
                'User-Agent'   => 'Bit Integrations (https://bit-integrations.com)',
            ]
        );

        return $apiClient;
    }

    private static function fetchList($queryParams, $path, array $payload = ['per_page' => 100])
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if ($client === null) {
            wp_send_json_error(__('Select a connection with an API Key first', 'bit-integrations'), 400);
        }

        $response = $client->get($path, $payload);
        $failure = self::failureReason($response);

        if ($failure !== null) {
            wp_send_json_error($failure, 400);
        }

        $body = $response->getBody();

        if (\is_object($body)) {
            $body = (array) $body;
        }

        if (\is_array($body) && isset($body['data'])) {
            return (array) $body['data'];
        }

        return \is_array($body) ? $body : [];
    }

    private static function validationError($integId, $message)
    {
        $error = new WP_Error('REQ_FIELD_EMPTY', $message);
        LogHandler::save($integId, 'record', 'validation', $error);

        return $error;
    }
}
