<?php

namespace BitApps\Integrations\Actions\Moosend;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MoosendAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'moosend',
        'fields'   => [
            'authKey' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authKey = !empty($integrationDetails->authKey) ? $integrationDetails->authKey : (isset($integrationDetails->api_key) ? $integrationDetails->api_key : '');
        $listId = $integrationDetails->listId;
        $method = $integrationDetails->method;
        $field_map = $integrationDetails->field_map;

        if (
            empty($field_map)
            || empty($authKey)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Moosend'));
        }
        $recordApiHelper = new MoosendService($integrationDetails, $integId);
        $moosendApiResponse = $recordApiHelper->execute(
            $listId,
            $method,
            $fieldValues,
            $field_map,
            $authKey
        );

        if (is_wp_error($moosendApiResponse)) {
            return $moosendApiResponse;
        }

        return $moosendApiResponse;
    }
}
