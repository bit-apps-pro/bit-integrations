<?php

namespace BitApps\Integrations\Actions\SureCart;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SureCartController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'surecart',
        'fields'   => [
            'token' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integrationId = $integrationData->id;
        $token = $integrationDetails->token ?: ($integrationDetails->api_key ?: ($integrationDetails->value ?? ''));
        $fieldMap = $integrationDetails->field_map;
        $mainAction = $integrationDetails->mainAction;

        if (
            empty($token)
            || empty($integrationDetails)
            || empty($fieldMap)

        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'sureCart'));
        }
        $recordApiHelper = new RecordApiHelper($integrationId);

        return $recordApiHelper->execute(
            $token,
            $fieldValues,
            $fieldMap,
            $integrationDetails,
            $mainAction
        );
    }
}
