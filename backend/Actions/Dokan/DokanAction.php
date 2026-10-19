<?php

namespace BitApps\Integrations\Actions\Dokan;

use WP_Error;

class DokanAction
{
    public function execute($integrationData, $fieldValues)
    {
        DokanHelper::checkedDokanExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $selectedVendor = $integrationDetails->selectedVendor;
        $actions = (array) $integrationDetails->actions;
        $selectedPaymentMethod = $integrationDetails->selectedPaymentMethod;

        if (empty($fieldMap) || empty($selectedTask)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task are required for Dokan', 'bit-integrations'));
        }

        $recordApiHelper = new DokanService($integId);
        $dokanResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $actions, $selectedVendor, $selectedPaymentMethod);

        if (is_wp_error($dokanResponse)) {
            return $dokanResponse;
        }

        return $dokanResponse;
    }
}
