<?php

/**
 * MailBluster Record Api
 */

namespace BitApps\Integrations\Actions\MailBluster;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $baseUrl = 'https://api.mailbluster.com/api/';

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_defaultHeader = [
            'Authorization' => $this->_integrationDetails->auth_token
        ];
    }

    public function addLeadToBrand($selectedTags, $finalData, $subscribed)
    {
        $apiEndpoints = $this->baseUrl . 'leads';
        $tags = [];

        if (!empty($selectedTags)) {
            $splitSelectedTags = explode(',', $selectedTags);
            foreach ($splitSelectedTags as $tag) {
                $tags[] = $tag;
            }
        }

        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $requestParams = [
            'subscribed' => $subscribed === 'true' ? true : false
        ];

        if (!empty($this->_integrationDetails->actions->update)) {
            $requestParams['overrideExisting'] = true;
        }
        if (!empty($this->_integrationDetails->actions->doubleOptIn)) {
            $requestParams['doubleOptIn'] = true;
        }

        $staticFieldsKeys = ['email', 'firstName', 'lastName', 'timezone', 'ipAddress'];
        $customFields = [];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $customFields[$key] = $value;
            }
        }

        if (!empty($customFields)) {
            $requestParams['fields'] = (object) $customFields;
        }

        if (!empty($tags)) {
            $requestParams['tags'] = $tags;
        }

        return HttpHelper::post($apiEndpoints, $requestParams, $this->_defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->mailBlusterFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($selectedTag, $fieldValues, $fieldMap, $subscribed)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->addLeadToBrand($selectedTag, $finalData, $subscribed);

        if ($apiResponse->lead->id) {
            $res = ['message' => $apiResponse->message . ' successfully'];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'lead', 'type_name' => $apiResponse->message]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'lead', 'type_name' => 'Update lead']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
