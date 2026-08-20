<?php

/**
 * Secure Custom Fields Integration
 */

namespace BitApps\Integrations\Actions\SecureCustomFields;

use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class SecureCustomFieldsController
{
    public static function isPluginActive()
    {
        if (\defined('ACF_BASENAME') && ACF_BASENAME === 'secure-custom-fields/secure-custom-fields.php') {
            return true;
        }

        if (!\function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        return \function_exists('is_plugin_active') && is_plugin_active('secure-custom-fields/secure-custom-fields.php');
    }

    public function execute($integrationData, $fieldValues)
    {
        if (empty($integrationData) || empty($integrationData->flow_details)) {
            return new WP_Error('invalid_integration_data', __('Invalid integration data', 'bit-integrations'));
        }

        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map ?? [];

        if (empty($fieldMap)) {
            $message = __('Field map is empty', 'bit-integrations');
            LogHandler::save($integId, ['type' => 'SecureCustomFields', 'type_name' => $integrationDetails->mainAction ?? ''], 'error', ['success' => false, 'message' => $message]);

            return new WP_Error('field_map_empty', $message);
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
