<?php

/**
 * Newsletter Integration
 */

namespace BitApps\Integrations\Actions\Newsletter;

use WP_Error;

/**
 * Provide functionality for Newsletter integration
 */
class NewsletterController
{
    public static function checkedNewsletterExists()
    {
        if (!is_plugin_active('newsletter/plugin.php')) {
            wp_send_json_error(
                __(
                    'Newsletter Plugin is not active or not installed',
                    'bit-integrations'
                ),
                400
            );
        } else {
            return true;
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        self::checkedNewsletterExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedLists = $integrationDetails->selectedLists;

        if (empty($fieldMap)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('fields map are required for Newsletter', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integId);
        $newsletterResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedLists);

        if (is_wp_error($newsletterResponse)) {
            return $newsletterResponse;
        }

        return $newsletterResponse;
    }
}
