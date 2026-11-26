<?php

namespace BitApps\Integrations\Actions\WeDocs;

class WeDocsAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map ?? [];

        $recordApiHelper = new WeDocsService($integrationDetails, $integrationData->id);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
