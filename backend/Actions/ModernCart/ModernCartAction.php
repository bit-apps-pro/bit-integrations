<?php

namespace BitApps\Integrations\Actions\ModernCart;

class ModernCartAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map ?? [];

        return (new ModernCartService($integrationDetails, $integId))->execute($fieldValues, $fieldMap);
    }
}
