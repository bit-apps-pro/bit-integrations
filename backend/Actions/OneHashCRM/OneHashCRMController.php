<?php

/**
 * OneHashCRM Integration
 */

namespace BitApps\Integrations\Actions\OneHashCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for OneHashCRM integration
 */
class OneHashCRMController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'onehashcrm',
        'fields'   => [
            'api_key'    => 'value',
            'api_secret' => 'api_secret',
            'domain'     => 'domain',
        ],
    ];

    protected $_defaultHeader;

    protected $apiEndpoint;

    protected $domain;

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $apiSecret = $integrationDetails->api_secret;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $domain = $integrationDetails->domain;

        if (empty($fieldMap) || empty($apiKey) || empty($apiSecret) || empty($actionName) || empty($domain)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'OneHashCRM'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiKey, $apiSecret, $domain);
        $oneHashCRMApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($oneHashCRMApiResponse)) {
            return $oneHashCRMApiResponse;
        }

        return $oneHashCRMApiResponse;
    }

    private function setApiEndpoint()
    {
        return $this->apiEndpoint = "{$this->domain}/api/resource";
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_secret) || empty($fieldsRequestParams->domain) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($apiKey, $apiSecret)
    {
        return
            [
                'Authorization' => "token {$apiKey}:{$apiSecret}",
                'Content-type'  => 'application/json',
            ];
    }
}
