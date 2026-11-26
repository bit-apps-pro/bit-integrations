<?php

namespace BitApps\Integrations\Actions\GetResponse;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class GetResponseAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'getresponse',
        'fields'   => [
            'auth_token' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $selectedTags = $integrationDetails->selectedTags;
        $fieldMap = $integrationDetails->field_map;
        $type = $integrationDetails->mailer_lite_type;
        $campaignId = $integrationDetails->campaignId;
        $campaign = (object) ['campaignId' => $campaignId];

        if (
            empty($fieldMap)
            || empty($auth_token) || empty($campaignId)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'GetResponse'));
        }
        $recordApiHelper = new GetResponseService($integrationDetails, $integId);
        $getResponseApiResponse = $recordApiHelper->execute(
            $selectedTags,
            $type,
            $fieldValues,
            $fieldMap,
            $auth_token,
            $campaign
        );

        if (is_wp_error($getResponseApiResponse)) {
            return $getResponseApiResponse;
        }

        return $getResponseApiResponse;
    }
}
