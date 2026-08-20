<?php

namespace BitApps\Integrations\Actions\GoogleContacts;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    protected $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function handleInsertContact($data)
    {
        $apiEndpoint = 'https://people.googleapis.com/v1/people:createContact';
        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ];

        $dataNew = [
            'phoneNumbers' => [
                [
                    'value' => !empty($data['phoneNumber']) ? $data['phoneNumber'] : '',
                ]
            ],
            'names' => [
                [
                    'givenName'  => !empty($data['name']) ? $data['name'] : '',
                    'familyName' => !empty($data['lastName']) ? $data['lastName'] : '',
                ]
            ],
            'addresses' => [
                [
                    'city'    => !empty($data['city']) ? $data['city'] : '',
                    'country' => !empty($data['country']) ? $data['country'] : '',
                ]
            ],
            'nicknames' => [
                [
                    'value' => !empty($data['nickname']) ? $data['nickname'] : ''
                ]
            ],
            'locations' => [
                [
                    'value' => !empty($data['locations']) ? $data['locations'] : ''
                ]
            ],
            'biographies' => [
                [
                    'value' => !empty($data['biographies']) ? $data['biographies'] : ''
                ]
            ],
            'emailAddresses' => [
                [
                    'value' => !empty($data['email']) ? $data['email'] : ''
                ]
            ],
            'occupations' => [
                [
                    'value' => !empty($data['occupation']) ? $data['occupation'] : ''
                ]
            ],
            'organizations' => [
                [
                    'name' => !empty($data['organization']) ? $data['organization'] : '',
                ]
            ],
        ];

        return HttpHelper::post($apiEndpoint, wp_json_encode($dataNew), $headers);
    }

    public function searchContact($data)
    {
        $apiEndpoint = 'https://people.googleapis.com/v1/people:searchContacts';
        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ];

        $data = [
            'query'    => $data['name'],
            'readMask' => 'emailAddresses',
        ];

        return HttpHelper::get($apiEndpoint, $data, $headers);
    }

    public function handleUpdateContact($data, $resourceName, $eTag)
    {
        $apiEndpoint = "https://people.googleapis.com/v1/{$resourceName}:updateContact?updatePersonFields=phoneNumbers,names,emailAddresses";
        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ];

        $dataNew = [
            'etag'         => $eTag,
            'phoneNumbers' => [
                [
                    'value' => !empty($data['phoneNumber']) ? $data['phoneNumber'] : '',
                ]
            ],
            'names' => [
                [
                    'givenName' => !empty($data['name']) ? $data['name'] : '',

                ]
            ],
            'emailAddresses' => [
                [
                    'value' => !empty($data['email']) ? $data['email'] : ''
                ]
            ],
        ];

        return HttpHelper::request($apiEndpoint, 'PATCH', wp_json_encode($dataNew), $headers);
    }

    public function handleUploadPhoto($imageLocation, $resourceName)
    {
        $apiEndpoint = "https://people.googleapis.com/v1/{$resourceName}:updateContactPhoto";
        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ];

        // $dataNew = [
        //     "photoBytes" => base64_encode(file_get_contents(json_decode($fieldData['organization'])[0])),
        //     "personFields" => 'addresses,biographies,emailAddresses,names,phoneNumbers'
        // ];

        $response = Common::safeRemoteGet($imageLocation);
        if (is_wp_error($response)) {
            return $response;
        }
        $imageData = wp_remote_retrieve_body($response);

        $dataNew = [
            'photoBytes'   => base64_encode($imageData),
            'personFields' => 'addresses,biographies,emailAddresses,names,phoneNumbers'
        ];

        return HttpHelper::request($apiEndpoint, 'PATCH', wp_json_encode($dataNew), $headers);
    }

    public function executeRecordApi($integrationId, $fieldValues, $fieldMap, $actions, $mainAction)
    {
        $fieldData = [];
        foreach ($fieldMap as $value) {
            if (!empty($value->googleContactsFormField)) {
                if ($value->formField === 'custom' && isset($value->customValue) && Common::replaceFieldWithValue($value->customValue, $fieldValues)) {
                    $fieldData[$value->googleContactsFormField] = Common::replaceFieldWithValue($value->customValue, $fieldValues);
                } else {
                    $fieldData[$value->googleContactsFormField] = \is_array($fieldValues[$value->formField]) ? wp_json_encode($fieldValues[$value->formField]) : $fieldValues[$value->formField];
                }
            }
        }

        if ($mainAction === '1') {
            $contactResponse = $this->handleInsertContact($fieldData);
            $imageLocation = $fieldValues[$actions->attachments][0];
            $resourceName = $contactResponse->resourceName;

            if (!empty($imageLocation)) {
                $this->handleUploadPhoto($fieldData, $imageLocation, $resourceName);
            }
            if (!property_exists($contactResponse, 'error')) {
                LogHandler::save($integrationId, wp_json_encode(['type' => 'contact', 'type_name' => 'insert']), 'success', wp_json_encode($contactResponse));
            } else {
                LogHandler::save($integrationId, wp_json_encode(['type' => 'contact', 'type_name' => 'insert']), 'error', wp_json_encode(__('Fail to add contact', 'bit-integrations')));
            }

            return;
        }

        if ($mainAction === '2') {
            $searchResponse = $this->searchContact($fieldData);
            if (!empty($searchResponse)) {
                $resourceName = $searchResponse->results[0]->person->resourceName;
                $eTag = $searchResponse->results[0]->person->etag;
                if (!empty($resourceName) && !empty($eTag)) {
                    $updateResponse = $this->handleUpdateContact($fieldData, $resourceName, $eTag);
                    if (!property_exists($updateResponse, 'error')) {
                        LogHandler::save($integrationId, wp_json_encode(['type' => 'contact', 'type_name' => 'update']), 'success', wp_json_encode($updateResponse));
                    } else {
                        LogHandler::save($integrationId, wp_json_encode(['type' => 'contact', 'type_name' => 'update']), 'error', wp_json_encode(__('Fail to update contact', 'bit-integrations')));
                    }
                    $imageLocation = $fieldValues[$actions->attachments][0];
                    if (!empty($imageLocation)) {
                        $this->handleUploadPhoto($imageLocation, $resourceName);
                    }

                    return;
                }
            } else {
                LogHandler::save($integrationId, wp_json_encode(['type' => 'contact', 'type_name' => 'update']), 'error', wp_json_encode(__('Contact not found, please check the name', 'bit-integrations')));
            }
        }
    }
}
