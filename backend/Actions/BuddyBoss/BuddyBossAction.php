<?php

namespace BitApps\Integrations\Actions\BuddyBoss;

use WP_Error;

class BuddyBossAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            // translators: %s: Integration name
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'BuddyBoss'));
        }
        $recordApiHelper = new BuddyBossService($integrationDetails, $integId);
        $buddyBossApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );

        if (is_wp_error($buddyBossApiResponse)) {
            return $buddyBossApiResponse;
        }

        return $buddyBossApiResponse;
    }
}
