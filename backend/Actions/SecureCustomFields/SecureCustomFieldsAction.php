<?php

namespace BitApps\Integrations\Actions\SecureCustomFields;

use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class SecureCustomFieldsAction
{
    public function execute($integrationData, $fieldValues)
    {
        if (empty($integrationData) || empty($integrationData->flow_details)) {
            return new WP_Error('invalid_integration_data', __('Invalid integration data', 'bit-integrations'));
        }

        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map ?? [];

        if (empty($fieldMap)) {
            $message = __('Field map is empty', 'bit-integrations');
            LogHandler::save($integId, ['type' => 'SecureCustomFields', 'type_name' => $integrationDetails->mainAction ?? ''], 'error', ['success' => false, 'message' => $message]);

            return new WP_Error('field_map_empty', $message);
        }

        $recordApiHelper = new SecureCustomFieldsService($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
