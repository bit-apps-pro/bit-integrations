<?php

namespace BitApps\Integrations\Actions\Asana;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

class AsanaController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'asana',
        'fields'   => [
            'api_key' => 'token',
        ],
    ];

    private const PAGE_SIZE = 100;

    private const MAX_PAGES = 50;

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
        $action = $fieldsRequestParams->action ?? null;
        $projectId = $fieldsRequestParams->project_id ?? null;

        if ($action !== 'task' || empty($projectId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = $this->apiEndpoint . 'projects/' . rawurlencode($projectId) . '/custom_field_settings';
        $records = $this->fetchAllPages($apiEndpoint, $this->setHeaders($apiKey));

        if ($records === false) {
            wp_send_json_error(__('Custom field fetching failed', 'bit-integrations'), 400);
        }

        $customFields = [];
        foreach ($records as $customField) {
            if (empty($customField->custom_field->gid)) {
                continue;
            }

            $customFields[] = [
                'key'      => $customField->custom_field->gid,
                'label'    => $customField->custom_field->name ?? $customField->custom_field->gid,
                'required' => false,
            ];
        }

        wp_send_json_success($customFields, 200);
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

        $headers = $this->setHeaders($fieldsRequestParams->api_key);
        $workspaces = $this->fetchAllPages($this->apiEndpoint . 'workspaces', $headers);

        if (empty($workspaces)) {
            wp_send_json_error(__('Projects fetching failed', 'bit-integrations'), 400);
        }

        $showWorkspaceName = \count($workspaces) > 1;
        $projects = [];

        foreach ($workspaces as $workspace) {
            if (empty($workspace->gid)) {
                continue;
            }

            $apiEndpoint = $this->apiEndpoint . 'projects?workspace=' . rawurlencode($workspace->gid);
            $records = $this->fetchAllPages($apiEndpoint, $headers) ?: [];
            $suffix = $showWorkspaceName && !empty($workspace->name) ? ' (' . $workspace->name . ')' : '';

            foreach ($records as $project) {
                if (empty($project->gid)) {
                    continue;
                }

                $projects[] = [
                    'id'   => $project->gid,
                    'name' => ($project->name ?? $project->gid) . $suffix
                ];
            }
        }

        if (empty($projects)) {
            wp_send_json_error(__('Projects fetching failed', 'bit-integrations'), 400);
        }

        wp_send_json_success($projects, 200);
    }

    public function getAllSections($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $selectedProject = $fieldsRequestParams->selected_project ?? null;

        if (empty($selectedProject)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = $this->apiEndpoint . 'projects/' . rawurlencode($selectedProject) . '/sections';
        $records = $this->fetchAllPages($apiEndpoint, $this->setHeaders($apiKey));

        if (empty($records)) {
            wp_send_json_error(__('Sections fetching failed', 'bit-integrations'), 400);
        }

        $sections = [];
        foreach ($records as $section) {
            if (empty($section->gid)) {
                continue;
            }

            $sections[] = [
                'id'   => (string) $section->gid,
                'name' => $section->name ?? $section->gid
            ];
        }

        wp_send_json_success($sections, 200);
    }

    private function setHeaders($apiKey)
    {
        return ['Authorization' => 'Bearer ' . $apiKey];
    }

    private function fetchAllPages($apiEndpoint, $headers)
    {
        $records = [];
        $offset = null;
        $separator = strpos($apiEndpoint, '?') === false ? '?' : '&';

        for ($page = 0; $page < self::MAX_PAGES; $page++) {
            $url = $apiEndpoint . $separator . 'limit=' . self::PAGE_SIZE;
            if (!empty($offset)) {
                $url .= '&offset=' . rawurlencode($offset);
            }

            $response = HttpHelper::get($url, null, $headers);

            if (is_wp_error($response) || !isset($response->data) || !\is_array($response->data)) {
                return $page === 0 ? false : $records;
            }

            $records = array_merge($records, $response->data);
            $offset = $response->next_page->offset ?? null;

            if (empty($offset)) {
                break;
            }
        }

        return $records;
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
