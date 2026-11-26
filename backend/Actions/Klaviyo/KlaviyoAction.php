<?php

namespace BitApps\Integrations\Actions\Klaviyo;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class KlaviyoAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'klaviyo',
        'fields'   => [
            'authKey' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authKey = $integrationDetails->authKey;
        $listId = $integrationDetails->listId;
        $field_map = $integrationDetails->field_map;

        if (
            empty($field_map)
            || empty($authKey)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Klaviyo'));
        }
        $recordApiHelper = new KlaviyoService($integrationDetails, $integId);
        $klaviyoApiResponse = $recordApiHelper->execute(
            $listId,
            $fieldValues,
            $field_map,
            $authKey
        );

        if (is_wp_error($klaviyoApiResponse)) {
            return $klaviyoApiResponse;
        }

        return $klaviyoApiResponse;
    }
}
