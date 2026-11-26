<?php

namespace BitApps\Integrations\Actions\Hubspot;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

final class HubspotAction
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

        $recordApiHelper = new HubspotService($apiKey);
        $hubspotResponse = $recordApiHelper->executeRecordApi($integId, $integrationDetails, $fieldValues, $fieldMap);

        if (is_wp_error($hubspotResponse)) {
            return $hubspotResponse;
        }

        return $hubspotResponse;
    }
}
