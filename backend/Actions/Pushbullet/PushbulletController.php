<?php

namespace BitApps\Integrations\Actions\Pushbullet;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class PushbulletController
{
    private const MAX_PAGES = 10;

    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'Pushbullet',
        'fields'   => [],
    ];

    public function getDevices($queryParams)
    {
        $smsOnly = !empty($queryParams->sms_only);
        $devices = [];

        foreach (self::fetchAll(self::requireClient($queryParams), '/devices', 'devices') as $device) {
            if ($smsOnly && !filter_var(ApiResponse::getValue($device, 'has_sms'), FILTER_VALIDATE_BOOLEAN)) {
                continue;
            }

            $name = (string) (ApiResponse::getValue($device, 'nickname') ?? '');

            if ($name === '') {
                $name = trim(ApiResponse::getValue($device, 'manufacturer') . ' ' . ApiResponse::getValue($device, 'model'));
            }

            $devices[] = (object) [
                'id'   => (string) ApiResponse::getValue($device, 'iden'),
                'name' => $name !== '' ? $name : (string) ApiResponse::getValue($device, 'iden'),
            ];
        }

        wp_send_json_success($devices, 200);
    }

    public function getChannels($queryParams)
    {
        $channels = [];

        foreach (self::fetchAll(self::requireClient($queryParams), '/channels', 'channels') as $channel) {
            $tag = (string) ApiResponse::getValue($channel, 'tag');
            $name = (string) (ApiResponse::getValue($channel, 'name') ?? '');

            $channels[] = (object) [
                'id'   => $tag,
                'name' => $name !== '' ? $name . ' (' . $tag . ')' : $tag,
            ];
        }

        wp_send_json_success($channels, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $client = self::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('A Pushbullet connection with an access token is required', 'bit-integrations'));
            LogHandler::save($integId, 'record', 'validation', $error);

            return $error;
        }

        return (new RecordApiHelper($integrationDetails, $integId, $client))->execute($fieldValues, $integrationDetails->field_map ?? []);
    }

    private static function client($connectionId): ?ApiClient
    {
        $connection = AuthorizationFactory::getConnectionHandler($connectionId);

        if ($connection === null) {
            return null;
        }

        $apiClient = new ApiClient($connection);
        $apiClient->setBaseURL('https://api.pushbullet.com/v2');
        $apiClient->setHeaders(['Accept' => 'application/json']);

        return $apiClient;
    }

    private static function requireClient($queryParams): ApiClient
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if ($client === null) {
            wp_send_json_error(__('Select a Pushbullet connection first', 'bit-integrations'), 400);
        }

        return $client;
    }

    private static function fetchAll(ApiClient $client, string $path, string $key): array
    {
        $rows = [];
        $cursor = '';

        for ($page = 0; $page < self::MAX_PAGES; ++$page) {
            $query = ['active' => 'true'] + ($cursor === '' ? [] : ['cursor' => $cursor]);
            $response = $client->get($path . '?' . http_build_query($query));

            if (!$response->success()) {
                $error = ApiResponse::getValue($response->getBodyValue('error'), 'message');

                wp_send_json_error(\is_string($error) && $error !== '' ? $error : $response->errorMessage(__('Could not reach Pushbullet', 'bit-integrations')), 400);
            }

            $items = $response->getBodyValue($key);
            $rows = array_merge($rows, \is_array($items) ? $items : []);
            $cursor = (string) ($response->getBodyValue('cursor') ?? '');

            if ($cursor === '') {
                break;
            }
        }

        return $rows;
    }
}
