<?php

/**
 * Bit CRM Integration
 */

namespace BitApps\Integrations\Actions\BitCrm;

use WP_Error;

class BitCrmController
{
    public static function isExists()
    {
        if (!class_exists('BitApps\Crm\Config')) {
            wp_send_json_error(__('Bit CRM is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function bitCrmAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map;
        $utilities          = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }
}
