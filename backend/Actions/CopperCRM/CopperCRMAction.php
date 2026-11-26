<?php

namespace BitApps\Integrations\Actions\CopperCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class CopperCRMAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'coppercrm',
        'fields'   => [
            'api_key'   => 'value',
            'api_email' => 'api_email',
        ],
    ];

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://api.copper.com/developer_api/v1';
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
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Copper CRM'));
        }

        $recordApiHelper = new CopperCRMService($integrationDetails, $integId);
        $coppercrmApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($coppercrmApiResponse)) {
            return $coppercrmApiResponse;
        }

        return $coppercrmApiResponse;
    }
}
