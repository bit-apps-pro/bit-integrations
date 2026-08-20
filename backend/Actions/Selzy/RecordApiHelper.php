<?php

/**
 * Selzy Record Api
 */

namespace BitApps\Integrations\Actions\Selzy;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $baseUrl = 'https://api.selzy.com/en/api/';

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $field_map)
    {
        $dataFinal = [];

        foreach ($field_map as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->selzyFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function response($status, $code, $type, $typeName, $apiResponse)
    {
        $res = ['success' => $code === 200 ? true : false, 'message' => $apiResponse, 'code' => $code];
        LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), $status, wp_json_encode($res));

        return $res;
    }

    public function subscribe($authKey, $listIds, $tags, $option, $overwrite, $formData)
    {
        $data = '';
        foreach ($formData as $key => $field) {
            $field = str_replace(' ', '+', $field);
            $data .= "&fields[{$key}]={$field}";
        }
        $query = http_build_query(
            [
                'format'       => 'json',
                'api_key'      => $authKey,
                'list_ids'     => $listIds,
                'tags'         => $tags,
                'double_optin' => $option,
                'overwrite'    => $overwrite
            ]
        );

        $apiEndpoint = "{$this->baseUrl}subscribe?" . $query . $data;

        $headers = [
            'Content-Type' => 'application/json'
        ];

        return HttpHelper::post($apiEndpoint, null, $headers);
    }

    public function unsubscribe($authKey, $listIds, $formData)
    {
        $apiEndpoints = "{$this->baseUrl}exclude?format=json&api_key={$authKey}&list_ids={$listIds}&contact_type=email&contact={$formData->email}";
        $headers = [
            'Content-Type' => 'application/json'
        ];

        return HttpHelper::post($apiEndpoints, null, $headers);
    }

    public function execute(
        $method,
        $listIds,
        $tags,
        $option,
        $overwrite,
        $fieldValues,
        $field_map,
        $authKey
    ) {
        $finalData = (object) $this->generateReqDataFromFieldMap($fieldValues, $field_map);
        $type_name = 'add-contact';
        if ($overwrite == 1) {
            $type_name = 'contact-overwrite';
        }
        if ($overwrite == 2) {
            $type_name = 'contact-tag-overwrite';
        }
        switch ($method) {
            case 1:
                $apiResponse = $this->subscribe($authKey, $listIds, $tags, $option, $overwrite, $finalData);
                if (!$apiResponse->result) {
                    $this->response('error', 400, 'subscribe', $type_name, $apiResponse);
                } else {
                    $this->response('success', 200, 'subscribe', $type_name, $apiResponse);
                }

                break;
            case 2:
                $apiResponse = $this->unsubscribe($authKey, $listIds, $finalData);
                if (!$apiResponse->result) {
                    $this->response('error', 400, 'unsubscribe', 'remove-contact', $apiResponse);
                } else {
                    $this->response('success', 200, 'unsubscribe', 'remove-contact', $apiResponse);
                }

                break;
        }

        return $apiResponse;
    }
}
