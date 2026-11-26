<?php

namespace BitApps\Integrations\Actions\Groundhogg;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class GroundhoggAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'groundhogg',
        'fields'   => [
            'token'      => 'value',
            'public_key' => 'public_key',
            'domainName' => 'domainName',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;

        if (
            empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Groundhogg'));
        }
        $recordApiHelper = new GroundhoggService($integrationDetails, $integId);
        $groundhoggApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $integrationDetails,
            $actions
        );

        if (is_wp_error($groundhoggApiResponse)) {
            return $groundhoggApiResponse;
        }

        return $groundhoggApiResponse;
    }
}
