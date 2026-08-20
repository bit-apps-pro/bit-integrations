<?php

/**
 * Smaily Record Api
 */

namespace BitApps\Integrations\Actions\Smaily;

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
        $this->_subDomainName = $this->_integrationDetails->subdomain;
        $this->apiUserName = $this->_integrationDetails->api_user_name;
        $this->apiUserPassword = $this->_integrationDetails->api_user_password;
        $this->_defaultHeader = [
            'Authorization' => 'Basic ' . base64_encode("{$this->apiUserName}:{$this->apiUserPassword}"),
            'Content-Type'  => 'application/json'
        ];
    }

    public function addSubscriber($finalData)
    {
        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = "https://{$this->_subDomainName}.sendsmaily.net/api/contact.php";

        foreach ($finalData as $key => $value) {
            $requestParams[$key] = $value;
        }

        $requestParams['is_unsubscribed'] = $this->_integrationDetails->actions->unsubscribe ? 1 : 0;
        $this->_requestStoringTypes = $this->isExist($apiEndpoint, $finalData['email']) ? 'updated' : 'created';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->_defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->smailyFormField;
            if ($triggerValue === 'custom') {
                if ($actionValue === 'customFieldKey') {
                    $dataFinal[$value->customFieldKey] = $value->customValue;
                } else {
                    $dataFinal[$actionValue] = $value->customValue;
                }
            } elseif (!\is_null($data[$triggerValue])) {
                if ($actionValue === 'customFieldKey') {
                    $dataFinal[$value->customFieldKey] = $data[$triggerValue];
                } else {
                    $dataFinal[$actionValue] = $data[$triggerValue];
                }
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->addSubscriber($finalData);

        if ($apiResponse->code === 101) {
            $res = ['message' => 'Subscriber ' . $this->_requestStoringTypes . ' successfully'];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'subscriber', 'type_name' => 'Subscriber ' . $this->_requestStoringTypes]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'subscriber', 'type_name' => 'Adding Subscriber']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    public function isExist($apiEndpoint, $email)
    {
        $apiEndpoint = "{$apiEndpoint}?email={$email}";
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        return isset($response->email) ? true : false;
    }
}
