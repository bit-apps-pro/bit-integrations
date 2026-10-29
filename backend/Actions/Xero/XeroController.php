<?php

namespace BitApps\Integrations\Actions\Xero;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class XeroController
{
    private const API_URL = 'https://api.xero.com/api.xro/2.0';

    private const CONNECTIONS_URL = 'https://api.xero.com/connections';

    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'Xero',
        'fields'   => [],
    ];

    public function getContacts($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/Contacts',
            ['order' => 'Name ASC', 'summaryOnly' => 'true', 'where' => 'ContactStatus=="ACTIVE"'],
            'Contacts',
            static function ($record) {
                return ['id' => $record['ContactID'], 'name' => trim(($record['Name'] ?? '') . (empty($record['EmailAddress']) ? '' : ' (' . $record['EmailAddress'] . ')'))];
            }
        );
    }

    public function getAccountCodes($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/Accounts',
            ['order' => 'Code ASC', 'where' => 'Status=="ACTIVE"'],
            'Accounts',
            static function ($record) {
                return empty($record['Code']) ? null : ['id' => $record['Code'], 'name' => $record['Code'] . ' - ' . ($record['Name'] ?? '') . ' (' . ($record['Type'] ?? '') . ')'];
            }
        );
    }

    public function getBankAccounts($queryParams)
    {
        self::sendOptions($queryParams, '/Accounts', ['order' => 'Name ASC', 'where' => 'Status=="ACTIVE" AND Type=="BANK"'], 'Accounts', [self::class, 'accountIdOption']);
    }

    public function getItems($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/Items',
            ['order' => 'Code ASC'],
            'Items',
            static function ($record) {
                return ['id' => $record['Code'], 'name' => trim($record['Code'] . ' - ' . ($record['Name'] ?? ''), ' -')];
            }
        );
    }

    public function getTaxRates($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/TaxRates',
            ['where' => 'Status=="ACTIVE"'],
            'TaxRates',
            static function ($record) {
                return ['id' => $record['TaxType'], 'name' => ($record['Name'] ?? $record['TaxType']) . ' (' . $record['TaxType'] . ')'];
            }
        );
    }

    public function getCurrencies($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/Currencies',
            [],
            'Currencies',
            static function ($record) {
                return ['id' => $record['Code'], 'name' => trim($record['Code'] . ' - ' . ($record['Description'] ?? ''), ' -')];
            }
        );
    }

    public function getBrandingThemes($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/BrandingThemes',
            [],
            'BrandingThemes',
            static function ($record) {
                return ['id' => $record['BrandingThemeID'], 'name' => $record['Name'] ?? $record['BrandingThemeID']];
            }
        );
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $client = self::client($integrationDetails->connection_id ?? 0);

        if (\is_string($client)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', $client);
            LogHandler::save($integId, 'record', 'validation', $error);

            return $error;
        }

        return (new RecordApiHelper($integrationDetails, $integId, $client))->execute($fieldValues, $integrationDetails->field_map ?? []);
    }

    private static function accountIdOption($record)
    {
        return ['id' => $record['AccountID'], 'name' => trim(($record['Code'] ?? '') . ' - ' . ($record['Name'] ?? ''), ' -') . ' (' . ($record['Type'] ?? '') . ')'];
    }

    /**
     * @param mixed $connectionId
     *
     * @return ApiClient|string
     */
    private static function client($connectionId)
    {
        $connection = AuthorizationFactory::getConnectionHandler($connectionId);

        if ($connection === null) {
            return __('A Xero connection is required. Select a connection.', 'bit-integrations');
        }

        $authDetails = (array) ($connection->getAuthDetails() ?? []);
        $tenantId = (string) ($authDetails['tenant_id'] ?? '');

        if ($tenantId === '') {
            $tenantId = self::findOrganisation($connection, (string) ($authDetails['access_token'] ?? ''));

            if ($tenantId === '') {
                return __('Xero has no organisation for this connection. Connect again and select an organisation.', 'bit-integrations');
            }

            $connection->updateAuthDetails(['tenant_id' => $tenantId] + (array) ($connection->getAuthDetails() ?? []));
        }

        $apiClient = new ApiClient($connection);
        $apiClient->setBaseURL(self::API_URL);
        $apiClient->setHeaders(['Accept' => 'application/json', 'xero-tenant-id' => $tenantId]);

        return $apiClient;
    }

    // The consent screen can add several organisations; the token's auth event names the ones picked for this connection.
    private static function findOrganisation($connection, string $accessToken): string
    {
        $parts = explode('.', $accessToken);
        $claims = \count($parts) === 3 ? json_decode((string) base64_decode(strtr($parts[1], '-_', '+/')), true) : null;
        $authEventId = \is_array($claims) ? (string) ($claims['authentication_event_id'] ?? '') : '';

        $client = new ApiClient($connection);
        $client->setBaseURL(self::CONNECTIONS_URL);
        $client->setHeaders(['Accept' => 'application/json']);

        foreach ($authEventId === '' ? [''] : ['?authEventId=' . rawurlencode($authEventId), ''] as $query) {
            $organisations = json_decode((string) wp_json_encode($client->get($query)->getBody()), true);

            foreach (\is_array($organisations) ? $organisations : [] as $organisation) {
                if (($organisation['tenantType'] ?? '') === 'ORGANISATION' && !empty($organisation['tenantId'])) {
                    return (string) $organisation['tenantId'];
                }
            }
        }

        return '';
    }

    private static function sendOptions($queryParams, string $path, array $query, string $collection, callable $toOption)
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if (\is_string($client)) {
            wp_send_json_error($client, 400);
        }

        $response = $client->get($path . (empty($query) ? '' : '?' . http_build_query($query)));
        $body = json_decode((string) wp_json_encode($response->getBody()), true);

        if (!$response->success() || !isset($body[$collection])) {
            wp_send_json_error($body['Detail'] ?? $body['Message'] ?? $response->getError() ?? __('Xero did not return the list. Try again.', 'bit-integrations'), 400);
        }

        wp_send_json_success(array_values(array_filter(array_map($toOption, $body[$collection]))), 200);
    }
}
