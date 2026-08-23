<?php

/**
 * MailRelay Record Api
 */

namespace BitApps\Integrations\Actions\MailRelay;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_requestStoringTypes;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_domainName = $this->_integrationDetails->domain;
        $this->_defaultHeader = [
            'X-AUTH-TOKEN' => $this->_integrationDetails->auth_token,
            'Content-Type' => 'application/json'
        ];
    }

    public function addSubscriber($selectedGroups, $finalData, $status)
    {
        $baseUrl = "https://{$this->_domainName}.ipzmarketing.com/api/v1/";
        $apiEndpoints = $baseUrl . 'subscribers';
        $groups = [];

        if (!empty($selectedGroups)) {
            $splitSelectedGroups = explode(',', $selectedGroups);
            foreach ($splitSelectedGroups as $group) {
                $groups[] = $group;
            }
        }

        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $isSubscriberExist = $this->isExist($baseUrl, $finalData['email']);
        $requestParams = [
            'status' => $status
        ];

        $staticFieldsKeys = ['email', 'name', 'sms_phone', 'address', 'city', 'state', 'country', 'birthday', 'website', 'locale', 'timezone'];
        $customFields = [];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys) && $key == 'sms_phone') {
                $requestParams[$key] = Helper::formatPhoneNumber($value);
            } elseif (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $customFields[$key] = $value;
            }
        }

        if (!empty($customFields)) {
            $requestParams['custom_fields'] = (object) $customFields;
        }

        if (!empty($groups)) {
            $requestParams['group_ids'] = $groups;
        }

        $apiRequestBody = wp_json_encode($requestParams);

        if ($isSubscriberExist && !empty($this->_integrationDetails->actions->update)) {
            $apiEndpoints = $baseUrl . 'subscribers/' . $isSubscriberExist;
            $this->_requestStoringTypes = 'updated';

            return HttpHelper::request($apiEndpoints, 'PATCH', $apiRequestBody, $this->_defaultHeader);
        }

        $this->_requestStoringTypes = 'created';

        return HttpHelper::post($apiEndpoints, $apiRequestBody, $this->_defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->mailRelayFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($selectedGroups, $fieldValues, $fieldMap, $status)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->addSubscriber($selectedGroups, $finalData, $status);

        if (isset($apiResponse->id)) {
            $res = ['message' => 'Subscriber ' . $this->_requestStoringTypes . ' successfully'];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'subscriber', 'type_name' => 'Subscriber ' . $this->_requestStoringTypes]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'subscriber', 'type_name' => 'Adding Subscriber']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    public function isExist($baseUrl, $email)
    {
        $queryEndpoints = $baseUrl . 'subscribers?q%5Bemail_eq%5D=';
        $encodedEmail = rawurlencode($email);
        $apiEndpoints = $queryEndpoints . $encodedEmail;
        $response = HttpHelper::get($apiEndpoints, null, $this->_defaultHeader);

        if (isset($response[0]->id)) {
            return $response[0]->id;
        }

        return false;
    }
}
