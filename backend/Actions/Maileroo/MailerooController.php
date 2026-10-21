<?php

namespace BitApps\Integrations\Actions\Maileroo;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class MailerooController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'Maileroo',
        'fields'   => [],
    ];

    public function getDomains($queryParams)
    {
        $data = self::fetch(self::requireClient($queryParams), '/domains?per_page=100');
        $domains = [];

        foreach ((array) ApiResponse::getValue($data, 'domains') as $domain) {
            $domains[] = (object) [
                'id'   => (string) ApiResponse::getValue($domain, 'id'),
                'name' => (string) ApiResponse::getValue($domain, 'domain_name'),
            ];
        }

        wp_send_json_success($domains, 200);
    }

    public function getTemplates($queryParams)
    {
        $templates = [];

        foreach ((array) self::fetch(self::requireClient($queryParams), '/templates') as $template) {
            $templates[] = (object) [
                'id'   => (string) ApiResponse::getValue($template, 'id'),
                'name' => (string) ApiResponse::getValue($template, 'template_name'),
            ];
        }

        wp_send_json_success($templates, 200);
    }

    public function getDedicatedIps($queryParams)
    {
        $data = self::fetch(self::requireClient($queryParams), '/dedicated-ips');
        $ipAddresses = [];

        foreach ((array) ApiResponse::getValue($data, 'ip_addresses') as $ipAddress) {
            $ipAddresses[] = (object) [
                'id'   => (string) ApiResponse::getValue($ipAddress, 'id'),
                'name' => (string) ApiResponse::getValue($ipAddress, 'ip_address'),
            ];
        }

        wp_send_json_success($ipAddresses, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $client = self::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('A Maileroo connection is required. Select a connection with an Account API key.', 'bit-integrations'));
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
        $apiClient->setBaseURL('https://api.maileroo.com/v1');
        $apiClient->setHeaders(['Accept' => 'application/json']);

        return $apiClient;
    }

    private static function requireClient($queryParams): ApiClient
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if ($client === null) {
            wp_send_json_error(__('No Maileroo connection is selected. Select a connection first.', 'bit-integrations'), 400);
        }

        return $client;
    }

    private static function fetch(ApiClient $client, string $path)
    {
        $response = $client->get($path);

        if (!$response->success()) {
            $error = ApiResponse::getValue($response->getBodyValue('error'), 'message');

            wp_send_json_error(\is_string($error) && $error !== '' ? $error : $response->errorMessage(__('Cannot connect to Maileroo. Try again.', 'bit-integrations')), 400);
        }

        return $response->getBodyValue('data');
    }
}
