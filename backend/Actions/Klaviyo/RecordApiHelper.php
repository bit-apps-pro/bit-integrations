<?php

/**
 * Klaviyo    Record Api
 */

namespace BitApps\Integrations\Actions\Klaviyo;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $baseUrl = 'https://a.klaviyo.com/api/';

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $field_map)
    {
        $dataFinal = [];
        foreach ($field_map as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->klaviyoFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute(
        $listId,
        $fieldValues,
        $field_map,
        $authKey
    ) {
        $typeName = 'add-members';
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $field_map);
        $apiResponse = $this->handleProfile($authKey, $listId, $finalData, $fieldValues, $typeName);

        if (isset($apiResponse->errors)) {
            $res = ['success' => false, 'message' => $apiResponse->errors[0]->detail, 'code' => 400];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'members', 'type_name' => $typeName]), 'error', wp_json_encode($res));
        } else {
            $res = ['success' => true, 'message' => $apiResponse, 'code' => 200];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'members', 'type_name' => $typeName]), 'success', wp_json_encode($res));
        }

        return $apiResponse;
    }

    private function handleProfile($authKey, $listId, $data, $fieldValues, &$typeName)
    {
        $id = $this->existProfile($data['email'], $authKey);

        $data = [
            'data' => [
                'type'       => 'profile',
                'attributes' => $data
            ]
        ];

        $data = Hooks::apply(Config::withPrefix('klaviyo_custom_properties'), $data, $this->_integrationDetails->custom_field_map ?? [], $fieldValues);

        $data = Hooks::apply('btcbi_klaviyo_custom_properties', $data, $this->_integrationDetails->custom_field_map ?? [], $fieldValues);

        if (empty($this->_integrationDetails->update) || empty($id)) {
            return $this->createProfile($authKey, $listId, $data, $fieldValues);
        }

        $typeName = 'update-members';
        $response = Hooks::apply(Config::withPrefix('klaviyo_update_profile'), false, $id, $authKey, $data);

        $response = Hooks::apply('btcbi_klaviyo_update_profile', $response, $id, $authKey, $data);

        if (!$response) {
            // translators: %s: Plugin name
            return (object) ['errors' => [(object) ['detail' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')]]];
        }

        return $response;
    }

    private function existProfile($email, $authKey)
    {
        if (empty($email)) {
            return false;
        }

        $apiEndpoints = "https://a.klaviyo.com/api/profiles?filter=equals(email,'{$email}')";
        $apiResponse = HttpHelper::get($apiEndpoints, null, $this->setHeaders($authKey));

        return $apiResponse->data[0]->id ?? false;
    }

    private function createProfile($authKey, $listId, $data, $fieldValues)
    {
        $apiEndpoints = "{$this->baseUrl}profiles";
        $apiResponse = HttpHelper::post($apiEndpoints, wp_json_encode($data), $this->setHeaders($authKey));

        if (!isset($apiResponse->data)) {
            return $apiResponse;
        }

        $data = [
            'data' => [(object) [
                'type' => 'profile',
                'id'   => $apiResponse->data->id
            ]]
        ];

        $apiEndpoints = "{$this->baseUrl}lists/{$listId}/relationships/profiles";

        return HttpHelper::post($apiEndpoints, wp_json_encode($data), $this->setHeaders($authKey));
    }

    private function setHeaders($authKey)
    {
        return [
            'Authorization' => "Klaviyo-API-Key {$authKey}",
            'Content-Type'  => 'application/json',
            'accept'        => 'application/json',
            'revision'      => '2024-02-15'
        ];
    }
}
