<?php

namespace BitApps\Integrations\Actions\ActiveCampaign;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ActiveCampaignAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'activecampaign',
        'fields'   => [
            'api_key' => 'value',
            'api_url' => 'api_url',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $api_key = $integrationDetails->api_key;
        $api_url = $integrationDetails->api_url;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $listId = $integrationDetails->listId;
        $tags = $integrationDetails->tagIds;

        if (
            empty($api_key)
            || empty($api_url)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Active Campaign'));
        }
        $recordApiHelper = new ActiveCampaignService($api_key, $api_url, $this->_integrationID);
        $activeCampaignApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $fieldValues,
            $fieldMap,
            $actions,
            $listId,
            $tags
        );

        if (is_wp_error($activeCampaignApiResponse)) {
            return $activeCampaignApiResponse;
        }

        return $activeCampaignApiResponse;
    }
}
