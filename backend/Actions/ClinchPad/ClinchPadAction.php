<?php

namespace BitApps\Integrations\Actions\ClinchPad;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ClinchPadAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'clinchpad',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://www.clinchpad.com/api/v1';
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
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'ClinchPad'));
        }

        $recordApiHelper = new ClinchPadService($integrationDetails, $integId);
        $clinchPadApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($clinchPadApiResponse)) {
            return $clinchPadApiResponse;
        }

        return $clinchPadApiResponse;
    }
}
