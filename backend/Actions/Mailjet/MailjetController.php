<?php

/**
 * Mailjet Integration
 */

namespace BitApps\Integrations\Actions\Mailjet;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Mailjet integration
 */
class MailjetController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'mailjet',
        'fields'   => [
            'apiKey'    => 'username',
            'secretKey' => 'password',
        ],
    ];

    public function getAllLists($fieldsRequestParams)
    {
        $apiKey = !empty($fieldsRequestParams->apiKey) ? $fieldsRequestParams->apiKey : (!empty($fieldsRequestParams->username) ? $fieldsRequestParams->username : '');
        $secretKey = !empty($fieldsRequestParams->secretKey) ? $fieldsRequestParams->secretKey : (!empty($fieldsRequestParams->password) ? $fieldsRequestParams->password : '');
        if (empty($secretKey) || empty($apiKey)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoints = 'https://api.mailjet.com/v3/REST/contactslist?Limit=1000';
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:{$secretKey}")
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);

        if (!empty($response)) {
            foreach ($response->Data as $list) {
                $lists[] = [
                    'id'   => (string) $list->ID,
                    'name' => $list->Name
                ];
            }
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error(__('Please enter valid API key', 'bit-integrations'), 400);
        }
    }

    public function getCustomFields($fieldsRequestParams)
    {
        $apiKey = !empty($fieldsRequestParams->apiKey) ? $fieldsRequestParams->apiKey : (!empty($fieldsRequestParams->username) ? $fieldsRequestParams->username : '');
        $secretKey = !empty($fieldsRequestParams->secretKey) ? $fieldsRequestParams->secretKey : (!empty($fieldsRequestParams->password) ? $fieldsRequestParams->password : '');
        if (empty($secretKey) || empty($apiKey)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoints = 'https://api.mailjet.com/v3/REST/contactmetadata?Limit=1000';
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:{$secretKey}")
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);

        foreach ($response->Data as $customField) {
            $customFields[] = [
                'key'      => $customField->Name,
                'label'    => ucfirst(str_replace('_', ' ', $customField->Name)),
                'required' => false
            ];
        }

        if (!empty($customFields)) {
            wp_send_json_success($customFields, 200);
        } else {
            wp_send_json_error(__('Custom fields fetch failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = !empty($integrationDetails->apiKey) ? $integrationDetails->apiKey : (isset($integrationDetails->username) ? $integrationDetails->username : '');
        $secretKey = !empty($integrationDetails->secretKey) ? $integrationDetails->secretKey : (isset($integrationDetails->password) ? $integrationDetails->password : '');
        $selectedLists = $integrationDetails->selectedLists;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($secretKey) || empty($apiKey) || empty($selectedLists)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mailjet'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiKey, $secretKey);
        $mailjetApiResponse = $recordApiHelper->execute(
            $selectedLists,
            $fieldValues,
            $fieldMap
        );

        if (is_wp_error($mailjetApiResponse)) {
            return $mailjetApiResponse;
        }

        return $mailjetApiResponse;
    }
}
