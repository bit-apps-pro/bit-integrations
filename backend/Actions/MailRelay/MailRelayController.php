<?php

/**
 * MailRelay Integration
 */

namespace BitApps\Integrations\Actions\MailRelay;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for MailRelay integration
 */
class MailRelayController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'mailrelay',
        'fields'   => [
            'auth_token' => 'value',
            'domain'     => 'domain',
        ],
    ];

    protected $_defaultHeader;

    public function getCustomFields($fieldsRequestParams)
    {
        $authToken = $this->extractAuthToken($fieldsRequestParams);
        $domain = $this->extractDomain($fieldsRequestParams);

        if (empty($authToken) || empty($domain)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $baseUrl = "https://{$domain}.ipzmarketing.com/api/v1/";
        $apiEndpoints = $baseUrl . 'custom_fields';
        $header = [
            'X-AUTH-TOKEN' => $authToken
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);
        $customFields = [];

        foreach ($response as $customField) {
            $customFields[] = [
                'key'      => $customField->id,
                'label'    => $customField->label,
                'required' => false
            ];
        }

        if (isset($response->error) || isset($response->errors) || \gettype($response) == 'string') {
            wp_send_json_error(__('Please enter valid Domain name & API key', 'bit-integrations'), 400);
        } else {
            wp_send_json_success($customFields, 200);
        }
    }

    public function getAllGroups($fieldsRequestParams)
    {
        $authToken = $this->extractAuthToken($fieldsRequestParams);
        $domain = $this->extractDomain($fieldsRequestParams);

        if (empty($authToken) || empty($domain)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $baseUrl = "https://{$domain}.ipzmarketing.com/api/v1/";
        $apiEndpoints = $baseUrl . 'groups?page=1&&per_page=1000';
        $header = [
            'X-AUTH-TOKEN' => $authToken
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);
        $groups = [];

        foreach ($response as $group) {
            $groups[] = [
                'id'   => (string) $group->id,
                'name' => $group->name
            ];
        }

        if (isset($response->error)) {
            wp_send_json_error('Groups fetch failed', 400);
        } else {
            wp_send_json_success($groups, 200);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = !empty($integrationDetails->auth_token) ? $integrationDetails->auth_token : (isset($integrationDetails->api_key) ? $integrationDetails->api_key : '');
        $selectedGroups = $integrationDetails->selectedGroups;
        $fieldMap = $integrationDetails->field_map;
        $status = $integrationDetails->status;

        if (
            empty($fieldMap)
            || empty($auth_token) || empty($status)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'MailRelay'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $mailRelayApiResponse = $recordApiHelper->execute(
            $selectedGroups,
            $fieldValues,
            $fieldMap,
            $status
        );

        if (is_wp_error($mailRelayApiResponse)) {
            return $mailRelayApiResponse;
        }

        return $mailRelayApiResponse;
    }

    private function extractAuthToken($fieldsRequestParams)
    {
        if (!empty($fieldsRequestParams->auth_token)) {
            return $fieldsRequestParams->auth_token;
        }

        if (!empty($fieldsRequestParams->api_key)) {
            return $fieldsRequestParams->api_key;
        }

        return '';
    }

    private function extractDomain($fieldsRequestParams)
    {
        return !empty($fieldsRequestParams->domain) ? $fieldsRequestParams->domain : '';
    }
}
