<?php

namespace BitApps\Integrations\Actions\BookingPress;

use WP_Error;

class BookingPressController
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId))->execute($fieldValues, $fieldMap);
    }
}
