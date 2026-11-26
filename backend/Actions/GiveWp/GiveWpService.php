<?php

namespace BitApps\Integrations\Actions\GiveWp;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use Give_Donor;

class GiveWpService
{
    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->giveWpFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function createGiveWpDonar($finalData)
    {
        if (empty($finalData['name'])) {
            $finalData['name'] = ($finalData['first_name'] ?? '') . ' ' . ($finalData['last_name'] ?? '');
        }

        $metaKeys = [
            '_give_donor_first_name' => 'first_name',
            '_give_donor_last_name'  => 'last_name',
        ];

        if (!class_exists('Give_Donor') || !\function_exists('Give')) {
            return;
        }

        $donor = new Give_Donor();
        $donorId = $donor->create($finalData);

        if (is_numeric($donorId)) {
            foreach ($metaKeys as $metaKey => $field) {
                if (isset($finalData[$field])) {
                    Give()->donor_meta->update_meta($donorId, $metaKey, $finalData[$field]);
                }
            }
        }

        return $donorId;
    }

    public function execute(
        $mainAction,
        $fieldValues,
        $fieldMap,
        $integrationDetails,
        $integId
    ) {
        $fieldData = [];
        $response = null;
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($mainAction === '1') {
            $response = $this->createGiveWpDonar($finalData);
            if (!empty($response)) {
                // translators: %s: Placeholder value
                LogHandler::save($integId, wp_json_encode(['type' => 'create-donar', 'type_name' => 'create-donar-giveWp']), 'success', wp_json_encode(wp_sprintf(__('Donar crated successfully and id is %s', 'bit-integrations'), $response)));
            } else {
                LogHandler::save($integId, wp_json_encode(['type' => 'create-donar', 'type_name' => 'create-donar-giveWp']), 'error', wp_json_encode(__('Failed to create donar', 'bit-integrations')));
            }
        }

        return $response;
    }
}
