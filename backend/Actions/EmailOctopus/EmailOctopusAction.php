<?php

namespace BitApps\Integrations\Actions\EmailOctopus;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class EmailOctopusAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'emailoctopus',
        'fields'   => [
            'auth_token' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $selectedList = $integrationDetails->selectedList;
        $selectedTags = $integrationDetails->selectedTags;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($auth_token) || empty($selectedList)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('fields are required for EmailOctopus api', 'bit-integrations'));
        }

        $recordApiHelper = new EmailOctopusService($integrationDetails, $integId);
        $emailOctopusApiResponse = $recordApiHelper->execute($selectedTags, $fieldValues, $fieldMap, $selectedList);

        if (is_wp_error($emailOctopusApiResponse)) {
            return $emailOctopusApiResponse;
        }

        return $emailOctopusApiResponse;
    }
}
