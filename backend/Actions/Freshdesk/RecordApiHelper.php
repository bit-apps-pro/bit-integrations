<?php

/**
 * Freshdesk Record Api
 */

namespace BitApps\Integrations\Actions\Freshdesk;

use BitApps\Integrations\Config;
use BitApps\Integrations\Log\LogHandler;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;

/**
 * Provide functionality for Record insert, upsert
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_api_key;

    public function __construct($api_key, $integrationId)
    {
        $this->_api_key = $api_key;
        $this->_integrationID = $integrationId;
    }

    public function insertTicket($apiEndpoint, $data, $api_key, $fileTicket)
    {
        if (
            empty($data)
            || empty($api_key)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => base64_encode("{$api_key}"),
            'Content-Type'  => 'application/json'
        ];

        if ($fileTicket) {
            $data = $data + ['attachments' => $fileTicket];

            $sendPhotoApiHelper = new AllFilesApiHelper();

            return $sendPhotoApiHelper->allUploadFiles($apiEndpoint, $data, $api_key);
        }
        $data = wp_json_encode($data);
        $apiResponse = HttpHelper::post($apiEndpoint, $data, $header);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            wp_send_json_error(
                empty($apiResponse->error) ? 'Unknown' : $apiResponse->error,
                400
            );
        }
        $apiResponse->generates_on = time();

        return $apiResponse;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->freshdeskFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function generateReqDataFromFieldMapContact($data, $fieldMapContact)
    {
        $fieldMap = [];
        $customFields = [];

        foreach ($fieldMapContact as $key => $field) {
            $actionValue = $field->contactFreshdeskFormField;

            if ($field->formField === 'custom' && isset($field->customValue)) {
                $triggerValue = Common::replaceFieldWithValue($field->customValue, $data);
            } else {
                $triggerValue = $field->formField;
            }

            if (strpos($actionValue, 'btcbi_cf_') === 0 || strpos($actionValue, (string) Config::withPrefix('cf_')) === 0) {
                $fieldName = substr($actionValue, 9);

                $customFields[$fieldName] = $data[$triggerValue];
            } else {
                $fieldMap[$actionValue] = $data[$triggerValue];
            }
        }

        if (!empty($customFields)) {
            $fieldMap['custom_fields'] = $customFields;
        }

        return $fieldMap;
    }

    public function fetchContact($app_base_domamin, $email, $api_key)
    {
        $apiEndpoint = $app_base_domamin . '/api/v2/contacts?email=' . $email;

        if (
            empty($app_base_domamin)
            || empty($email) || empty($api_key)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => base64_encode("{$api_key}"),
            'Content-Type'  => 'application/json'
        ];
        $apiEndpoint = $app_base_domamin . '/api/v2/contacts?email=' . $email;

        return HttpHelper::get($apiEndpoint, null, $header);
    }

    public function insertContact($app_base_domamin, $finalDataContact, $api_key, $avatar)
    {
        if (
            empty($app_base_domamin)
            || empty($finalDataContact)
            || empty($api_key)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = $app_base_domamin . '/api/v2/contacts/';

        if ($avatar) {
            $data = $finalDataContact + ['avatar' => static::getAvatar($avatar)];
            $sendPhotoApiHelper = new FilesApiHelper();

            return $sendPhotoApiHelper->uploadFiles($apiEndpoint, $data, $api_key);
        }

        $header = [
            'Authorization' => base64_encode("{$api_key}"),
            'Content-Type'  => 'application/json'
        ];

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalDataContact), $header);
    }

    public function updateContact($app_base_domamin, $finalDataContact, $api_key, $contactId)
    {
        if (
            empty($app_base_domamin)
            || empty($finalDataContact)
            || empty($api_key) || empty($contactId)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => base64_encode("{$api_key}"),
            'Content-Type'  => 'application/json'
        ];
        $data = wp_json_encode($finalDataContact);
        $apiEndpoint = $app_base_domamin . '/api/v2/contacts/' . $contactId;

        return HttpHelper::request($apiEndpoint, 'PUT', $data, $header);
    }

    public function execute(
        $apiEndpoint,
        $fieldValues,
        $fieldMap,
        $fieldMapContact,
        $integrationDetails,
        $app_base_domamin
    ) {
        $apiKey = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $finalData = $finalData + ['status' => json_decode($integrationDetails->status)] + ['priority' => json_decode($integrationDetails->priority)];

        if (!empty($integrationDetails->selected_ticket_type)) {
            $finalData['type'] = $integrationDetails->selected_ticket_type;
        }
        if (!empty($integrationDetails->selected_ticket_source)) {
            $finalData['source'] = (int) $integrationDetails->selected_ticket_source;
        }
        if (!empty($integrationDetails->selected_ticket_group)) {
            $finalData['group_id'] = (int) $integrationDetails->selected_ticket_group;
        }
        if (!empty($integrationDetails->selected_ticket_product)) {
            $finalData['product_id'] = (int) $integrationDetails->selected_ticket_product;
        }
        if (!empty($integrationDetails->selected_ticket_agent)) {
            $finalData['responder_id'] = (int) $integrationDetails->selected_ticket_agent;
        }

        if ($integrationDetails->contactShow) {
            $finalDataContact = $this->generateReqDataFromFieldMapContact($fieldValues, $fieldMapContact);
            $avatarFieldName = $integrationDetails->actions->attachments;
            $avatar = $fieldValues[$avatarFieldName];
            $apiResponseFetchContact = $this->fetchContact($app_base_domamin, $finalDataContact['email'], $apiKey);

            if (empty($apiResponseFetchContact)) {
                $typeName = 'create-contact';
                $apiResponseContact = $this->insertContact($app_base_domamin, $finalDataContact, $apiKey, $avatar);
            } elseif ($integrationDetails->updateContact) {
                $typeName = 'update-contact';
                $contactId = $apiResponseFetchContact[0]->id;
                $apiResponseContact = $this->updateContact($app_base_domamin, $finalDataContact, $apiKey, $contactId);
            } else {
                $finalData['requester_id'] = $apiResponseFetchContact[0]->id;
                $typeName = 'fetch-contact';
                $apiResponseContact = ['message' => 'Contact already exists'];
            }

            $responseType = 'error';
            if (isset($apiResponseContact->id)) {
                $finalData['requester_id'] = $apiResponseContact->id;
                $responseType = 'success';
            }

            $finalData['requester_id'] = isset($apiResponseContact->id) ? $apiResponseContact->id : '';

            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => $typeName]), $responseType, wp_json_encode($apiResponseContact));
        }

        $attachmentsFieldName = $integrationDetails->actions->file;
        $fileTicket = $fieldValues[$attachmentsFieldName];
        $apiResponse = $this->insertTicket($apiEndpoint, $finalData, $apiKey, $fileTicket);

        if (property_exists($apiResponse, 'errors')) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'ticket', 'type_name' => 'create-ticket']), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'ticket', 'type_name' => 'create-ticket']), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private static function getAvatar($avatar)
    {
        foreach ($avatar as $value) {
            if (\is_array($value)) {
                return static::getAvatar($value);
            }

            return $value;
        }
    }
}
