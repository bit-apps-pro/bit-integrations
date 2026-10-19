<?php

namespace BitApps\Integrations\Actions\Mautic;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class MauticService
{
    private $_defaultHeader;

    private $_tokenDetails;

    private $_integrationID;

    private $_baseUrl;

    public function __construct($tokenDetails, $integId, $baseUrl)
    {
        $this->_defaultHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $this->_defaultHeader['Content-Type'] = 'application/json';
        $this->_tokenDetails = $tokenDetails;
        $this->_integrationID = $integId;
        $this->_baseUrl = $baseUrl;
    }

    public function insertRecord($data)
    {
        $data = \is_string($data) ? $data : wp_json_encode((object) $data);
        $insertRecordEndpoint = "{$this->_baseUrl}/api/contacts/new";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->mauticField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($integrationDetails, $defaultConf, $fieldValues, $fieldMap, $actions)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        if (property_exists($integrationDetails, 'tag')) {
            $finalData['tags'] = $integrationDetails->tag;
        }
        if (property_exists($integrationDetails, 'owner')) {
            $finalData['owner'] = $integrationDetails->owner;
        }

        $apiResponse = $this->insertRecord($finalData);

        if (isset($apiResponse->errors)) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-contact']), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-contact']), 'success', wp_json_encode(__('Contact Added Successfully', 'bit-integrations')));
        }

        return $apiResponse;
    }
}
