<?php

/**
 * Flodesk Integration.
 */

namespace BitApps\Integrations\Actions\Flodesk;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class FlodeskController
{
    /**
     * Flodesk authenticates with HTTP Basic using the API key as the username and an
     * empty password, so the key maps onto the connection's username field.
     */
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'Flodesk',
        'fields'   => [
            'api_key' => 'username',
        ],
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

    /**
     * Flodesk rejects a segment without a colour and only accepts one from its own
     * palette, so the list has to come from the API rather than a hardcoded enum.
     */
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

    /**
     * @param mixed $response
     */
    public static function failureReason($response): ?string
    {
        if ($response->success()) {
            return null;
        }

        return $response->getError()
            ?: self::bodyMessage($response)
            ?: __('Could not reach Flodesk', 'bit-integrations');
    }

    /**
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
        $apiClient->setBaseURL('https://api.flodesk.com/v1');
        $apiClient->setHeaders(
            [
                'Accept'       => 'application/json',
                'Content-Type' => 'application/json',
                // Flodesk's docs list a User-Agent as required.
                'User-Agent'   => 'Bit Integrations (https://bitapps.pro)',
            ]
        );

        return $apiClient;
    }

    /**
     * Paged endpoints wrap the rows in `data`; `custom-fields/all` and `segments/colors`
     * answer with a bare array.
     *
     * @param mixed $queryParams
     * @param mixed $path
     *
     * @return array<int, mixed>
     */
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

        if (\is_array($body) && isset($body['data']) && \is_array($body['data'])) {
            return $body['data'];
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
