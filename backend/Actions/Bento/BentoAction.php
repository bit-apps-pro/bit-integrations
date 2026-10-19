<?php

/**
 * Bento Integration
 */

namespace BitApps\Integrations\Actions\Bento;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class BentoAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'bento',
        'fields'   => [
            'publishable_key' => 'username',
            'secret_key'      => 'password',
            'site_uuid'       => 'site_uuid',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $publishableKey = $integrationDetails->publishable_key;
        $secretKey = $integrationDetails->secret_key;
        $siteUUID = $integrationDetails->site_uuid;
        $fieldMap = $integrationDetails->field_map;
        $action = $integrationDetails->action;

        if (empty($fieldMap) || empty($publishableKey) || empty($secretKey) || empty($siteUUID) || empty($action)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Bento'));
        }

        $recordApiHelper = new BentoService(
            $integrationDetails,
            $integId,
            $publishableKey,
            $secretKey,
            $siteUUID
        );

        return $recordApiHelper->execute($fieldValues, $fieldMap, $action);
    }
}
