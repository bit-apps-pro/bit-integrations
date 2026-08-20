<?php

/**
 * DirectIQ Record Api
 */

namespace BitApps\Integrations\Actions\DirectIq;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_integrationID;

    public function __construct($client_id, $client_secret, $integId)
    {
        $this->_defaultHeader = 'Basic ' . base64_encode("{$client_id}:{$client_secret}");
        $this->_integrationID = $integId;
    }

    // for adding a contact to a list.
    public function storeOrModifyRecord($method, $listId, $data)
    {
        $apiEndpoint = "https://rest.directiq.com/contacts/lists/importcontacts/{$listId}";
        $headers = [
            'accept'        => 'application/json',
            'Authorization' => $this->_defaultHeader,
            'content-type'  => 'application/*+json'
        ];
        $finalData = [
            'contacts' => [
                [
                    'email'    => $data->email ?? '',
                    'fistName' => $data->first_name ?? '',
                    'lastName' => $data->last_name ?? ''
                ],
            ]
        ];

        HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $headers);

        return HttpHelper::$responseCode;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->directIqField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = $value->customValue;
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actions, $listId)
    {
        $fieldData = [];
        $customFields = [];

        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        $directIq = (object) $finalData;

        $recordApiResponse = $this->storeOrModifyRecord('contact', $listId, $directIq);

        $type = 'insert';

        if ($recordApiResponse !== 200) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', __('There is an error while inserting record', 'bit-integrations'));
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', __('Record inserted successfully', 'bit-integrations'));
        }

        return $recordApiResponse;
    }
}
