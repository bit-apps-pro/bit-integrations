<?php

namespace BitApps\Integrations\Actions\TablePress;

use TablePress;
use WP_Error;

class TablePressController
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    public static function isPluginActive()
    {
        return class_exists('TablePress') && isset(TablePress::$model_table);
    }
}
