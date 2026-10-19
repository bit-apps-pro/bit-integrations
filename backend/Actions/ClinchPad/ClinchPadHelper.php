<?php

/**
 * ClinchPad Integration
 */

namespace BitApps\Integrations\Actions\ClinchPad;

use BitApps\Integrations\Core\Util\HttpHelper;

class ClinchPadHelper
{
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
}
