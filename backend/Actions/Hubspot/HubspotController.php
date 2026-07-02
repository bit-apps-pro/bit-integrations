<?php

namespace BitApps\Integrations\Actions\Hubspot;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

final class HubspotController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'hubspot',
        'fields'   => [
            'api_key' => 'token',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function getFields($requestParams)
    {
        if (empty($requestParams->api_key) || empty($requestParams->type)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = "https://api.hubapi.com/crm/v3/properties/{$requestParams->type}";
        $header = [
            'authorization' => 'Bearer ' . $requestParams->api_key
        ];

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($apiResponse->results) && !empty($apiResponse->results)) {
            foreach ($apiResponse->results as $field) {
                if ($requestParams->type == 'contact' && $field->formField === true) {
                    $fields[] = [
                        'key'      => $field->name,
                        'label'    => $field->label,
                        'required' => $field->name == 'email' ? true : false
                    ];
                } elseif ($requestParams->type == 'deal' && ($field->name == 'dealname' || $field->formField === true)) {
                    $fields[] = [
                        'key'      => $field->name,
                        'label'    => $field->label,
                        'required' => $field->name == 'dealname' ? true : false
                    ];
                } elseif ($requestParams->type == 'ticket' && $field->formField === true) {
                    $fields[] = [
                        'key'      => $field->name,
                        'label'    => $field->label,
                        'required' => $field->name == 'subject' ? true : false
                    ];
                } elseif ($requestParams->type == 'company' && $field->formField === true && $field->fieldType != 'radio' && $field->fieldType != 'select') {
                    $fields[] = [
                        'key'      => $field->name,
                        'label'    => $field->label,
                        'required' => $field->name == 'name' ? true : false
                    ];
                }
            }

            wp_send_json_success($fields, 200);
        } else {
            wp_send_json_error(__('fields fetching failed', 'bit-integrations'), 400);
        }
    }

    public static function getAllIndustry($requestParams)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = 'https://api.hubapi.com/crm/v3/properties/company';
        $header = [
            'authorization' => 'Bearer ' . $requestParams->api_key
        ];

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($apiResponse->results) && !empty($apiResponse->results)) {
            $options = [];
            $industries = array_filter($apiResponse->results, function ($item) {
                return $item->name == 'industry' && $item->fieldType == 'select';
            });

            foreach (array_column($industries, null)[0]->options as $option) {
                $options[] = (object) [
                    'value' => $option->value,
                    'label' => $option->label
                ];
            }
            wp_send_json_success($options, 200);
        } else {
            wp_send_json_error(__('fields fetching failed', 'bit-integrations'), 400);
        }
    }

    public static function getAllOwners($requestParams)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = 'https://api.hubapi.com/crm/v3/owners';
        $header = [
            'authorization' => 'Bearer ' . $requestParams->api_key
        ];

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($apiResponse->results) && !empty($apiResponse->results)) {
            foreach ($apiResponse->results as $owner) {
                $owners[] = [
                    'ownerId'   => $owner->id,
                    'ownerName' => "{$owner->firstName} {$owner->lastName}"
                ];
            }
            wp_send_json_success($owners, 200);
        } else {
            wp_send_json_error('fields fetching failed', 400);
        }
    }

    public static function getAllPipelines($requestParams)
    {
        if (empty($requestParams->api_key) || empty($requestParams->type)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = "https://api.hubapi.com/crm/v3/pipelines/{$requestParams->type}";
        $header = [
            'authorization' => 'Bearer ' . $requestParams->api_key
        ];

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($apiResponse->results) && !empty($apiResponse->results)) {
            $pipelines = $apiResponse->results;
            $response = [];

            foreach ($pipelines as $pipeline) {
                $tempStage = [];
                foreach ($pipeline->stages as $stage) {
                    $tempStage[] = (object) [
                        'stageId'   => $stage->id,
                        'stageName' => $stage->label
                    ];
                }
                $response[] = (object) [
                    'pipelineId'   => $pipeline->id,
                    'pipelineName' => $pipeline->label,
                    'stages'       => $tempStage
                ];
            }
            wp_send_json_success($response, 200);
        } else {
            wp_send_json_error(__('Pipelines fetching failed', 'bit-integrations'), 400);
        }
    }

    public static function getAllContacts($requestParams)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = 'https://api.hubapi.com/crm/v3/objects/contacts?limit=100';
        $header = [
            'authorization' => 'Bearer ' . $requestParams->api_key
        ];

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($apiResponse->results) && !empty($apiResponse->results)) {
            foreach ($apiResponse->results as $contact) {
                $contactName = !empty($contact->properties->firstname || $contact->properties->lastname) ? $contact->properties->firstname . ' ' . $contact->properties->lastname : 'N/A';
                $contacts[] = [
                    'contactId'   => $contact->id,
                    'contactName' => $contactName
                ];
            }
            wp_send_json_success($contacts, 200);
        } else {
            wp_send_json_error(__('Contacts fetching failed', 'bit-integrations'), 400);
        }
    }

    public static function getAllCompany($requestParams)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = 'https://api.hubapi.com/crm/v3/objects/companies?limit=100';
        $header = [
            'authorization' => 'Bearer ' . $requestParams->api_key
        ];

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($apiResponse->results) && !empty($apiResponse->results)) {
            foreach ($apiResponse->results as $company) {
                $companies[] = [
                    'companyId'   => $company->id,
                    'companyName' => $company->properties->name
                ];
            }
            wp_send_json_success($companies, 200);
        } else {
            wp_send_json_error(__('fields fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;

        if (empty($fieldMap) || empty($apiKey)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('Access token, fields map are required for hubspot api', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }

        $recordApiHelper = new HubspotRecordApiHelper($apiKey);
        $hubspotResponse = $recordApiHelper->executeRecordApi($integId, $integrationDetails, $fieldValues, $fieldMap);

        if (is_wp_error($hubspotResponse)) {
            return $hubspotResponse;
        }

        return $hubspotResponse;
    }
}
