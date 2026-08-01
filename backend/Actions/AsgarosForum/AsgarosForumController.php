<?php

namespace BitApps\Integrations\Actions\AsgarosForum;

/**
 * Provide functionality for Asgaros Forum integration.
 */
class AsgarosForumController
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map ?? [];

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integrationData->id);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
