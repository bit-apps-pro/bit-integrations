<?php

namespace BitApps\Integrations\Actions\BenchMark;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class BenchMarkAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'benchmark',
        'fields'   => [
            'api_secret' => 'value',
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

        $api_secret = $integrationDetails->api_secret;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $listId = $integrationDetails->listId;

        if (empty($api_secret)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Sendinblue'));
        }
        $recordApiHelper = new BenchMarkService($api_secret, $this->_integrationID);

        $benchMarkApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $actions,
            $listId
        );

        return isset($benchMarkApiResponse->Response->Data) ? true : false;
    }
}
