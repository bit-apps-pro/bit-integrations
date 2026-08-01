<?php

namespace BitApps\Integrations\Actions\ZohoDesk;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use DateTime;
use WP_Error;

/**
 * Provide functionality for Record insert,upsert
 */
class RecordApiHelper
{
    private $_defaultHeader;

    private $_tokenDetails;

    public function __construct($tokenDetails, $orgId, $integId)
    {
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_defaultHeader['Content-Type'] = 'application/json';
        $this->_defaultHeader['orgId'] = $orgId;
        $this->_apiDomain = urldecode($tokenDetails->api_domain ?? '');
        $this->_tokenDetails = $tokenDetails;
        $this->_integrationID = $integId;
    }

    public function insertRecord($dataCenter, $data)
    {
        $insertRecordEndpoint = "https://desk.zoho.{$dataCenter}/api/v1/tickets";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function createContact($dataCenter, $data)
    {
        $getContactEndpoint = "https://desk.zoho.{$dataCenter}/api/v1/contacts";

        return HttpHelper::post($getContactEndpoint, $data, $this->_defaultHeader);
    }

    public function searchContact($dataCenter, $email)
    {
        $searchContactEndpoint = "https://desk.zoho.{$dataCenter}/api/v1/contacts/search?limit=1&email={$email}";

        return HttpHelper::get($searchContactEndpoint, null, $this->_defaultHeader);
    }

    public function execute($department, $dataCenter, $fieldValues, $fieldMap, $required, $actions)
    {
        $fieldData = [];
        $customFieldData = [];
        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->zohoFormField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    if (strtok($fieldPair->zohoFormField, '_') === 'cf') {
                        $customFieldData[$fieldPair->zohoFormField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                    } else {
                        $fieldData[$fieldPair->zohoFormField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                    }
                } else {
                    if (strtok($fieldPair->zohoFormField, '_') === 'cf') {
                        $customFieldData[$fieldPair->zohoFormField] = \is_array($fieldValues[$fieldPair->formField]) ? implode(',', $fieldValues[$fieldPair->formField]) : $fieldValues[$fieldPair->formField];
                    } else {
                        $fieldData[$fieldPair->zohoFormField] = $fieldValues[$fieldPair->formField];
                    }
                }
            }

            if (empty($fieldData[$fieldPair->zohoFormField]) && \in_array($fieldPair->zohoFormField, $required)) {
                // translators: %s: Placeholder value
                $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%s is required for zoho bigin', 'bit-integrations'), $fieldPair->zohoFormField));

                return LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'ticket-create'], 'error', $error);
            }
        }
        if (isset($fieldData['dueDate'])) {
            $originalDate = $fieldData['dueDate'];
            $date = new DateTime($originalDate);
            $ans = $date->format("Y-m-d\TH:i:s.n\Z");
            $fieldData['dueDate'] = $ans;
        }

        $contactData = [
            'lastName' => $fieldData['lastName']
        ];

        if (\array_key_exists('firstName', $fieldData)) {
            $contactData['firstName'] = $fieldData['firstName'];
        }

        $contactId = '';

        if (\array_key_exists('email', $fieldData)) {
            $contactData['email'] = $fieldData['email'];

            $contactApiResponse = $this->searchContact($dataCenter, $contactData['email']);

            if ($contactApiResponse) {
                $contactId = $contactApiResponse->data[0]->id;
            }
        }

        if ($contactId === '') {
            $contactApiResponse = $this->createContact($dataCenter, wp_json_encode($contactData));
            if (isset($contactApiResponse->errorCode)) {
                return LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'contact-create'], 'error', $contactApiResponse);
            }
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'contact-create'], 'success', $contactApiResponse);

            $contactId = $contactApiResponse->id;
        }

        $ticketData = $fieldData;

        unset($ticketData['firstName'], $ticketData['lastName']);

        $ticketData['contactId'] = $contactId;
        $ticketData['departmentId'] = $department;
        $ticketData['assigneeId'] = $actions->ticket_owner;

        if (!empty($actions->product)) {
            $ticketData['productId'] = $actions->product;
        }

        if ($customFieldData) {
            $ticketData['cf'] = $customFieldData;
        }
        $ticketApiResponse = $this->insertRecord($dataCenter, wp_json_encode($ticketData));

        if (isset($ticketApiResponse->errorCode)) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'ticket-create'], 'error', $ticketApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'ticket-create'], 'success', $ticketApiResponse);
        }

        if (!empty($actions->attachments)) {
            $filesApiHelper = new FilesApiHelper($this->_tokenDetails, $this->_defaultHeader['orgId']);
            $fileFound = 0;
            $responseType = 'success';
            $attachmentApiResponses = [];
            $attachments = explode(',', $actions->attachments);
            foreach ($attachments as $fileField) {
                if (isset($fieldValues[$fileField]) && !empty($fieldValues[$fileField])) {
                    $fileFound = 1;
                    if (\is_array($fieldValues[$fileField])) {
                        foreach ($fieldValues[$fileField] as $singleFile) {
                            $attachmentApiResponse = $filesApiHelper->uploadFiles($singleFile, $ticketApiResponse->id, $dataCenter);
                            if (isset($attachmentApiResponse->errorCode)) {
                                $responseType = 'error';
                            }
                            $attachmentApiResponses[] = $attachmentApiResponse;
                        }
                    } else {
                        $attachmentApiResponse = $filesApiHelper->uploadFiles($fieldValues[$fileField], $ticketApiResponse->id, $dataCenter);
                        if (isset($attachmentApiResponse->errorCode)) {
                            $responseType = 'error';
                        }
                        $attachmentApiResponses[] = $attachmentApiResponse;
                    }
                }
            }

            if ($fileFound) {
                LogHandler::save($this->_integrationID, ['type' => 'file', 'type_name' => 'ticket'], $responseType, $attachmentApiResponses);
            }
        }

        return $ticketApiResponse;
    }
}
