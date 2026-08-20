<?php

/**
 * trello Record Api
 */

namespace BitApps\Integrations\Actions\Trello;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function insertCard($data)
    {
        $insertRecordEndpoint = 'https://api.trello.com/1/cards/?idList=' . $this->_integrationDetails->listId . '&key=' . $this->_integrationDetails->clientId . '&token=' . $this->_integrationDetails->accessToken;

        return HttpHelper::post($insertRecordEndpoint, $data);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->trelloFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $customFieldMap)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $finalData['pos'] = $this->_integrationDetails->pos;

        if ($this->isRichTextDescEnabled() && !empty($this->_integrationDetails->descRichText)) {
            $finalData['desc'] = Common::replaceFieldWithValue($this->_integrationDetails->descRichText, $fieldValues);
        }

        $apiResponse = $this->insertCard($finalData);

        if (property_exists($apiResponse, 'errors')) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Card', 'type_name' => 'add-Card']), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Card', 'type_name' => 'add-Card']), 'success', wp_json_encode($apiResponse));
        }

        if (!empty($apiResponse->id) && !empty($customFieldMap)) {
            Hooks::run(Config::withPrefix('trello_store_custom_fields'), $apiResponse->id, $customFieldMap, $fieldValues, $this->_integrationID, $this->_integrationDetails);

            Hooks::run('btcbi_trello_store_custom_fields', $apiResponse->id, $customFieldMap, $fieldValues, $this->_integrationID, $this->_integrationDetails);
        }

        return $apiResponse;
    }

    private function isRichTextDescEnabled()
    {
        $actions = $this->_integrationDetails->actions ?? null;

        if (\is_object($actions)) {
            return !empty($actions->richTextDesc);
        }

        if (\is_array($actions)) {
            return !empty($actions['richTextDesc']);
        }

        return false;
    }
}
