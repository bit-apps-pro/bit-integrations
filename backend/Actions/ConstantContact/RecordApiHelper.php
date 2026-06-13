<?php

/**
 * ConstantContact    Record Api
 */

namespace BitApps\Integrations\Actions\ConstantContact;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, upsert
 */
class RecordApiHelper
{
    private $_integrationDetails;

    private $_integrationID;

    private $_defaultHeader;

    private $baseUrl = 'https://api.cc.email/v3/';

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_defaultHeader = [
            'Authorization' => "Bearer {$this->_integrationDetails->tokenDetails->access_token}",
            'content-type'  => 'application/json'
        ];
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->constantContactFormField;

            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($listIds, $tagIds, $sourceType, $fieldValues, $fieldMap, $addressFields, $phoneFields, $addressType, $phoneType, $update)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        if (empty($finalData['email_address'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $this->mapFields($addressFields, $finalData, $fieldValues, 'street_addresses', $addressType, 'constantContactAddressField');
        $this->mapFields($phoneFields, $finalData, $fieldValues, 'phone_numbers', $phoneType, 'constantContactPhoneField');

        $contact = $this->existContact($finalData['email_address']);

        if ($contact && !$update) {
            LogHandler::save($this->_integrationID, wp_json_encode(['source_type' => 'contact', 'type_name' => 'add-contact']), 'error', __('Email already exists', 'bit-integrations'));

            return $contact;
        }

        $apiResponse = $contact && $update
            ? $this->updateContact($contact, $listIds, $tagIds, $sourceType, $finalData)
            : $this->addContact($listIds, $tagIds, $sourceType, $finalData);

        $this->logApiResponse($apiResponse, $update, $contact);

        return $apiResponse;
    }

    private function updateContact($contact, $listIds, $tagIds, $sourceType, $finalData)
    {
        return $this->sendContactRequest('contacts/' . $contact->contact_id, $listIds, $tagIds, $sourceType, $finalData, 'update_source', $contact);
    }

    private function addContact($listIds, $tagIds, $sourceType, $finalData)
    {
        return $this->sendContactRequest('contacts', $listIds, $tagIds, $sourceType, $finalData, 'create_source');
    }

    private function sendContactRequest($endpoint, $listIds, $tagIds, $sourceType, $finalData, $sourceKey, $contact = null)
    {
        $requestParams = [
            'email_address'    => (object) ['address' => $finalData['email_address']],
            $sourceKey         => $sourceType,
            'list_memberships' => $this->splitValues($listIds),
            'taggings'         => $this->splitValues($tagIds),
        ];

        $apiEndpoint = $this->baseUrl . $endpoint;
        $requestParams = $this->prepareCustomFields($finalData, $requestParams);
        $method = $sourceKey === 'create_source' ? 'post' : 'put';

        if ($sourceKey !== 'create_source' && $contact) {
            $requestParams['taggings'] = array_unique(array_merge($requestParams['taggings'], $contact->taggings ?? []));
            $requestParams['list_memberships'] = array_unique(array_merge($requestParams['list_memberships'], $contact->list_memberships ?? []));
            $this->mergeExistingFields($requestParams, $contact);

            foreach ((array) $contact as $key => $value) {
                if (empty($requestParams[$key]) && !\in_array($key, ['contact_id', 'email_address', 'update_source', 'create_source', 'created_at', 'updated_at', 'custom_fields', 'phone_numbers', 'street_addresses', 'list_memberships', 'taggings', 'notes'])) {
                    $requestParams[$key] = $value;
                }
            }
        }

        return HttpHelper::$method($apiEndpoint, wp_json_encode((object) $requestParams), $this->_defaultHeader);
    }

    private function mergeExistingFields(&$requestParams, $contact)
    {
        $this->mergeCustomFields($requestParams, $contact);
        $this->mergePhoneNumbers($requestParams, $contact);
        $this->mergeStreetAddresses($requestParams, $contact);
    }

    private function mergeCustomFields(&$requestParams, $contact)
    {
        $existingCustomFields = array_column($contact->custom_fields ?? [], 'value', 'custom_field_id');
        foreach ($existingCustomFields as $key => $value) {
            if (!isset($requestParams['custom_fields']) || !\array_key_exists($key, $requestParams['custom_fields'])) {
                $requestParams['custom_fields'][] = ['custom_field_id' => $key, 'value' => $value];
            }
        }
    }

    private function mergePhoneNumbers(&$requestParams, $contact)
    {
        foreach ($contact->phone_numbers ?? [] as $number) {
            if (!isset($requestParams['phone_numbers']) || $requestParams['phone_numbers'][0]['kind'] != $number->kind) {
                $requestParams['phone_numbers'][] = ['kind' => $number->kind, 'phone_number' => $number->phone_number];
            }
        }
    }

    private function mergeStreetAddresses(&$requestParams, $contact)
    {
        foreach ($contact->street_addresses ?? [] as $address) {
            if (!isset($requestParams['street_addresses']) || $requestParams['street_addresses'][0]['kind'] != $address->kind) {
                $requestParams['street_addresses'][] = [
                    'kind'        => $address->kind,
                    'street'      => $address->street ?? '',
                    'city'        => $address->city ?? '',
                    'state'       => $address->state ?? '',
                    'postal_code' => $address->postal_code ?? '',
                    'country'     => $address->country ?? '',
                ];
            } elseif ($requestParams['street_addresses'][0]['kind'] === $address->kind) {
                $this->fillEmptyAddressFields($requestParams['street_addresses'][0], $address);
            }
        }
    }

    private function fillEmptyAddressFields(&$target, $source)
    {
        $fields = ['street', 'city', 'state', 'postal_code', 'country'];
        foreach ($fields as $field) {
            $target[$field] = empty($target[$field]) ? $source->{$field} : $target[$field];
        }
    }

    private function splitValues($values)
    {
        return !empty($values) ? explode(',', $values) : [];
    }

    private function prepareCustomFields($data, $requestParams)
    {
        $customFields = [];
        foreach ($data as $key => $value) {
            if ($key !== 'email_address') {
                // WP 5.1 compat: strpos() in place of str_contains() (WP 5.9)
                if (strpos($key, 'custom-') !== false) {
                    $customFields[] = [
                        'custom_field_id' => str_replace('custom-', '', $key),
                        'value'           => $value,
                    ];
                } else {
                    $requestParams[$key] = $value;
                }
            }
        }

        $requestParams['custom_fields'] = $customFields;

        return $requestParams;
    }

    private function logApiResponse($apiResponse, $update, $contactId = null)
    {
        $type = $update && $contactId ? 'update-contact' : 'add-contact';

        if (is_wp_error($apiResponse) || empty($apiResponse->contact_id) || isset($apiResponse->error_key)) {
            $logLevel = 'error';
        } else {
            $logLevel = 'success';
        }

        LogHandler::save($this->_integrationID, wp_json_encode(['source_type' => 'contact', 'type_name' => $type]), $logLevel, wp_json_encode($apiResponse));
    }

    private function mapFields($fields, &$finalData, $fieldValues, $key, $type, $formFieldKey)
    {
        if (!empty($fields)) {
            $mappedFields = [];
            foreach ($fields as $field) {
                $mappedFields[$field->{$formFieldKey}] = $field->formField === 'custom'
                    ? Common::replaceFieldWithValue($field->customValue, $fieldValues)
                    : ($fieldValues[$field->formField] ?? null);
            }
            $mappedFields['kind'] = $type;
            $finalData[$key] = [$mappedFields];
        }
    }

    private function existContact($email)
    {
        $apiEndpoints = $apiEndpoints = $this->baseUrl . 'contacts?email=' . $email . '&include=custom_fields,list_memberships,taggings,notes,phone_numbers,street_addresses,sms_channel';
        $apiResponse = HttpHelper::get($apiEndpoints, null, $this->_defaultHeader);

        if (is_wp_error($apiResponse) || empty($apiResponse->contacts) || isset($apiResponse->error_key) || (\gettype($apiResponse) === 'array' && $apiResponse[0]->error_key)) {
            return false;
        }

        return $apiResponse->contacts[0] ?? false;
    }
}
