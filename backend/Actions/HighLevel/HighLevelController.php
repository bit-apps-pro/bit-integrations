<?php

/**
 * HighLevel Integration
 */

namespace BitApps\Integrations\Actions\HighLevel;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for HighLevel integration
 */
class HighLevelController
{
    private const V2_HEADER_VERSION = '2021-07-28';
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'gohighlevel',
        'fields'   => [
            'api_key'     => 'token',
            'version'     => 'version',
            'location_id' => 'location_id',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function getCustomFields($requestsParams)
    {
        $apiKey = self::getApiKey($requestsParams);
        $version = self::getVersion($requestsParams);
        $headers = self::buildHeaders($apiKey, $version);

        $endpoint = 'https://rest.gohighlevel.com/v1/custom-fields';
        if ($version === 'v2') {
            $locationId = self::getLocationIdIfV2($requestsParams, $version);
            $endpoint = "https://services.leadconnectorhq.com/locations/{$locationId}/customFields";
        }

        $response = self::getOrError($endpoint, $headers);
        $rawCustomFields = self::ensureProperty($response, 'customFields', __('Custom fields fetching failed', 'bit-integrations'));

        $customFields = [];
        if (!empty($rawCustomFields) && \is_array($rawCustomFields)) {
            foreach ($rawCustomFields as $item) {
                if (!isset($item->id, $item->name, $item->dataType)) {
                    continue;
                }

                $customFields[] = (object) [
                    'key'      => $item->id . '_bihl_' . $item->dataType,
                    'label'    => $item->name,
                    'required' => false,
                ];
            }
        }

        wp_send_json_success($customFields, 200);
    }

    public static function getAllTags($requestsParams)
    {
        $apiKey = self::getApiKey($requestsParams);
        $version = self::getVersion($requestsParams);
        $headers = self::buildHeaders($apiKey, $version);

        $endpoint = 'https://rest.gohighlevel.com/v1/tags/';
        if ($version === 'v2') {
            $locationId = self::getLocationIdIfV2($requestsParams, $version);
            $endpoint = "https://services.leadconnectorhq.com/locations/{$locationId}/tags";
        }

        $response = self::getOrError($endpoint, $headers);
        $tags = self::ensureProperty($response, 'tags', __('Tags fetching failed', 'bit-integrations'));

        $tagList = [];
        if (!empty($tags) && \is_array($tags)) {
            foreach ($tags as $tag) {
                if (!isset($tag->name)) {
                    continue;
                }

                $tagList[] = (object) [
                    'label' => $tag->name,
                    'value' => $tag->name,
                ];
            }
        }

        wp_send_json_success($tagList, 200);
    }

    public static function getContacts($requestsParams)
    {
        $apiKey = self::getApiKey($requestsParams);
        $version = self::getVersion($requestsParams);
        $headers = self::buildHeaders($apiKey, $version);

        $endpoint = 'https://rest.gohighlevel.com/v1/contacts/?limit=100';
        if ($version === 'v2') {
            $locationId = self::getLocationIdIfV2($requestsParams, $version);
            $endpoint = "https://services.leadconnectorhq.com/contacts?limit=100&locationId={$locationId}";
        }

        $response = self::getOrError($endpoint, $headers);
        $contacts = self::ensureProperty($response, 'contacts', __('Contacts fetching failed', 'bit-integrations'));

        $contactList = [];
        if (!empty($contacts) && \is_array($contacts)) {
            foreach ($contacts as $contact) {
                if (!isset($contact->id)) {
                    continue;
                }

                $email = isset($contact->email) ? $contact->email : '';
                $name = isset($contact->contactName) ? $contact->contactName : '';

                $label = $email;
                if ($name !== '' && $email !== '') {
                    $label = "{$name} ({$email})";
                } elseif ($name !== '') {
                    $label = $name;
                }

                $contactList[] = (object) [
                    'label' => $label,
                    'value' => $contact->id,
                ];
            }
        }

        wp_send_json_success($contactList, 200);
    }

    public static function getUsers($requestsParams)
    {
        $apiKey = self::getApiKey($requestsParams);
        $version = self::getVersion($requestsParams);
        $headers = self::buildHeaders($apiKey, $version);

        $endpoint = 'https://rest.gohighlevel.com/v1/users';
        if ($version === 'v2') {
            $locationId = self::getLocationIdIfV2($requestsParams, $version);
            $endpoint = "https://services.leadconnectorhq.com/users/?locationId={$locationId}";
        }

        $response = self::getOrError($endpoint, $headers);
        $users = self::ensureProperty($response, 'users', __('Users fetching failed', 'bit-integrations'));

        $userList = [];
        if (!empty($users) && \is_array($users)) {
            foreach ($users as $user) {
                if (!isset($user->id)) {
                    continue;
                }

                $email = isset($user->email) ? (string) $user->email : '';
                $name = isset($user->name) ? (string) $user->name : '';

                $label = $email;
                if ($name !== '' && $email !== '') {
                    $label = "{$name} ({$email})";
                } elseif ($name !== '') {
                    $label = $name;
                }

                $userList[] = (object) [
                    'label' => $label,
                    'value' => $user->id,
                ];
            }
        }

        wp_send_json_success($userList, 200);
    }

    public static function getHLTasks($requestsParams)
    {
        $apiKey = self::getApiKey($requestsParams);
        $contactId = self::getStringParam($requestsParams, 'contact_id');
        self::requireNonEmpty($contactId);

        $version = self::getVersion($requestsParams);
        $headers = self::buildHeaders($apiKey, $version);

        $endpoint = 'https://rest.gohighlevel.com/v1/contacts/' . $contactId . '/tasks';
        if ($version === 'v2') {
            $locationId = self::getLocationIdIfV2($requestsParams, $version);
            $endpoint = "https://services.leadconnectorhq.com/contacts/{$contactId}/tasks?limit=100&location_id={$locationId}";
        }

        $response = self::getOrError($endpoint, $headers);
        $tasks = self::ensureProperty($response, 'tasks', __('Tasks fetching failed', 'bit-integrations'));

        $taskList = [];
        if (!empty($tasks) && \is_array($tasks)) {
            foreach ($tasks as $task) {
                if (!isset($task->id, $task->title)) {
                    continue;
                }
                $taskList[] = (object) [
                    'label' => $task->title,
                    'value' => $task->id,
                ];
            }
        }

        wp_send_json_success($taskList, 200);
    }

    public static function getPipelines($requestsParams)
    {
        $apiKey = self::getApiKey($requestsParams);
        $version = self::getVersion($requestsParams);
        $headers = self::buildHeaders($apiKey, $version);

        $endpoint = 'https://rest.gohighlevel.com/v1/pipelines';
        if ($version === 'v2') {
            $locationId = self::getLocationIdIfV2($requestsParams, $version);
            $endpoint = "https://services.leadconnectorhq.com/opportunities/pipelines?locationId={$locationId}";
        }

        $response = self::getOrError($endpoint, $headers);
        $pipelines = self::ensureProperty($response, 'pipelines', __('Pipelines fetching failed', 'bit-integrations'));

        $pipelineList = [];
        $stages = [];

        if (!empty($pipelines) && \is_array($pipelines)) {
            foreach ($pipelines as $pipeline) {
                if (!isset($pipeline->id, $pipeline->name)) {
                    continue;
                }

                $pipelineList[] = (object) [
                    'label' => $pipeline->name,
                    'value' => $pipeline->id,
                ];

                $stages[$pipeline->id] = isset($pipeline->stages) ? $pipeline->stages : [];
            }
        }

        wp_send_json_success(['pipelineList' => $pipelineList, 'stages' => $stages], 200);
    }

    public static function getOpportunities($requestsParams)
    {
        $apiKey = self::getApiKey($requestsParams);
        $version = self::getVersion($requestsParams);
        $headers = self::buildHeaders($apiKey, $version);

        $pipelineId = self::getStringParam($requestsParams, 'pipeline_id');

        $endpoint = 'https://rest.gohighlevel.com/v1/pipelines/' . $pipelineId . '/opportunities?limit=100';
        if ($version === 'v1') {
            self::requireNonEmpty($pipelineId);
        } else {
            $locationId = self::getLocationIdIfV2($requestsParams, $version);
            $endpoint = "https://services.leadconnectorhq.com/opportunities/search?location_id={$locationId}";
        }

        $response = self::getOrError($endpoint, $headers);
        $opportunities = self::ensureProperty($response, 'opportunities', __('Opportunities fetching failed', 'bit-integrations'));

        $opportunityList = [];
        if (!empty($opportunities) && \is_array($opportunities)) {
            foreach ($opportunities as $opportunity) {
                if (!isset($opportunity->id, $opportunity->name)) {
                    continue;
                }

                $opportunityList[] = (object) [
                    'label' => $opportunity->name,
                    'value' => $opportunity->id,
                ];
            }
        }

        wp_send_json_success($opportunityList, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $actions = (array) $integrationDetails->actions;

        $apiKey = self::getApiKey($integrationDetails);
        $version = self::getVersion($integrationDetails);
        $locationId = self::getLocationIdIfV2($integrationDetails, $version);
        $selectedTask = self::getStringParam($integrationDetails, 'selectedTask');

        if (empty($apiKey) || empty($fieldMap)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', \sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'HighLevel'));
        }

        if ($version === 'v2' && $locationId === '') {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', \sprintf(__('module, location_id is required for %s v2 api', 'bit-integrations'), 'HighLevel'));
        }

        $optionKeys = [
            'selectedTags'        => 'selectedTags',
            'selectedContact'     => 'selectedContact',
            'selectedTaskStatus'  => 'selectedTaskStatus',
            'selectedUser'        => 'selectedUser',
            'updateTaskId'        => 'updateTaskId',
            'selectedPipeline'    => 'selectedPipeline',
            'selectedStage'       => 'selectedStage',
            'selectedOpportunity' => 'selectedOpportunity',
        ];

        $selectedOptions = array_map(
            function ($key) use ($integrationDetails) {
                return self::getStringParam($integrationDetails, $key);
            },
            $optionKeys
        );

        $recordApiHelper = new RecordApiHelper($apiKey, $this->_integrationID, $version, $locationId);
        $highLevelApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $selectedOptions, $actions);

        if (is_wp_error($highLevelApiResponse)) {
            return $highLevelApiResponse;
        }

        return $highLevelApiResponse;
    }

    private static function getStringParam($requestsParams, string $key, string $default = ''): string
    {
        if (!isset($requestsParams->{$key})) {
            return $default;
        }

        return trim((string) $requestsParams->{$key});
    }

    private static function requireNonEmpty(string $value): void
    {
        if ($value === '') {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private static function getApiKey($requestsParams): string
    {
        $apiKey = self::getStringParam($requestsParams, 'api_key');
        self::requireNonEmpty($apiKey);

        return $apiKey;
    }

    private static function getVersion($requestsParams): string
    {
        $version = self::getStringParam($requestsParams, 'version', 'v1');

        return ($version === 'v2') ? 'v2' : 'v1';
    }

    private static function getLocationIdIfV2($requestsParams, string $version): string
    {
        if ($version !== 'v2') {
            return '';
        }

        $locationId = self::getStringParam($requestsParams, 'location_id');
        self::requireNonEmpty($locationId);

        return $locationId;
    }

    private static function buildHeaders(string $apiKey, string $version): array
    {
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept'        => 'application/json',
        ];

        if ($version === 'v2') {
            $headers['Version'] = self::V2_HEADER_VERSION;
        }

        return $headers;
    }

    private static function getOrError(string $endpoint, array $headers)
    {
        $response = HttpHelper::get($endpoint, null, $headers);

        if (empty($response) || !\is_object($response)) {
            wp_send_json_error('Unknown', 400);
        }

        return $response;
    }

    private static function ensureProperty($response, string $prop, string $errorMessage)
    {
        if (!isset($response->{$prop})) {
            wp_send_json_error($errorMessage, 400);
        }

        return $response->{$prop};
    }
}
