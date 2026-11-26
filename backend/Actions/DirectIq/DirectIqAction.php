<?php

namespace BitApps\Integrations\Actions\DirectIq;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class DirectIqAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'directiq',
        'fields'   => [
            'client_id'     => 'username',
            'client_secret' => 'password',
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

        $client_id = $integrationDetails->client_id;
        $client_secret = $integrationDetails->client_secret;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $listId = $integrationDetails->listId;

        if (
            empty($client_id) || empty($client_secret) || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'DirectIQ'));
        }
        $recordApiHelper = new DirectIqService($client_id, $client_secret, $this->_integrationID);

        $directIqApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $actions,
            $listId,
        );

        if (is_wp_error($directIqApiResponse)) {
            return $directIqApiResponse;
        }

        return $directIqApiResponse;
    }
}
