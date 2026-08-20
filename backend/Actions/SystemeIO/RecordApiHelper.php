<?php

/**
 * SystemeIO Record Api
 */

namespace BitApps\Integrations\Actions\SystemeIO;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $integrationDetails;

    private $integrationId;

    private $apiUrl;

    private $defaultHeader;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId, $apiKey)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://api.systeme.io/api';
        $this->defaultHeader = [
            'x-api-key'    => $apiKey,
            'Content-Type' => 'application/json'
        ];
    }

    public function addContact($finalData)
    {
        $this->type = 'Add People to Contacts';
        $this->typeName = 'Add People to Contacts';

        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = $this->apiUrl . '/contacts';
        $response = HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);

        if (isset($this->integrationDetails->selectedTag) || !empty($this->integrationDetails->selectedTag)) {
            $this->addTag($response->id, $this->integrationDetails->selectedTag);
        } else {
            return $response;
        }
    }

    public function addTag($contactId, $tag)
    {
        if (empty($contactId)) {
            return ['success' => false, 'message' => __('Contact is not created', 'bit-integrations'), 'code' => 400];
        }
        if (empty($tag)) {
            return ['success' => false, 'message' => __('Required field tag is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = $this->apiUrl . '/contacts/' . $contactId . '/tags';

        $data['tagId'] = (int) $tag;

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($data), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->systemeIOFormField;
            if ($actionValue == 'email') {
                $dataFinal[$actionValue] = ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue];
            } else {
                $dataFinal['fields'][] = (object) [
                    'slug'  => $actionValue,
                    'value' => ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue]
                ];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->addContact($finalData);

        if (!isset($apiResponse->errors)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
