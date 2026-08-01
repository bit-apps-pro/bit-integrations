<?php

/**
 * Asana Integration
 */

namespace BitApps\Integrations\Actions\Asana;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Asana integration
 */
class AsanaController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'asana',
        'fields'   => [
            'api_key' => 'token',
        ],
    ];

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://app.asana.com/api/1.0/';
    }

    public function getCustomFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $action = $fieldsRequestParams->action;
        $projectId = $fieldsRequestParams->project_id;
        if ($action == 'task') {
            $apiEndpoint = $this->apiEndpoint . 'projects/' . $projectId . '/custom_field_settings';
        }

        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);
        if (isset($response->data)) {
            foreach ($response->data as $customField) {
                $customFields[] = [
                    'key'      => $customField->custom_field->gid,
                    'label'    => $customField->custom_field->name,
                    'required' => false,
                ];
            }
            wp_send_json_success($customFields, 200);
        } else {
            wp_send_json_error(__('Custom field fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllTasks($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/tasks';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->tasks)) {
            foreach ($response->tasks as $task) {
                $tasks[] = [
                    'id'   => (string) $task->id,
                    'name' => $task->name
                ];
            }
            wp_send_json_success($tasks, 200);
        } else {
            wp_send_json_error(__('Task fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllProjects($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . 'projects';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!empty($response->data)) {
            foreach ($response->data as $project) {
                $projects[] = [
                    'id'   => $project->gid,
                    'name' => $project->name
                ];
            }
            wp_send_json_success($projects, 200);
        } else {
            wp_send_json_error(__('Projects fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllSections($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;

        $apiEndpoint = $this->apiEndpoint . 'projects/' . $fieldsRequestParams->selected_project . '/sections';
        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
        ];
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!empty($response->data)) {
            foreach ($response->data as $section) {
                $sections[] = [
                    'id'   => (string) $section->gid,
                    'name' => $section->name
                ];
            }
            wp_send_json_success($sections, 200);
        } else {
            wp_send_json_error(__('Sections fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authToken = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($authToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Asana'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $asanaApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($asanaApiResponse)) {
            return $asanaApiResponse;
        }

        return $asanaApiResponse;
    }
}
