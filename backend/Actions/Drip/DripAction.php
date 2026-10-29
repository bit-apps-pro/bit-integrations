<?php

namespace BitApps\Integrations\Actions\Drip;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class DripAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'drip',
        'fields'   => [
            'api_token' => 'username',
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
        $api_token = $integrationDetails->api_token;
        $fieldMap = $integrationDetails->field_map;
        $accountId = $integrationDetails->selectedAccountId;
        $selectedStatus = $integrationDetails->selectedStatus;
        $selectedTags = $integrationDetails->selectedTags;
        $selectedRemoveTags = $integrationDetails->selectedRemoveTags;

        if (empty($api_token) || empty($fieldMap) || empty($accountId)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Drip'));
        }

        $recordApiHelper = new DripService($api_token, $this->_integrationID);

        $dripApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $accountId,
            $selectedStatus,
            $selectedTags,
            $selectedRemoveTags
        );

        if (is_wp_error($dripApiResponse)) {
            return $dripApiResponse;
        }

        return $dripApiResponse;
    }
}
