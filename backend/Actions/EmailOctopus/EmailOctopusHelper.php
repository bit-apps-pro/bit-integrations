<?php

namespace BitApps\Integrations\Actions\EmailOctopus;

use BitApps\Integrations\Core\Util\HttpHelper;

class EmailOctopusHelper
{
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
}
