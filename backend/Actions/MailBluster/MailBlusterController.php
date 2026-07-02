<?php

/**
 * MailBluster Integration
 */

namespace BitApps\Integrations\Actions\MailBluster;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for MailBluster integration
 */
class MailBlusterController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'mailbluster',
        'fields'   => [
            'auth_token' => 'value',
        ],
    ];

    protected $_defaultHeader;

    private $baseUrl = 'https://api.mailbluster.com/api/';

    public function fetchCustomFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoints = $this->baseUrl . 'fields';
        $apiKey = $fieldsRequestParams->auth_token;
        $header = [
            'Authorization' => $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);
        $customFields = [];

        foreach ($response->fields as $field) {
            $customFields[] = [
                'key'      => $field->fieldMergeTag,
                'label'    => $field->fieldLabel,
                'required' => false
            ];
        }

        if (property_exists($response, 'fields')) {
            wp_send_json_success($customFields, 200);
        } else {
            wp_send_json_error(__('Please enter valid API key', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $selectedTags = $integrationDetails->selectedTags;
        $fieldMap = $integrationDetails->field_map;
        $subscribed = $integrationDetails->subscribed;

        if (
            empty($fieldMap)
            || empty($auth_token) || empty($subscribed)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'GetResponse'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $mailBlusterApiResponse = $recordApiHelper->execute(
            $selectedTags,
            $fieldValues,
            $fieldMap,
            $subscribed
        );

        if (is_wp_error($mailBlusterApiResponse)) {
            return $mailBlusterApiResponse;
        }

        return $mailBlusterApiResponse;
    }
}
