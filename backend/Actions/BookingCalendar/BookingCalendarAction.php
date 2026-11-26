<?php

namespace BitApps\Integrations\Actions\BookingCalendar;

use WP_Error;

class BookingCalendarAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integDetails->field_map;
        $utilities = $integDetails->utilities ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new BookingCalendarService($integDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }
}
