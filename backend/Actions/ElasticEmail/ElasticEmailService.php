<?php

namespace BitApps\Integrations\Actions\ElasticEmail;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class ElasticEmailService
{
    private $_defaultHeader;

    private $_integrationID;

    public function __construct($api_key, $integId)
    {
        $this->_defaultHeader['Content-Type'] = 'application/json';
        $this->_defaultHeader['Authorization'] = "Bearer {$api_key}";
        $this->_integrationID = $integId;
    }

    public function createContact($data, $listName, $apiKey)
    {
        $tmpData = \is_string($data) ? $data : wp_json_encode([(object) $data]);
        $header = [
            'X-ElasticEmail-ApiKey' => $apiKey,
            'Content-Type'          => 'application/json'
        ];

        $insertRecordEndpoint = "https://api.elasticemail.com/v4/contacts?{$listName}";

        return HttpHelper::post($insertRecordEndpoint, $tmpData, $header);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->elasticEmailField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($integId, $fieldValues, $fieldMap, $integrationDetails)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $listName = $integrationDetails->list_id;
        $query = '';

        foreach ($listName as $key => $val) {
            $query .= 'listnames=' . $val . '&';
        }
        if (\strlen($query)) {
            $query = substr($query, 0, -1);
        }
        $api_key = $integrationDetails->api_key;
        $apiResponse = $this->createContact($finalData, $query, $api_key);

        if (!\is_array($apiResponse)) {
            LogHandler::save($integId, wp_json_encode(['type' => 'contacts', 'type_name' => 'contact_add']), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => 'contacts', 'type_name' => 'contact_add']), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
