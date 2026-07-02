<?php

/**
 * ClinchPad Integration
 */

namespace BitApps\Integrations\Actions\ClinchPad;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for ClinchPad integration
 */
class ClinchPadController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'clinchpad',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    protected $_defaultHeader;

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://www.clinchpad.com/api/v1';
    }

    public function getAllParentOrganizations($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/organizations';
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("api-key:{$apiKey}")
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response)) {
            foreach ($response as $parentOrganization) {
                $parentOrganizations[] = [
                    'id'   => (string) $parentOrganization->_id,
                    'name' => $parentOrganization->name
                ];
            }
            wp_send_json_success($parentOrganizations, 200);
        } else {
            wp_send_json_error(__('ParentOrganizations fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMPipelines($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/pipelines';
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("api-key:{$apiKey}")
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!empty($response)) {
            foreach ($response as $pipeline) {
                $pipelines[] = [
                    'id'   => $pipeline->_id,
                    'name' => $pipeline->name
                ];
            }
            wp_send_json_success($pipelines, 200);
        } else {
            wp_send_json_error(__('Pipelines fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMContacts($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->apiEndpoint . '/contacts';
        $headers = [
            'Authorization' => 'Basic ' . base64_encode("api-key:{$apiKey}")
        ];

        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!empty($response)) {
            foreach ($response as $contact) {
                $contacts[] = [
                    'id'   => $contact->_id,
                    'name' => $contact->name
                ];
            }
            wp_send_json_success($contacts, 200);
        } else {
            wp_send_json_error(__('Contacts fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authToken = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($authToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'ClinchPad'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $clinchPadApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($clinchPadApiResponse)) {
            return $clinchPadApiResponse;
        }

        return $clinchPadApiResponse;
    }
}
