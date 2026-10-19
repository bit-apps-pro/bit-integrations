<?php

/**
 * Encharge Integration
 */

namespace BitApps\Integrations\Actions\Encharge;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class EnchargeAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'encharge',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        $api_key = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $tags = property_exists($integrationDetails, 'tags') ? $integrationDetails->tags : null;

        if (empty($api_key)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Encharge Controller'));
        }
        $recordApiHelper = new EnchargeService($api_key, $this->_integrationID);
        $enchagreApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $tags
        );

        if (is_wp_error($enchagreApiResponse)) {
            return $enchagreApiResponse;
        }

        return $enchagreApiResponse;
    }
}
