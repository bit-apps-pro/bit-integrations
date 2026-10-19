<?php

/**
 * SmartSuite Integration
 */

namespace BitApps\Integrations\Actions\SmartSuite;

use BitApps\Integrations\Core\Util\HttpHelper;

class SmartSuiteHelper
{
    protected $_defaultHeader;

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://app.smartsuite.com/api/v1/';
    }

    public function getAllSolutions($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->workspaceId, $fieldsRequestParams->apiToken);
        $apiEndpoint = $this->apiEndpoint . 'solutions/';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (!isset($response->errors)) {
            $solutions = [];
            foreach ($response as $solution) {
                $solutions[]
                = (object) [
                    'id'   => $solution->id,
                    'name' => $solution->name
                ]
                ;
            }
            wp_send_json_success($solutions, 200);
        } else {
            wp_send_json_error(__('Solutions fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllTables($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->workspaceId, $fieldsRequestParams->apiToken);
        $apiEndpoint = $this->apiEndpoint . "applications/?solution={$fieldsRequestParams->solution_id}";

        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);
        if (!isset($response->errors)) {
            $tables = [];
            foreach ($response as $table) {
                $tables[]
                = (object) [
                    'id'           => $table->id,
                    'name'         => $table->name,
                    'customFields' => $table->structure
                ]
                ;
            }
            wp_send_json_success($tables, 200);
        } else {
            wp_send_json_error(__('Tables fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllUser($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->workspaceId, $fieldsRequestParams->apiToken);
        $apiEndpoint = $this->apiEndpoint . 'applications/members/records/list/';

        $response = HttpHelper::post($apiEndpoint, null, $this->_defaultHeader);

        if (isset($response->items)) {
            $users = [];
            foreach ($response->items as $user) {
                $users[]
                = (object) [
                    'id'   => $user->id,
                    'name' => $user->full_name->sys_root
                ]
                ;
            }
            wp_send_json_success($users, 200);
        } else {
            wp_send_json_error(__('User fetching failed', 'bit-integrations'), 400);
        }
    }

    private function checkValidation($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->workspaceId) || empty($fieldsRequestParams->apiToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($workspaceId, $apiToken)
    {
        $this->_defaultHeader = [
            'ACCOUNT-ID'    => $workspaceId,
            'Authorization' => 'Token ' . $apiToken,
            'Content-Type'  => 'application/json'
        ];
    }
}
