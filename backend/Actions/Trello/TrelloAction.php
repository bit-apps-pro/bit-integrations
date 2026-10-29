<?php

namespace BitApps\Integrations\Actions\Trello;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class TrelloAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH1,
        'slug'     => 'trello',
        'fields'   => [
            'clientId'    => 'consumer_key',
            'accessToken' => 'access_token',
        ],
    ];

    /**
     * Save updated access_token to avoid unnecessary token generation
     *
     * @param object $integrationData Details of flow
     * @param array  $fieldValues     Data to send Mail Chimp
     *
     * @return null
     */
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $customFieldMap = $integrationDetails->custom_field_map ?? [];
        $defaultDataConf = $integrationDetails->default;

        if (
            empty($integrationDetails->listId)
            || empty($fieldMap)
            || empty($defaultDataConf)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Trello'));
        }
        $recordApiHelper = new TrelloService($integrationDetails, $integId);
        $trelloApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $customFieldMap);

        if (is_wp_error($trelloApiResponse)) {
            return $trelloApiResponse;
        }

        return $trelloApiResponse;
    }
}
