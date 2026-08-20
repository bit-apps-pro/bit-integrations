<?php

/**
 * BitForm Record Api
 */

namespace BitApps\Integrations\Actions\BitForm;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->BitFormMapField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function insertRecord($finalData, $api_key, $domainName, $formId)
    {
        if (
            empty($domainName)
            || empty($api_key)
            || empty($formId)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $authorizationHeader = [
            'Bitform-Api-Key' => $api_key
        ];

        $apiEndpoint = $domainName . '/wp-json/bitform/v1/entry/' . $formId;

        return HttpHelper::post($apiEndpoint, $finalData, $authorizationHeader);
    }

    public function execute(
        $defaultDataConf,
        $fieldValues,
        $fieldMap,
        $api_key,
        $domainName,
        $formId
    ) {
        $fieldData = [];
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        $apiResponse = $this->insertRecord($finalData, $api_key, $domainName, $formId);

        if (property_exists($apiResponse, 'errors')) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-contact']), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'add-contact']), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
