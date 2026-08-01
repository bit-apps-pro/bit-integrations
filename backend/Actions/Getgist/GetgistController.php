<?php

namespace BitApps\Integrations\Actions\Getgist;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class GetgistController
{
    public const APIENDPOINT = 'https://api.getgist.com';

    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'getgist',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;

        $api_key = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        if (empty($api_key)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'GetGist'));
        }
        $recordApiHelper = new RecordApiHelper($api_key, $integId);
        $getgistApiResponse = $recordApiHelper->execute(
            $integId,
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );

        if (is_wp_error($getgistApiResponse)) {
            return $getgistApiResponse;
        }

        return $getgistApiResponse;
    }
}
