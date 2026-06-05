<?php

/**
 * Secure Custom Fields Integration
 */

namespace BitApps\Integrations\Actions\SecureCustomFields;

use BitApps\Integrations\Log\LogHandler;
use WP_Error;

/**
 * Provide functionality for Secure Custom Fields integration
 */
class SecureCustomFieldsController
{
    /**
     * Whether the Secure Custom Fields plugin (not another ACF-compatible plugin) is the active one.
     *
     * SCF defines ACF_BASENAME from its own main file, so the basename uniquely
     * identifies it versus Advanced Custom Fields / ACF Pro.
     *
     * @return bool
     */
    public static function isPluginActive()
    {
        if (\defined('ACF_BASENAME') && ACF_BASENAME === 'secure-custom-fields/secure-custom-fields.php') {
            return true;
        }

        // Fallback: ACF_BASENAME can be claimed by ACF/ACF Pro when loaded first, and a
        // non-standard install dir would miss the constant check, so verify by plugin file.
        if (!\function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        return \function_exists('is_plugin_active') && is_plugin_active('secure-custom-fields/secure-custom-fields.php');
    }

    public static function isExists()
    {
        if (!self::isPluginActive()) {
            wp_send_json_error(
                __(
                    'Secure Custom Fields is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function secureCustomFieldsAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
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
