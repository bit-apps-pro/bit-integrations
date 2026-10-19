<?php

namespace BitApps\Integrations\Actions\MailPoet;

use WP_Error;

class MailPoetAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $lists = $integrationDetails->lists;
        $actions = $integrationDetails->actions;

        if (empty($fieldMap)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Google sheet'));
        }

        $recordApiHelper = new MailPoetService($integId);

        $maiPoetApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $lists,
            $actions
        );

        if (is_wp_error($maiPoetApiResponse)) {
            return $maiPoetApiResponse;
        }

        return $maiPoetApiResponse;
    }
}
