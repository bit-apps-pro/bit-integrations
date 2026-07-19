<?php

/**
 * ClickWhale Integration
 */

namespace BitApps\Integrations\Actions\ClickWhale;

use WP_Error;

/**
 * Provide functionality for ClickWhale integration
 */
class ClickWhaleController
{
    public static function isExists()
    {
        if (!\defined('CLICKWHALE_VERSION')) {
            wp_send_json_error(
                __(
                    'ClickWhale is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function clickWhaleAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }
}
