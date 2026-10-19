<?php

namespace BitApps\Integrations\Actions\JetEngine;

use WP_Error;

class JetEngineAction
{
    public function execute($integrationData, $fieldValues)
    {
        JetEngineHelper::checkedJetEngineExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $actions = (array) $integrationDetails->actions;

        if (empty($fieldMap) || empty($selectedTask)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task are required for JetEngine', 'bit-integrations'));
        }

        $createCPTSelectedOptions = [
            'selectedMenuPosition' => $integrationDetails->selectedMenuPosition,
            'selectedMenuIcon'     => $integrationDetails->selectedMenuIcon,
            'selectedSupports'     => $integrationDetails->selectedSupports,
            'selectedCPT'          => isset($integrationDetails->selectedCPT) ? $integrationDetails->selectedCPT : '',
            'selectedCCT'          => isset($integrationDetails->selectedCCT) ? $integrationDetails->selectedCCT : '',
        ];

        $taxOptions = [
            'selectedTaxPostTypes' => $integrationDetails->selectedTaxPostTypes,
            'selectedTaxForEdit'   => isset($integrationDetails->selectedTaxForEdit) ? $integrationDetails->selectedTaxForEdit : ''
        ];

        $relOptions = (array) $integrationDetails->relOptions;

        $recordApiHelper = new JetEngineService($integId);
        $jetEngineResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $actions, $createCPTSelectedOptions, $taxOptions, $relOptions);

        if (is_wp_error($jetEngineResponse)) {
            return $jetEngineResponse;
        }

        return $jetEngineResponse;
    }
}
