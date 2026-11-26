<?php

namespace BitApps\Integrations\Actions\Lemlist;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class LemlistAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'lemlist',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $selectedCampaign = $integrationDetails->campaignId;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $apiKey = $integrationDetails->api_key;

        if (empty($fieldMap) || empty($apiKey) || empty($selectedCampaign)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Lemlist'));
        }

        $recordApiHelper = new LemlistService($integrationDetails, $integId, $apiKey);
        $lemlistApiResponse = $recordApiHelper->execute(
            $selectedCampaign,
            $fieldValues,
            $fieldMap,
            $actions
        );
        if (is_wp_error($lemlistApiResponse) || isset($lemlistApiResponse->_id)) {
            return $lemlistApiResponse;
        }

        return $lemlistApiResponse;
    }
}
