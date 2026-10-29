<?php

namespace BitApps\Integrations\Actions\MondayCom;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MondayComAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'mondaycom',
        'fields'   => [
            'apiToken' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];
        $apiToken = $integrationDetails->apiToken ?? '';

        if (empty($apiToken)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('API Token is required for Monday.com api', 'bit-integrations'));
        }

        $recordApiHelper = new MondayComService($integrationDetails, $integId, $apiToken);
        $response = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($response)) {
            return $response;
        }

        return $response;
    }
}
