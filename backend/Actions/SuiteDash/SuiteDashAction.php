<?php

namespace BitApps\Integrations\Actions\SuiteDash;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SuiteDashAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'suitedash',
        'fields'   => [
            'public_id'  => 'value',
            'secret_key' => 'secret_key',
        ],
    ];

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://app.suitedash.com/secure-api';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $publicId = $integrationDetails->public_id;
        $secretKey = $integrationDetails->secret_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($publicId) || empty($actionName) || empty($secretKey)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'SuiteDash'));
        }

        $recordApiHelper = new SuiteDashService($integrationDetails, $integId, $publicId, $secretKey);
        $suiteDashApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($suiteDashApiResponse)) {
            return $suiteDashApiResponse;
        }

        return $suiteDashApiResponse;
    }
}
