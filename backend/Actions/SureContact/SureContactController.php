<?php

/**
 * SureContact Integration.
 */

namespace BitApps\Integrations\Actions\SureContact;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class SureContactController
{
    /**
     * Credentials are read off the connection by the client, so nothing needs
     * flattening onto flow_details or the request params. The slug is still declared —
     * client() passes it to getConnectionHandler(), which rejects another app's connection_id.
     */
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'SureContact',
        'fields'   => [],
    ];

    public function getLists($queryParams)
    {
        $lists = [];

        foreach (self::fetchList($queryParams, 'lists') as $list) {
            $lists[] = (object) [
                'listId'   => ApiResponse::getValue($list, 'uuid') ?? '',
                'listName' => ApiResponse::getValue($list, 'name') ?? '',
            ];
        }

        wp_send_json_success($lists, 200);
    }

    public function getTags($queryParams)
    {
        $tags = [];

        foreach (self::fetchList($queryParams, 'tags') as $tag) {
            $tags[] = (object) [
                'tagId'   => ApiResponse::getValue($tag, 'uuid') ?? '',
                'tagName' => ApiResponse::getValue($tag, 'name') ?? '',
            ];
        }

        wp_send_json_success($tags, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return self::validationError($integId, __('Field map is required for SureContact api', 'bit-integrations'));
        }

        $client = self::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            return self::validationError($integId, __('A SureContact connection with an API Key is required', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId, $client))->execute($fieldValues, $fieldMap);
    }

    /**
     * Null when the response is good, otherwise the reason to surface in the log.
     *
     * @param mixed $response
     */
    public static function failureReason($response): ?string
    {
        if (!$response->success()) {
            return $response->getError()
                ?: self::bodyMessage($response)
                ?: __('Could not reach SureContact', 'bit-integrations');
        }

        return null;
    }

    /**
     * SureContact returns a validation envelope as `{ message, errors }`; the message is
     * the only human-readable part.
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
        $apiClient->setBaseURL('https://api.surecontact.com/api/v1/public');
        $apiClient->setHeaders(
            [
                'Accept'       => 'application/json',
                'Content-Type' => 'application/json',
            ]
        );

        return $apiClient;
    }

    /**
     * Every SureContact collection returns its rows under `data`.
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
            wp_send_json_error(__('Select a connection with an API Key first', 'bit-integrations'), 400);
        }

        // A GET payload is sent as a body, not a query string, so the limit goes on the url.
        $response = $client->get($path . '?per_page=100');
        $failure = self::failureReason($response);

        if ($failure !== null) {
            wp_send_json_error($failure, 400);
        }

        $rows = $response->getBodyValue('data');

        return \is_array($rows) ? $rows : [];
    }

    private static function validationError($integId, $message)
    {
        $error = new WP_Error('REQ_FIELD_EMPTY', $message);
        LogHandler::save($integId, 'record', 'validation', $error);

        return $error;
    }
}
