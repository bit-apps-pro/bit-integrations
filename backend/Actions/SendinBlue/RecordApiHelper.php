<?php

/**
 * ZohoRecruit Record Api
 */

namespace BitApps\Integrations\Actions\SendinBlue;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_integrationID;

    private $_apiEndPoint = 'https://api.sendinblue.com/v3/contacts';

    public function __construct($api_key, $integId)
    {
        $this->_defaultHeader['Content-Type'] = 'application/json';
        $this->_defaultHeader['api-key'] = $api_key;
        $this->_integrationID = $integId;
    }

    public function insertRecordDoubleOpt($data, $integrationDetails)
    {
        $templateId = $integrationDetails->templateId;
        $redirectionUrl = $integrationDetails->redirectionUrl;
        $data['templateId'] = (int) $templateId;
        $data['redirectionUrl'] = $redirectionUrl;
        if ($data['listIds']) {
            $data['includeListIds'] = $data['listIds'];
            unset($data['listIds']);
        }

        $data = wp_json_encode($data);
        $insertRecordEndpoint = "{$this->_apiEndPoint}/doubleOptinConfirmation";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function insertRecord($data)
    {
        $insertRecordEndpoint = "{$this->_apiEndPoint}";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function existRecord($email)
    {
        $insertRecordEndpoint = "{$this->_apiEndPoint}/{$email}";

        return HttpHelper::get($insertRecordEndpoint, null, $this->_defaultHeader);
    }

    public function updateRecord($id, $data)
    {
        $updateRecordEndpoint = "{$this->_apiEndPoint}/{$id}";

        return HttpHelper::request($updateRecordEndpoint, 'PUT', $data, $this->_defaultHeader);
    }

    public function execute($lists, $defaultDataConf, $fieldValues, $fieldMap, $actions, $integrationDetails)
    {
        $fieldData = $this->setFiledMapping($fieldMap, $fieldValues);

        $fieldData['listIds'] = array_map('intval', $lists);

        $recordApiResponse = null;
        $type = 'insert';
        $existRecord = false;

        if (!empty($actions->double_optin)) {
            $recordApiResponse = $this->insertRecordDoubleOpt($fieldData, $integrationDetails);
        }
        if (empty($recordApiResponse) && !empty($actions->update)) {
            $response = $this->existRecord($fieldData['email']);
            $existRecord = !empty($response->id);
        }

        if (!empty($actions->update) && !empty($existRecord)) {
            $type = 'update';
            $recordApiResponse = $this->updateRecord($fieldData['email'], wp_json_encode($fieldData));
            $recordApiResponse = empty($recordApiResponse) ? (object) ['success' => true, 'id' => $fieldData['email']] : $recordApiResponse;
        } elseif (empty($recordApiResponse)) {
            $recordApiResponse = $this->insertRecord(wp_json_encode($fieldData));
        }

        if ($recordApiResponse && isset($recordApiResponse->code)) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', $recordApiResponse);
        }

        return $recordApiResponse;
    }

    private function setFiledMapping($fieldMap, $fieldValues)
    {
        $fieldData = [];
        $attributes = [];

        foreach ($fieldMap as $fieldKey => $fieldPair) {
            $sendinBlueField = $fieldPair->sendinBlueField ?? null;
            $formField = $fieldPair->formField ?? null;
            $customValue = $fieldPair->customValue ?? null;

            if (empty($sendinBlueField)) {
                continue;
            }

            if ($sendinBlueField === 'email') {
                $fieldData['email'] = ($formField === 'custom' && isset($customValue))
                    ? Common::replaceFieldWithValue($customValue, $fieldValues)
                    : $fieldValues[$formField] ?? null;

                continue;
            }

            $attributes[$sendinBlueField] = ($formField === 'custom' && isset($customValue))
                ? Common::replaceFieldWithValue($customValue, $fieldValues)
                : ($fieldValues[$formField] ?? null);
        }

        $fieldData['attributes'] = (object) $attributes;

        return $fieldData;
    }
}
