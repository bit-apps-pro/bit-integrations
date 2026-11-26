<?php

namespace BitApps\Integrations\Actions\SystemeIO;

use BitApps\Integrations\Core\Util\HttpHelper;

class SystemeIOHelper
{
    protected $_defaultHeader;

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://api.systeme.io/api';
    }

    public function getAllTags($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->api_key);
        $apiEndpoint = $this->_apiEndpoint . '/tags';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (!isset($response->errors)) {
            $tags = [];
            foreach ($response->items as $tag) {
                $tags[]
                = (object) [
                    'id'   => $tag->id,
                    'name' => $tag->name
                ]
                ;
            }
            wp_send_json_success($tags, 200);
        } else {
            wp_send_json_error(__('Tags fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllFields($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->api_key);
        $apiEndpoint = $this->_apiEndpoint . '/contact_fields';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (!isset($response->errors)) {
            $allFields = [];

            foreach ($response->items as $field) {
                $allFields[] = (object) [
                    'label'    => $field->fieldName,
                    'key'      => $field->slug,
                    'required' => $field->slug == 'email'
                ];
            }

            wp_send_json_success($allFields, 200);
        } else {
            wp_send_json_error(__('Contact Field fetching failed', 'bit-integrations'), 400);
        }
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->api_key) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($apiKey)
    {
        $this->_defaultHeader = [
            'x-api-key'    => $apiKey,
            'Content-Type' => 'application/json'
        ];
    }
}
