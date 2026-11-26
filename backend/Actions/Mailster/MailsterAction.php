<?php

namespace BitApps\Integrations\Actions\Mailster;

use WP_Error;

class MailsterAction
{
    public function execute($integrationData, $fieldValues)
    {
        MailsterHelper::checkedMailsterExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedStatus = $integrationDetails->selectedStatus;
        $selectedLists = $integrationDetails->selectedLists;
        $selectedTags = $integrationDetails->selectedTags;

        if (empty($fieldMap)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('fields map are required for Mailster', 'bit-integrations'));
        }

        $recordApiHelper = new MailsterService($integId);
        $mailsterResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $selectedStatus,
            $selectedLists,
            $selectedTags
        );

        if (is_wp_error($mailsterResponse)) {
            return $mailsterResponse;
        }

        return $mailsterResponse;
    }
}
