<?php

namespace BitApps\Integrations\Actions\Sendy;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert,upsert
 */
class RecordApiHelper
{
    private $_defaultHeader;

    private $_tokenDetails;

    private $_integrationID;

    public function __construct($integId)
    {
        $this->_integrationID = $integId;
    }

    public function insertRecord($data, $sendyUrl)
    {
        $header['Content-Type'] = 'application/x-www-form-urlencoded';
        $insertRecordEndpoint = "{$sendyUrl}/subscribe";
        $data['boolean'] = 'true';

        return HttpHelper::post($insertRecordEndpoint, $data, $header);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->sendyField;

            if ($triggerValue == 'custom' && $actionValue == 'customFieldKey' && !empty($value->customFieldKey)) {
                $dataFinal[$value->customFieldKey] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif ($triggerValue == 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif ($actionValue == 'customFieldKey' && !empty($value->customFieldKey)) {
                $dataFinal[$value->customFieldKey] = $data[$triggerValue];
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($integId, $integrationDetails, $fieldValues, $fieldMap, $apiKey)
    {
        $fieldData = [];
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        $listId = $integrationDetails->list_id;
        $sendyUrl = $integrationDetails->sendy_url;
        $apiKey = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');
        $finalData['list'] = $listId;
        $finalData['boolean'] = true;
        $finalData['api_key'] = $apiKey;

        $apiResponse = $this->insertRecord($finalData, $sendyUrl);

        if ($apiResponse) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'add-subscriber'], 'success', wp_json_encode(__('Subscriber added successfully', 'bit-integrations')));
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'subscriber', 'type_name' => 'add-subscriber'], 'error', wp_json_encode(__('Failed to add subscriber', 'bit-integrations')));
        }

        return $apiResponse;
    }
}
