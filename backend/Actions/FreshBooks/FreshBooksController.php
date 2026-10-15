<?php

namespace BitApps\Integrations\Actions\FreshBooks;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class FreshBooksController
{
    private const MAX_CATEGORY_PAGES = 10;

    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'FreshBooks',
        'fields'   => [],
    ];

    public function getAccounts($queryParams)
    {
        $accounts = [];

        foreach (self::getMemberships(self::requireClient($queryParams)) as $membership) {
            $business = ApiResponse::getValue($membership, 'business');
            $accountId = ApiResponse::getValue($business, 'account_id');

            if (empty($accountId)) {
                continue;
            }

            $accounts[] = self::option($accountId, ApiResponse::getValue($business, 'name'));
        }

        wp_send_json_success($accounts, 200);
    }

    public function getBusinesses($queryParams)
    {
        $businesses = [];

        foreach (self::getMemberships(self::requireClient($queryParams)) as $membership) {
            $business = ApiResponse::getValue($membership, 'business');
            $businesses[] = self::option(ApiResponse::getValue($business, 'id'), ApiResponse::getValue($business, 'name'));
        }

        wp_send_json_success($businesses, 200);
    }

    public function getClients($queryParams)
    {
        $client = self::requireClient($queryParams);

        wp_send_json_success(self::clientOptions($client, self::requireParam($queryParams, 'account_id')), 200);
    }

    public function getBusinessClients($queryParams)
    {
        $client = self::requireClient($queryParams);
        $businessId = (string) self::requireParam($queryParams, 'business_id');
        $accountId = '';

        foreach (self::getMemberships($client) as $membership) {
            $business = ApiResponse::getValue($membership, 'business');

            if ((string) ApiResponse::getValue($business, 'id') === $businessId) {
                $accountId = (string) ApiResponse::getValue($business, 'account_id');

                break;
            }
        }

        if ($accountId === '') {
            wp_send_json_error(__('This business has no FreshBooks account. Select another business.', 'bit-integrations'), 400);
        }

        wp_send_json_success(self::clientOptions($client, $accountId), 200);
    }

    public function getCategories($queryParams)
    {
        $client = self::requireClient($queryParams);
        $path = self::accountPath(self::requireParam($queryParams, 'account_id'), '/expenses/categories');
        $categories = [];

        for ($page = 1; $page <= self::MAX_CATEGORY_PAGES; ++$page) {
            $result = self::getResult($client, $path, ['per_page' => 100, 'page' => $page]);
            $categories = array_merge($categories, (array) (ApiResponse::getValue($result, 'categories') ?? []));

            if ($page >= (int) ApiResponse::getValue($result, 'pages')) {
                break;
            }
        }

        $namesById = [];

        foreach ($categories as $category) {
            $namesById[(string) ApiResponse::getValue($category, 'categoryid')] = (string) ApiResponse::getValue($category, 'category');
        }

        $options = [];

        foreach ($categories as $category) {
            $name = (string) ApiResponse::getValue($category, 'category');
            $parentName = $namesById[(string) ApiResponse::getValue($category, 'parentid')] ?? '';
            $options[] = self::option(ApiResponse::getValue($category, 'categoryid'), $parentName !== '' ? $parentName . ' - ' . $name : $name);
        }

        wp_send_json_success($options, 200);
    }

    public function getStaff($queryParams)
    {
        $client = self::requireClient($queryParams);
        $result = self::getResult($client, self::accountPath(self::requireParam($queryParams, 'account_id'), '/users/staffs'), ['per_page' => 100]);
        $options = [];

        foreach ((array) (ApiResponse::getValue($result, 'staff') ?? []) as $staff) {
            $name = trim(ApiResponse::getValue($staff, 'fname') . ' ' . ApiResponse::getValue($staff, 'lname'));
            $options[] = self::option(ApiResponse::getValue($staff, 'id'), $name !== '' ? $name : ApiResponse::getValue($staff, 'email'));
        }

        wp_send_json_success($options, 200);
    }

    public function getVendors($queryParams)
    {
        $client = self::requireClient($queryParams);
        $result = self::getResult($client, self::accountPath(self::requireParam($queryParams, 'account_id'), '/bill_vendors/bill_vendors'), ['per_page' => 100]);
        $options = [];

        foreach ((array) (ApiResponse::getValue($result, 'bill_vendors') ?? []) as $vendor) {
            $options[] = self::option(ApiResponse::getValue($vendor, 'vendorid'), ApiResponse::getValue($vendor, 'vendor_name'));
        }

        wp_send_json_success($options, 200);
    }

    public function getTaxes($queryParams)
    {
        $client = self::requireClient($queryParams);
        $result = self::getResult($client, self::accountPath(self::requireParam($queryParams, 'account_id'), '/taxes/taxes'), ['per_page' => 100]);
        $options = [];

        foreach ((array) (ApiResponse::getValue($result, 'taxes') ?? []) as $tax) {
            $name = (string) ApiResponse::getValue($tax, 'name');
            $amount = (string) ApiResponse::getValue($tax, 'amount');
            $options[] = self::option(ApiResponse::getValue($tax, 'id'), $amount !== '' ? $name . ' (' . $amount . '%)' : $name);
        }

        wp_send_json_success($options, 200);
    }

    public function getInvoices($queryParams)
    {
        $client = self::requireClient($queryParams);
        $result = self::getResult($client, self::accountPath(self::requireParam($queryParams, 'account_id'), '/invoices/invoices'), ['per_page' => 100]);
        $options = [];

        foreach ((array) (ApiResponse::getValue($result, 'invoices') ?? []) as $invoice) {
            $label = array_filter([(string) ApiResponse::getValue($invoice, 'invoice_number'), (string) ApiResponse::getValue($invoice, 'current_organization')]);
            $options[] = self::option(ApiResponse::getValue($invoice, 'id'), implode(' - ', $label));
        }

        wp_send_json_success($options, 200);
    }

    public function getProjects($queryParams)
    {
        $client = self::requireClient($queryParams);
        $body = self::getBody($client, self::businessPath('projects', self::requireParam($queryParams, 'business_id'), '/projects'), ['per_page' => 100]);
        $options = [];

        foreach ((array) (ApiResponse::getValue($body, 'projects') ?? []) as $project) {
            $options[] = self::option(ApiResponse::getValue($project, 'id'), ApiResponse::getValue($project, 'title'));
        }

        wp_send_json_success($options, 200);
    }

    public function getServices($queryParams)
    {
        $client = self::requireClient($queryParams);
        $body = self::getBody($client, self::businessPath('comments', self::requireParam($queryParams, 'business_id'), '/services'), ['per_page' => 100]);
        $options = [];

        foreach ((array) (ApiResponse::getValue($body, 'services') ?? []) as $service) {
            if ((int) ApiResponse::getValue($service, 'vis_state') === 1) {
                continue;
            }

            $options[] = self::option(ApiResponse::getValue($service, 'id'), ApiResponse::getValue($service, 'name'));
        }

        wp_send_json_success($options, 200);
    }

    public function getTeamMembers($queryParams)
    {
        $client = self::requireClient($queryParams);
        $businessId = rawurlencode((string) self::requireParam($queryParams, 'business_id'));
        $body = self::getBody($client, '/auth/api/v1/businesses/' . $businessId . '/team_members', ['active' => 'true']);
        $options = [];

        foreach ((array) (ApiResponse::getValue($body, 'response') ?? []) as $member) {
            $identityId = ApiResponse::getValue($member, 'identity_id');

            if (empty($identityId)) {
                continue;
            }

            $name = trim(ApiResponse::getValue($member, 'first_name') . ' ' . ApiResponse::getValue($member, 'last_name'));
            $options[] = self::option($identityId, $name !== '' ? $name : ApiResponse::getValue($member, 'email'));
        }

        wp_send_json_success($options, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $client = self::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('A FreshBooks connection is required. Select a connection.', 'bit-integrations'));
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
        $apiClient->setBaseURL('https://api.freshbooks.com');
        $apiClient->setHeaders(['Accept' => 'application/json', 'Api-Version' => 'alpha']);

        return $apiClient;
    }

    private static function requireClient($queryParams): ApiClient
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if ($client === null) {
            wp_send_json_error(__('Select a FreshBooks connection first.', 'bit-integrations'), 400);
        }

        return $client;
    }

    private static function requireParam($queryParams, string $key)
    {
        $value = $queryParams->{$key} ?? '';

        if ($value === '' || $value === null) {
            $message = $key === 'business_id'
                ? __('Select a FreshBooks business first.', 'bit-integrations')
                : __('Select a FreshBooks account first.', 'bit-integrations');

            wp_send_json_error($message, 400);
        }

        return $value;
    }

    private static function getBody(ApiClient $client, string $path, array $query = [])
    {
        $response = $client->get($path . (empty($query) ? '' : '?' . http_build_query($query)));

        if (!$response->success()) {
            wp_send_json_error(self::errorMessage($response), 400);
        }

        return $response->getBody();
    }

    private static function getResult(ApiClient $client, string $path, array $query = [])
    {
        return ApiResponse::getValue(ApiResponse::getValue(self::getBody($client, $path, $query), 'response'), 'result');
    }

    private static function getMemberships(ApiClient $client): array
    {
        $response = ApiResponse::getValue(self::getBody($client, '/auth/api/v1/users/me'), 'response');

        return (array) (ApiResponse::getValue($response, 'business_memberships') ?? []);
    }

    private static function clientOptions(ApiClient $client, $accountId): array
    {
        $result = self::getResult($client, self::accountPath($accountId, '/users/clients'), ['per_page' => 100]);
        $options = [];

        foreach ((array) (ApiResponse::getValue($result, 'clients') ?? []) as $freshBooksClient) {
            $name = (string) ApiResponse::getValue($freshBooksClient, 'organization');

            if ($name === '') {
                $name = trim(ApiResponse::getValue($freshBooksClient, 'fname') . ' ' . ApiResponse::getValue($freshBooksClient, 'lname'));
            }

            if ($name === '') {
                $name = (string) ApiResponse::getValue($freshBooksClient, 'email');
            }

            $options[] = self::option(ApiResponse::getValue($freshBooksClient, 'id'), $name);
        }

        return $options;
    }

    private static function accountPath($accountId, string $path): string
    {
        return '/accounting/account/' . rawurlencode((string) $accountId) . $path;
    }

    private static function businessPath(string $prefix, $businessId, string $path): string
    {
        return '/' . $prefix . '/business/' . rawurlencode((string) $businessId) . $path;
    }

    private static function option($id, $name)
    {
        $id = (string) $id;
        $name = trim((string) $name);

        return (object) ['id' => $id, 'name' => $name !== '' ? $name : '#' . $id];
    }

    private static function errorMessage(ApiResponse $response): string
    {
        $body = $response->getBody();
        $errors = ApiResponse::getValue(ApiResponse::getValue($body, 'response'), 'errors');
        $message = \is_array($errors) && isset($errors[0]) ? ApiResponse::getValue($errors[0], 'message') : null;

        if (!\is_string($message) || $message === '') {
            $message = ApiResponse::getValue($body, 'message') ?? ApiResponse::getValue($body, 'error_description') ?? ApiResponse::getValue($body, 'error');
        }

        return \is_string($message) && $message !== ''
            ? $message
            : (string) $response->errorMessage(__('Cannot get the list from FreshBooks. Try again.', 'bit-integrations'));
    }
}
