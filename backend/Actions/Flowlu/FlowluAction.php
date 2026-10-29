<?php

namespace BitApps\Integrations\Actions\Flowlu;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class FlowluAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'flowlu',
        'fields'   => [
            'api_key'      => 'value',
            'company_name' => 'company_name',
        ],
    ];

    protected $_defaultHeader;

    public function __construct()
    {
        $this->_defaultHeader = ['Content-type' => 'application/json'];
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $comapnyName = $integrationDetails->company_name;

        if (empty($fieldMap) || empty($apiKey) || empty($actionName) || empty($comapnyName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Flowlu'));
        }

        $recordApiHelper = new FlowluService($integrationDetails, $integId, $comapnyName);
        $flowluApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName, $apiKey);

        if (is_wp_error($flowluApiResponse)) {
            return $flowluApiResponse;
        }

        return $flowluApiResponse;
    }
}
