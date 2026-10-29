<?php

namespace BitApps\Integrations\Actions\WpErp;

use WP_Error;

class WpErpAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = $integrationDetails->utilities ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new WpErpService($integrationDetails, $integId);
        $wpErpResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($wpErpResponse)) {
            return $wpErpResponse;
        }

        return $wpErpResponse;
    }
}
