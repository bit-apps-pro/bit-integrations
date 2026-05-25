<?php

namespace BitApps\Integrations\Actions\Lemlist;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

class LemlistController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'lemlist',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public static function getAllCampaign($requestParams)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $header['Authorization'] = 'Basic ' . base64_encode(":{$requestParams->api_key}");
        $apiEndpoint = 'https://api.lemlist.com/api/campaigns';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);
        $campaigns = [];

        foreach ($apiResponse as $item) {
            $campaigns[] = [
                'campaignId'   => $item->_id,
                'campaignName' => $item->name
            ];
        }

        if ((\count($campaigns)) > 0) {
            wp_send_json_success($campaigns, 200);
        } else {
            wp_send_json_error(__('Campaign fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $selectedCampaign = $integrationDetails->campaignId;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $apiKey = $integrationDetails->api_key;

        if (empty($fieldMap) || empty($apiKey) || empty($selectedCampaign)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Lemlist'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiKey);
        $lemlistApiResponse = $recordApiHelper->execute(
            $selectedCampaign,
            $fieldValues,
            $fieldMap,
            $actions
        );
        if (is_wp_error($lemlistApiResponse) || isset($lemlistApiResponse->_id)) {
            return $lemlistApiResponse;
        }

        return $lemlistApiResponse;
    }
}
