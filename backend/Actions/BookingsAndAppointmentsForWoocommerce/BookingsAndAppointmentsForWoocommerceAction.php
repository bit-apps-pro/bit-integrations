<?php

namespace BitApps\Integrations\Actions\BookingsAndAppointmentsForWoocommerce;

use WP_Error;

class BookingsAndAppointmentsForWoocommerceAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integDetails = $integrationData->flow_details;
        $integId      = $integrationData->id;
        $fieldMap     = $integDetails->field_map;
        $utilities    = $integDetails->utilities ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new BookingsAndAppointmentsForWoocommerceService($integDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }
}
