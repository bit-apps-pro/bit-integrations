<?php

namespace BitApps\Integrations\Actions\WpActivityLog;

use WP_Error;

class WpActivityLogAction
{
    private const NO_REQUIRED_FIELD_ACTIONS = ['log_event', 'delete_events'];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];
        $mainAction = $integrationDetails->mainAction ?? '';

        if (empty($fieldMap) && !\in_array($mainAction, self::NO_REQUIRED_FIELD_ACTIONS, true)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new WpActivityLogService($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }
}
