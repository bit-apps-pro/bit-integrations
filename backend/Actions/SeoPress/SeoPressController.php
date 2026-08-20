<?php

/**
 * SEOPress Integration
 */

namespace BitApps\Integrations\Actions\SeoPress;

use WP_Error;

/**
 * Provide functionality for SEOPress integration
 */
class SeoPressController
{
    /**
     * Validate if SEOPress plugin exists or not. If not exists then terminate
     * request and send an error response.
     *
     * @return void
     */
    public static function isExists()
    {
        if (!\defined('SEOPRESS_VERSION')) {
            wp_send_json_error(
                __(
                    'SEOPress is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    /**
     * Execute action
     *
     * @param $integrationData Integration data
     * @param $fieldValues     Field values
     *
     * @return bool
     */
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $seoPressResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($seoPressResponse)) {
            return $seoPressResponse;
        }

        return $seoPressResponse;
    }
}
