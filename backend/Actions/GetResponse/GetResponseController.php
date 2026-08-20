<?php

/**
 * GetResponse Integration
 */

namespace BitApps\Integrations\Actions\GetResponse;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for GetResponse integration
 */
class GetResponseController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'getresponse',
        'fields'   => [
            'auth_token' => 'value',
        ],
    ];

    protected $_defaultHeader;

    private $baseUrl = 'https://api.getresponse.com/v3/';

    public function fetchCustomFields($requestParams)
    {
        if (empty($requestParams->auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoints = $this->baseUrl . 'custom-fields';
        $apiKey = $requestParams->auth_token;
        $header = [
            'X-Auth-Token' => 'api-key ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);
        $formattedResponse = [];

        foreach ($response as $value) {
            $formattedResponse[]
                = [
                    'key'      => $value->customFieldId,
                    'label'    => ucfirst(str_replace('_', ' ', $value->name)),
                    'required' => false
                ];
        }

        if ($response !== 'Unauthorized') {
            wp_send_json_success($formattedResponse, 200);
        } else {
            wp_send_json_error(
                __('The token is invalid', 'bit-integrations'),
                400
            );
        }
    }

    public function fetchAllTags($requestParams)
    {
        if (empty($requestParams->auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoints = $this->baseUrl . 'tags';
        $apiKey = $requestParams->auth_token;
        $header = [
            'X-Auth-Token' => 'api-key ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);
        $formattedResponse = [];

        foreach ($response as $value) {
            $formattedResponse[]
                = [
                    'tagId' => $value->tagId,
                    'name'  => $value->name,
                ];
        }

        if ($response !== 'Unauthorized') {
            wp_send_json_success($formattedResponse, 200);
        } else {
            wp_send_json_error(
                __('The token is invalid', 'bit-integrations'),
                400
            );
        }
    }

    public function fetchAllList($requestParams)
    {
        if (empty($requestParams->auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoints = $this->baseUrl . 'campaigns';
        $apiKey = $requestParams->auth_token;
        $header = [
            'X-Auth-Token' => 'api-key ' . $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);
        $campaigns = [];

        foreach ($response as $campaign) {
            $campaigns[] = [
                'campaignId' => $campaign->campaignId,
                'name'       => $campaign->name
            ];
        }

        if (!empty($response) && isset($response[0]) && property_exists($response[0], 'campaignId')) {
            wp_send_json_success($campaigns, 200);
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
        $type = $integrationDetails->mailer_lite_type;
        $campaignId = $integrationDetails->campaignId;
        $campaign = (object) ['campaignId' => $campaignId];

        if (
            empty($fieldMap)
            || empty($auth_token) || empty($campaignId)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'GetResponse'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $getResponseApiResponse = $recordApiHelper->execute(
            $selectedTags,
            $type,
            $fieldValues,
            $fieldMap,
            $auth_token,
            $campaign
        );

        if (is_wp_error($getResponseApiResponse)) {
            return $getResponseApiResponse;
        }

        return $getResponseApiResponse;
    }
}
