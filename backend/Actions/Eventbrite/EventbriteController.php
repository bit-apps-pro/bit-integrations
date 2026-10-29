<?php

namespace BitApps\Integrations\Actions\Eventbrite;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class EventbriteController
{
    private const MAX_PAGES = 10;

    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'Eventbrite',
        'fields'   => [],
    ];

    public function getOrganizations($queryParams)
    {
        wp_send_json_success(self::namedItems(self::fetchAll(self::requireClient($queryParams), '/users/me/organizations/', 'organizations')), 200);
    }

    public function getVenues($queryParams)
    {
        $client = self::requireClient($queryParams);
        $venues = [];

        foreach (self::organizationIds($client, $queryParams) as $organizationId) {
            foreach (self::fetchAll($client, '/organizations/' . rawurlencode($organizationId) . '/venues/', 'venues') as $venue) {
                $city = ApiResponse::getValue(ApiResponse::getValue($venue, 'address'), 'city');
                $name = (string) (ApiResponse::getValue($venue, 'name') ?? '');

                $venues[] = (object) [
                    'id'   => (string) ApiResponse::getValue($venue, 'id'),
                    'name' => $city ? $name . ' (' . $city . ')' : $name,
                ];
            }
        }

        wp_send_json_success($venues, 200);
    }

    public function getEvents($queryParams)
    {
        $client = self::requireClient($queryParams);
        $organizationId = self::param($queryParams, 'organization_id');

        if ($organizationId === '') {
            wp_send_json_error(__('Select an organization first', 'bit-integrations'), 400);
        }

        $events = [];
        $path = '/organizations/' . rawurlencode($organizationId) . '/events/?status=all&order_by=start_desc&show_series_parent=true';

        foreach (self::fetchAll($client, $path, 'events') as $event) {
            $name = (string) (ApiResponse::getValue(ApiResponse::getValue($event, 'name'), 'text') ?? ApiResponse::getValue($event, 'id'));
            $start = (string) (ApiResponse::getValue(ApiResponse::getValue($event, 'start'), 'local') ?? '');

            $events[] = (object) [
                'id'   => (string) ApiResponse::getValue($event, 'id'),
                'name' => $start !== '' ? $name . ' (' . substr($start, 0, 10) . ')' : $name,
            ];
        }

        wp_send_json_success($events, 200);
    }

    public function getTicketClasses($queryParams)
    {
        $client = self::requireClient($queryParams);
        $eventId = self::param($queryParams, 'event_id');

        if ($eventId === '') {
            wp_send_json_error(__('Select an event first', 'bit-integrations'), 400);
        }

        $ticketClasses = [];

        foreach (self::fetchAll($client, '/events/' . rawurlencode($eventId) . '/ticket_classes/', 'ticket_classes') as $ticketClass) {
            $ticketClasses[] = (object) [
                'id'   => (string) ApiResponse::getValue($ticketClass, 'id'),
                'name' => (string) (ApiResponse::getValue($ticketClass, 'display_name') ?: ApiResponse::getValue($ticketClass, 'name')),
            ];
        }

        wp_send_json_success($ticketClasses, 200);
    }

    public function getTicketGroups($queryParams)
    {
        $client = self::requireClient($queryParams);
        $organizationId = self::param($queryParams, 'organization_id');

        if ($organizationId === '') {
            wp_send_json_error(__('Select an organization first', 'bit-integrations'), 400);
        }

        $path = '/organizations/' . rawurlencode($organizationId) . '/ticket_groups/?status=live';

        wp_send_json_success(self::namedItems(self::fetchAll($client, $path, 'ticket_groups')), 200);
    }

    public function getCategories($queryParams)
    {
        wp_send_json_success(self::namedItems(self::fetchAll(self::requireClient($queryParams), '/categories/', 'categories')), 200);
    }

    public function getSubcategories($queryParams)
    {
        $client = self::requireClient($queryParams);
        $categoryId = self::param($queryParams, 'category_id');

        if ($categoryId === '') {
            wp_send_json_error(__('Select a category first', 'bit-integrations'), 400);
        }

        $response = $client->get('/categories/' . rawurlencode($categoryId) . '/');
        $failure = self::failureReason($response);

        if ($failure !== null) {
            wp_send_json_error($failure, 400);
        }

        $subcategories = $response->getBodyValue('subcategories');

        wp_send_json_success(self::namedItems(\is_array($subcategories) ? $subcategories : []), 200);
    }

    public function getFormats($queryParams)
    {
        wp_send_json_success(self::namedItems(self::fetchAll(self::requireClient($queryParams), '/formats/', 'formats')), 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return self::validationError($integId, __('Field map is required for Eventbrite api', 'bit-integrations'));
        }

        $client = self::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            return self::validationError($integId, __('An Eventbrite connection with a private token is required', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId, $client))->execute($fieldValues, $fieldMap);
    }

    public static function failureReason($response): ?string
    {
        if ($response->success()) {
            return null;
        }

        $description = $response->getBodyValue('error_description');

        if (\is_string($description) && $description !== '') {
            return $description;
        }

        return $response->getError() ?: __('Could not reach Eventbrite', 'bit-integrations');
    }

    private static function client($connectionId): ?ApiClient
    {
        $connection = AuthorizationFactory::getConnectionHandler($connectionId);

        if ($connection === null) {
            return null;
        }

        $apiClient = new ApiClient($connection);
        $apiClient->setBaseURL('https://www.eventbriteapi.com/v3');
        $apiClient->setHeaders(['Accept' => 'application/json']);

        return $apiClient;
    }

    private static function requireClient($queryParams): ApiClient
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if ($client === null) {
            wp_send_json_error(__('Select an Eventbrite connection first', 'bit-integrations'), 400);
        }

        return $client;
    }

    private static function fetchAll(ApiClient $client, string $path, string $key): array
    {
        $rows = [];
        $continuation = '';

        for ($page = 0; $page < self::MAX_PAGES; ++$page) {
            $url = $continuation === '' ? $path : $path . (strpos($path, '?') === false ? '?' : '&') . 'continuation=' . rawurlencode($continuation);
            $response = $client->get($url);
            $failure = self::failureReason($response);

            if ($failure !== null) {
                wp_send_json_error($failure, 400);
            }

            $items = $response->getBodyValue($key);
            $rows = array_merge($rows, \is_array($items) ? $items : []);

            $pagination = $response->getBodyValue('pagination');
            $continuation = (string) (ApiResponse::getValue($pagination, 'continuation') ?? '');

            if (!ApiResponse::getValue($pagination, 'has_more_items') || $continuation === '') {
                break;
            }
        }

        return $rows;
    }

    private static function organizationIds(ApiClient $client, $queryParams): array
    {
        $organizationId = self::param($queryParams, 'organization_id');

        if ($organizationId !== '') {
            return [$organizationId];
        }

        return array_map(
            static function ($organization) {
                return (string) ApiResponse::getValue($organization, 'id');
            },
            self::fetchAll($client, '/users/me/organizations/', 'organizations')
        );
    }

    private static function namedItems(array $items): array
    {
        return array_map(
            static function ($item) {
                return (object) [
                    'id'   => (string) ApiResponse::getValue($item, 'id'),
                    'name' => (string) (ApiResponse::getValue($item, 'name') ?? ApiResponse::getValue($item, 'id')),
                ];
            },
            $items
        );
    }

    private static function param($queryParams, string $key): string
    {
        $value = $queryParams->{$key} ?? '';

        return \is_scalar($value) ? trim((string) $value) : '';
    }

    private static function validationError($integId, $message)
    {
        $error = new WP_Error('REQ_FIELD_EMPTY', $message);
        LogHandler::save($integId, 'record', 'validation', $error);

        return $error;
    }
}
