<?php

namespace BitApps\Integrations\Actions\FollowUpBoss;

use BitApps\Integrations\Authorization\AuthorizationFactory;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Http\ApiResponse;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class FollowUpBossController
{
    private const BASE_URL = 'https://api.followupboss.com/v1';

    private const PAGE_SIZE = 100;

    private const MAX_PAGES = 5;

    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'FollowUpBoss',
        'fields'   => [],
    ];

    public function getUsers($queryParams)
    {
        self::sendOptions($queryParams, '/users', 'users', [self::class, 'personLabel']);
    }

    public function getStageNames($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/stages',
            'stages',
            static function (array $stage) {
                return (string) ($stage['name'] ?? '');
            },
            'name'
        );
    }

    public function getStages($queryParams)
    {
        self::sendOptions($queryParams, '/stages', 'stages', [self::class, 'nameLabel']);
    }

    public function getPonds($queryParams)
    {
        self::sendOptions($queryParams, '/ponds', 'ponds', [self::class, 'nameLabel']);
    }

    public function getTimeframes($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/timeframes',
            'timeframes',
            static function (array $timeframe) {
                return (string) ($timeframe['timeframe'] ?? '#' . ($timeframe['id'] ?? ''));
            }
        );
    }

    public function getActionPlans($queryParams)
    {
        self::sendOptions($queryParams, '/actionPlans', 'actionPlans', [self::class, 'nameLabel'], 'id', ['status' => 'Active']);
    }

    public function getAppointmentTypes($queryParams)
    {
        self::sendOptions($queryParams, '/appointmentTypes', 'appointmenttypes', [self::class, 'nameLabel']);
    }

    public function getAppointmentOutcomes($queryParams)
    {
        self::sendOptions($queryParams, '/appointmentOutcomes', 'appointmentoutcomes', [self::class, 'nameLabel']);
    }

    public function getEmailCampaigns($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/emCampaigns',
            'emCampaigns',
            static function (array $campaign) {
                return (string) (($campaign['name'] ?? '') ?: ($campaign['subject'] ?? '#' . ($campaign['id'] ?? '')));
            }
        );
    }

    public function getTeams($queryParams)
    {
        self::sendOptions($queryParams, '/teams', 'teams', [self::class, 'nameLabel']);
    }

    public function getGroups($queryParams)
    {
        self::sendOptions($queryParams, '/groups', 'groups', [self::class, 'nameLabel']);
    }

    public function getCustomFields($queryParams)
    {
        self::sendOptions(
            $queryParams,
            '/customFields',
            'customfields',
            static function (array $field) {
                return (string) ($field['label'] ?? $field['name'] ?? '');
            },
            'name'
        );
    }

    public function getDealStages($queryParams)
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if (\is_string($client)) {
            wp_send_json_error($client, 400);
        }

        $options = [];

        foreach (self::fetchAll($client, '/pipelines', 'pipelines') as $pipeline) {
            foreach ($pipeline['stages'] ?? [] as $stage) {
                $options[] = (object) ['id' => (string) ($stage['id'] ?? ''), 'name' => ($pipeline['name'] ?? '') . ': ' . ($stage['name'] ?? '')];
            }
        }

        wp_send_json_success($options, 200);
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
            return __('A Follow Up Boss connection is required. Select a connection.', 'bit-integrations');
        }

        $apiClient = new ApiClient($connection);
        $apiClient->setBaseURL(self::BASE_URL);
        $apiClient->setHeaders(['Accept' => 'application/json']);

        return $apiClient;
    }

    private static function sendOptions($queryParams, string $path, string $collection, callable $label, string $valueKey = 'id', array $query = [])
    {
        $client = self::client($queryParams->connection_id ?? 0);

        if (\is_string($client)) {
            wp_send_json_error($client, 400);
        }

        $options = [];

        foreach (self::fetchAll($client, $path, $collection, $query) as $record) {
            if (!isset($record[$valueKey])) {
                continue;
            }

            $options[] = (object) ['id' => (string) $record[$valueKey], 'name' => $label($record)];
        }

        wp_send_json_success($options, 200);
    }

    private static function fetchAll(ApiClient $client, string $path, string $collection, array $query = []): array
    {
        $records = [];
        $next = null;

        for ($page = 0; $page < self::MAX_PAGES; ++$page) {
            $pageQuery = ['limit' => self::PAGE_SIZE] + $query + ($next ? ['next' => $next] : []);
            $response = $client->get($path . '?' . http_build_query($pageQuery));
            $body = json_decode((string) wp_json_encode($response->getBody()), true);

            if (!$response->success() || !isset($body[$collection]) || !\is_array($body[$collection])) {
                wp_send_json_error(self::errorMessage($response, $body), 400);
            }

            $records = array_merge($records, $body[$collection]);
            $next = $body['_metadata']['next'] ?? null;

            if (empty($next)) {
                break;
            }
        }

        return $records;
    }

    private static function nameLabel(array $record): string
    {
        return (string) ($record['name'] ?? '#' . ($record['id'] ?? ''));
    }

    private static function personLabel(array $record): string
    {
        $email = $record['email'] ?? '';

        return self::nameLabel($record) . ($email !== '' ? ' (' . $email . ')' : '');
    }

    private static function errorMessage(ApiResponse $response, $body): string
    {
        if ($response->getStatus() === 401) {
            return __('Follow Up Boss rejected the API key. Check the connection.', 'bit-integrations');
        }

        $message = \is_array($body) ? ($body['errorMessage'] ?? '') : '';

        return \is_string($message) && $message !== ''
            ? $message
            : (string) $response->errorMessage(__('Cannot get the list from Follow Up Boss. Try again.', 'bit-integrations'));
    }
}
