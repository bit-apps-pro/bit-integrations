<?php

/**
 * EmailOctopus Integration
 */

namespace BitApps\Integrations\Actions\EmailOctopus;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for EmailOctopus integration
 */
class EmailOctopusController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'emailoctopus',
        'fields'   => [
            'auth_token' => 'token',
        ],
    ];

    protected $_defaultHeader;

    public function fetchAllLists($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->auth_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->auth_token;
        $apiEndpoint = 'https://emailoctopus.com/api/1.6/lists?api_key=' . $apiKey;
        $response = HttpHelper::get($apiEndpoint, null, null);

        if (!isset($response->error)) {
            $lists = [];
            foreach ($response->data as $list) {
                $lists[] = [
                    'id'   => $list->id,
                    'name' => $list->name
                ];
            }
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error(__('Please a enter valid API key', 'bit-integrations'), 400);
        }
    }

    public function getAllFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->auth_token) || empty($fieldsRequestParams->listId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->auth_token;
        $listId = $fieldsRequestParams->listId;
        $apiEndpoint = 'https://emailoctopus.com/api/1.6/lists/' . $listId . '?api_key=' . $apiKey;
        $response = HttpHelper::get($apiEndpoint, null, null);

        if (!isset($response->error)) {
            $fields = [];
            foreach ($response->fields as $field) {
                $fields[] = [
                    'key'      => $field->tag,
                    'label'    => $field->label,
                    'required' => $field->tag === 'EmailAddress' ? true : false
                ];
            }
            wp_send_json_success($fields, 200);
        } else {
            wp_send_json_error(__('Groups fetch failed', 'bit-integrations'), 400);
        }
    }

    public function getAllTags($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->auth_token) || empty($fieldsRequestParams->listId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->auth_token;
        $listId = $fieldsRequestParams->listId;
        $apiEndpoint = 'https://emailoctopus.com/api/1.6/lists/' . $listId . '/tags?api_key=' . $apiKey;
        $response = HttpHelper::get($apiEndpoint, null, null);

        $tags = [];
        foreach ($response->data as $tag) {
            $tags[] = [
                'name' => $tag->tag
            ];
        }

        if (isset($response->error)) {
            wp_send_json_error(__('Groups fetching failed', 'bit-integrations'), 400);
        } else {
            wp_send_json_success($tags, 200);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $selectedList = $integrationDetails->selectedList;
        $selectedTags = $integrationDetails->selectedTags;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($auth_token) || empty($selectedList)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('fields are required for EmailOctopus api', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $emailOctopusApiResponse = $recordApiHelper->execute($selectedTags, $fieldValues, $fieldMap, $selectedList);

        if (is_wp_error($emailOctopusApiResponse)) {
            return $emailOctopusApiResponse;
        }

        return $emailOctopusApiResponse;
    }
}
