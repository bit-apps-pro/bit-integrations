<?php

namespace BitApps\Integrations\Actions\Vbout;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class VboutAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'vbout',
        'fields'   => [
            'auth_token' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $listId = $integrationDetails->list_id;
        $fieldMap = $integrationDetails->field_map;
        $contactStatus = $integrationDetails->contact_status;

        if (
            empty($fieldMap)
             || empty($auth_token)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'MailerLite'));
        }
        $recordApiHelper = new VboutService($integrationDetails, $integId);
        $vboutApiResponse = $recordApiHelper->execute(
            $listId,
            $contactStatus,
            $fieldValues,
            $fieldMap,
            $auth_token
        );

        if (is_wp_error($vboutApiResponse)) {
            return $vboutApiResponse;
        }

        return $vboutApiResponse;
    }
}
