<?php

namespace BitApps\Integrations\Actions\CampaignMonitor;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class CampaignMonitorAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'campaignmonitor',
        'fields'   => [
            'api_key'   => 'username',
            'client_id' => 'client_id',
        ],
    ];

    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = 'https://api.createsend.com/api/v3.3';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $selectedList = $integrationDetails->listId;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $apiKey = $integrationDetails->api_key;

        if (empty($fieldMap) || empty($apiKey) || empty($selectedList)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Campaign Monitor'));
        }

        $recordApiHelper = new CampaignMonitorService($integrationDetails, $integId, $apiKey);
        $campaignMonitorApiResponse = $recordApiHelper->execute(
            $selectedList,
            $fieldValues,
            $fieldMap,
            $actions
        );
        if (is_wp_error($campaignMonitorApiResponse) || !filter_var($campaignMonitorApiResponse, FILTER_VALIDATE_EMAIL)) {
            return $campaignMonitorApiResponse->Message;
        }

        return $campaignMonitorApiResponse;
    }
}
