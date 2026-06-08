<?php

namespace BitApps\Integrations\Actions\WordPress;

class WordPressController
{
    public static function wordPressAuthorize()
    {
        wp_send_json_success(true);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = isset($integrationDetails->field_map) ? $integrationDetails->field_map : [];

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $integrationDetails);
    }
}
