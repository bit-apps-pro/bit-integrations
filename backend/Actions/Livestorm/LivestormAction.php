<?php

namespace BitApps\Integrations\Actions\Livestorm;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class LivestormAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'livestorm',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://api.livestorm.co/v1';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($apiKey)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Livestorm'));
        }

        $recordApiHelper = new LivestormService($integrationDetails, $integId, $apiKey);
        $livestormApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($livestormApiResponse)) {
            return $livestormApiResponse;
        }

        return $livestormApiResponse;
    }
}
