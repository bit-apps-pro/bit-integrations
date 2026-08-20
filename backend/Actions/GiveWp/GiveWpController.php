<?php

namespace BitApps\Integrations\Actions\GiveWp;

use WP_Error;

class GiveWpController
{
    public static function pluginActive($option = null)
    {
        if (is_plugin_active('give/give.php')) {
            return $option === 'get_name' ? 'give/give.php' : true;
        }

        return false;
    }

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
            // translators: %s: Integration name

            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'GiveWp'));
        }
        $recordApiHelper = new RecordApiHelper();
        $giveWpApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $fieldMap,
            $integrationDetails,
            $integId
        );

        if (is_wp_error($giveWpApiResponse)) {
            return $giveWpApiResponse;
        }

        return $giveWpApiResponse;
    }
}
