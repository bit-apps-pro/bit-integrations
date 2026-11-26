<?php

namespace BitApps\Integrations\Actions\Zendesk;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ZendeskAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'zendesk',
        'fields'   => [
            'api_key' => 'token',
        ],
    ];

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://api.getbase.com/v2/';
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
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Zendesk'));
        }

        $recordApiHelper = new ZendeskService($integrationDetails, $integId);
        $zendeskApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($zendeskApiResponse)) {
            return $zendeskApiResponse;
        }

        return $zendeskApiResponse;
    }
}
