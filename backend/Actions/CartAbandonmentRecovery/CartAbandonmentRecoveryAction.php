<?php

namespace BitApps\Integrations\Actions\CartAbandonmentRecovery;

class CartAbandonmentRecoveryAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];

        return (new CartAbandonmentRecoveryService($integrationDetails, $integId))->execute($fieldValues, $fieldMap);
    }
}
