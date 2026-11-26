<?php

namespace BitApps\Integrations\Actions\WooCommerce;

use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class WooCommerceAction
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $module = $integrationDetails->module;
        $fieldMap = $integrationDetails->{$module}->field_map;
        $uploadFieldMap = $integrationDetails->{$module}->upload_field_map;
        $required = $integrationDetails->default->fields->{$module}->required;

        if (
            empty($module)
        ) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('module and field map are required for woocommerce', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }

        $recordApiHelper = new WooCommerceService($this->_integrationID);

        $wcApiResponse = $recordApiHelper->execute(
            $module,
            $fieldValues,
            $fieldMap,
            $uploadFieldMap,
            $required,
            $integrationDetails
        );

        if (is_wp_error($wcApiResponse)) {
            return $wcApiResponse;
        }

        return $wcApiResponse;
    }
}
