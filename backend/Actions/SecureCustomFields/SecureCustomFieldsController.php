<?php

/**
 * Secure Custom Fields Integration
 */

namespace BitApps\Integrations\Actions\SecureCustomFields;

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
        return \defined('ACF_BASENAME') && ACF_BASENAME === 'secure-custom-fields/secure-custom-fields.php';
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
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map;
        $utilities          = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }
}
