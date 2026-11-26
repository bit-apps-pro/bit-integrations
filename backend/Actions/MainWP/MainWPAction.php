<?php

namespace BitApps\Integrations\Actions\MainWP;

if (!defined('ABSPATH')) {
    exit;
}

class MainWPAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        $RecordApiHelper = new MainWPService($integrationDetails, $integId);

        return $RecordApiHelper->execute($fieldValues, $fieldMap);
    }
}
