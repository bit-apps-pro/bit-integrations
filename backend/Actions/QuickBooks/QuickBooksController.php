<?php

namespace BitApps\Integrations\Actions\QuickBooks;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class QuickBooksController
{
    private const MINOR_VERSION = '75';

    private const PAGE_SIZE = 1000;

    private const MAX_PAGES = 5;

    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'QuickBooks',
        'fields'   => [],
    ];

    public function getCustomers($queryParams)
    {
        self::sendOptions($queryParams, 'Customer', 'ORDERBY DisplayName', [self::class, 'nameLabel']);
    }

    public function getVendors($queryParams)
    {
        self::sendOptions($queryParams, 'Vendor', 'ORDERBY DisplayName', [self::class, 'nameLabel']);
    }

    public function getEmployees($queryParams)
    {
        self::sendOptions($queryParams, 'Employee', 'ORDERBY DisplayName', [self::class, 'nameLabel']);
    }

    public function getItems($queryParams)
    {
        self::sendOptions($queryParams, 'Item', "WHERE Type IN ('Service', 'NonInventory', 'Inventory') ORDERBY Name", [self::class, 'typedLabel']);
    }

    public function getAccounts($queryParams)
    {
        self::sendOptions($queryParams, 'Account', 'ORDERBY Name', [self::class, 'accountLabel']);
    }

    public function getTerms($queryParams)
    {
        self::sendOptions($queryParams, 'Term', '', [self::class, 'nameLabel']);
    }

    public function getPaymentMethods($queryParams)
    {
        self::sendOptions($queryParams, 'PaymentMethod', '', [self::class, 'nameLabel']);
    }

    public function getClasses($queryParams)
    {
        self::sendOptions($queryParams, 'Class', '', [self::class, 'nameLabel']);
    }

    public function getDepartments($queryParams)
    {
        self::sendOptions($queryParams, 'Department', '', [self::class, 'nameLabel']);
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

    /**
     * @param mixed $connectionId
     *
     * @return ApiClient|string
     */
    private static function client($connectionId)
    {
        $connection = AuthorizationFactory::getConnectionHandler($connectionId);

        if ($connection === null) {
            return __('A QuickBooks connection is required. Select a connection.', 'bit-integrations');
        }

        $authDetails = (array) ($connection->getAuthDetails() ?? []);
        $companyId = preg_replace('/\s+/', '', (string) ($authDetails['company_id'] ?? ''));

        if ($companyId === '') {
            return __('The connection has no Company ID. Add a new connection and enter the QuickBooks Company ID.', 'bit-integrations');
        }

        $host = ($authDetails['environment'] ?? '') === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        $apiClient = new ApiClient($connection);
        $apiClient->setBaseURL($host . '/v3/company/' . rawurlencode($companyId));
        $apiClient->setHeaders(['Accept' => 'application/json']);

        return $apiClient;
    }

    private static function sendOptions($queryParams, string $entity, string $orderBy, callable $label)
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if (\is_string($client)) {
            wp_send_json_error($client, 400);
        }

        $options = [];

        for ($page = 0; $page < self::MAX_PAGES; ++$page) {
            $query = trim('SELECT * FROM ' . $entity . ' ' . $orderBy) . ' STARTPOSITION ' . ($page * self::PAGE_SIZE + 1) . ' MAXRESULTS ' . self::PAGE_SIZE;
            $response = $client->get('/query?' . http_build_query(['query' => $query, 'minorversion' => self::MINOR_VERSION]));
            $body = json_decode((string) wp_json_encode($response->getBody()), true);

            if (!$response->success() || !isset($body['QueryResponse'])) {
                wp_send_json_error(self::errorMessage($response, $body), 400);
            }

            $records = $body['QueryResponse'][$entity] ?? [];

            foreach ($records as $record) {
                $options[] = (object) ['id' => (string) $record['Id'], 'name' => $label($record)];
            }

            if (\count($records) < self::PAGE_SIZE) {
                break;
            }
        }

        wp_send_json_success($options, 200);
    }

    private static function nameLabel(array $record): string
    {
        return (string) ($record['DisplayName'] ?? $record['FullyQualifiedName'] ?? $record['Name'] ?? '#' . $record['Id']);
    }

    private static function typedLabel(array $record): string
    {
        return self::nameLabel($record) . ' (' . ($record['Type'] ?? '') . ')';
    }

    private static function accountLabel(array $record): string
    {
        return self::nameLabel($record) . ' (' . ($record['AccountType'] ?? '') . ')';
    }

    private static function errorMessage(ApiResponse $response, $body): string
    {
        if (($body['Fault']['type'] ?? '') === 'AuthorizationFault' || isset($body['fault'])) {
            return __('QuickBooks rejected the connection. Check the Company ID and the environment, or connect again.', 'bit-integrations');
        }

        $message = $body['Fault']['Error'][0]['Detail'] ?? $body['Fault']['Error'][0]['Message'] ?? '';

        return \is_string($message) && $message !== ''
            ? $message
            : (string) $response->errorMessage(__('Cannot get the list from QuickBooks. Try again.', 'bit-integrations'));
    }
}
