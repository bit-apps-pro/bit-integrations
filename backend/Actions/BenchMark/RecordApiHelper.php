<?php

/**
 * Benchmark Record Api
 */

namespace BitApps\Integrations\Actions\BenchMark;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_integrationID;

    public function __construct($api_secret, $integId)
    {
        $this->_defaultHeader = $api_secret;
        $this->_integrationID = $integId;
    }

    public function storeOrModifyRecord($method, $listId, $data)
    {
        $apiEndpoint = "https://clientapi.benchmarkemail.com/Contact/{$listId}/ContactDetails";

        $body = ['Data' => static::dataMapping($data)];
        $headers = [
            'AuthToken'    => $this->_defaultHeader,
            'Content-Type' => 'application/json'
        ];

        return HttpHelper::post($apiEndpoint, wp_json_encode($body), $headers);
    }

    public function updateRecord($data, $existContact)
    {
        $id = $existContact->Response->Data[0]->ID;
        $listId = $existContact->Response->Data[0]->ContactMasterID;

        $updateRecordEndpoint = "https://clientapi.benchmarkemail.com/Contact/{$listId}/ContactDetails/{$id}";

        $body = ['Data' => static::dataMapping($data)];
        $headers = [
            'AuthToken'    => $this->_defaultHeader,
            'Content-Type' => 'application/json'
        ];

        return HttpHelper::request($updateRecordEndpoint, 'PATCH', wp_json_encode($body), $headers);
    }

    public function execute($fieldValues, $fieldMap, $actions, $listId)
    {
        $fieldData = [];
        $customFields = [];

        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->benchMarkField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue) && !is_numeric($fieldPair->benchMarkField)) {
                    $fieldData[$fieldPair->benchMarkField] = $fieldPair->customValue;
                } elseif (is_numeric($fieldPair->benchMarkField) && $fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $customFields[] = ['field' => (int) $fieldPair->benchMarkField, 'value' => $fieldPair->customValue];
                } elseif (is_numeric($fieldPair->benchMarkField)) {
                    $customFields[] = ['field' => (int) $fieldPair->benchMarkField, 'value' => $fieldValues[$fieldPair->formField]];
                } else {
                    $fieldData[$fieldPair->benchMarkField] = $fieldValues[$fieldPair->formField];
                }
            }
        }

        if (!empty($customFields)) {
            $fieldData['fieldValues'] = $customFields;
        }
        $benchMark = (object) $fieldData;

        $existContact = $this->existContact($benchMark->email);

        if (($existContact->Response->Count == 0) || ($existContact->Response->Count == null)) {
            $recordApiResponse = $this->storeOrModifyRecord('Contact', $listId, $benchMark);

            $type = 'insert';
        } else {
            if ($actions->update == 'true') {
                $this->updateRecord($benchMark, $existContact);
                $type = 'update';
            } else {
                LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'insert'], 'error', __('Email address already exists in the system', 'bit-integrations'));

                wp_send_json_error(
                    __('Email address already exists in the system', 'bit-integrations'),
                    400
                );
            }
        }

        if (($recordApiResponse && isset($recordApiResponse->errors))) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', $recordApiResponse->errors);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', $recordApiResponse);
        }

        return $recordApiResponse;
    }

    // Check if a contact exists through email.
    private function existContact($email)
    {
        $queries = http_build_query([
            'Search' => $email,
        ]);

        $apiEndpoint = 'https://clientapi.benchmarkemail.com/Contact/ContactDetails?' . $queries;

        $authorizationHeader['AuthToken'] = $this->_defaultHeader;

        return HttpHelper::get($apiEndpoint, null, $authorizationHeader);
    }

    private static function dataMapping($data)
    {
        $fieldsMapping = [
            'Email'      => ['email', 'Email'],
            'FirstName'  => ['firstname', 'FirstName'],
            'MiddleName' => ['middlename', 'MiddleName'],
            'LastName'   => ['lastname', 'LastName'],
            'Field1'     => ['address', 'Field1'],
            'Field2'     => ['city', 'Field2'],
            'Field3'     => ['state', 'Field3'],
            'Field4'     => ['zip', 'Field4'],
            'Field5'     => ['country', 'Field5'],
            'Field6'     => ['phone', 'Field6'],
            'Field7'     => ['fax', 'Field7'],
            'Field8'     => ['cell_phone', 'Field8'],
            'Field9'     => ['company_name', 'Field9'],
            'Field10'    => ['job_title', 'Field10'],
            'Field11'    => ['business_phone', 'Field11'],
            'Field12'    => ['business_fax', 'Field12'],
            'Field13'    => ['business_address', 'Field13'],
            'Field14'    => ['business_city', 'Field14'],
            'Field15'    => ['business_state', 'Field15'],
            'Field16'    => ['business_zip', 'Field16'],
            'Field17'    => ['business_country', 'Field17'],
            'Field18'    => ['notes', 'Field18'],
            'Field19'    => ['date_1', 'Field19'],
            'Field20'    => ['date_2', 'Field20'],
            'Field21'    => ['extra_3', 'Field21'],
            'Field22'    => ['extra_4', 'Field22'],
            'Field23'    => ['extra_5', 'Field23'],
            'Field24'    => ['extra_6', 'Field24']
        ];

        $fields = [];
        foreach ($fieldsMapping as $key => $fieldOptions) {
            foreach ($fieldOptions as $field) {
                if (isset($data->{$field})) {
                    $fields[$key] = $data->{$field};

                    break;
                }
            }

            if (!isset($fields[$key])) {
                $fields[$key] = '';
            }
        }

        $fields['EmailPerm'] = '1';

        return $fields;
    }
}
