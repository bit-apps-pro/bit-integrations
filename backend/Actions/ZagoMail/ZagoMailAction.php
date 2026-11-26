<?php

namespace BitApps\Integrations\Actions\ZagoMail;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ZagoMailAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'zagomail',
        'fields'   => [
            'api_public_key' => 'value',
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
        $api_public_key = $integrationDetails->api_public_key;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $listId = $integrationDetails->listId;
        $tags = null;
        if (isset($integrationDetails->selectedTags)) {
            $tags = \is_array($integrationDetails->selectedTags) ? $integrationDetails->selectedTags : explode(',', $integrationDetails->selectedTags);
        }

        if (
            empty($api_public_key)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Sendinblue'));
        }
        $recordApiHelper = new ZagoMailService($api_public_key, $this->_integrationID);

        $zagoMailApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $actions,
            $listId,
            $tags
        );

        if (is_wp_error($zagoMailApiResponse)) {
            return $zagoMailApiResponse;
        }

        return $zagoMailApiResponse;
    }
}
