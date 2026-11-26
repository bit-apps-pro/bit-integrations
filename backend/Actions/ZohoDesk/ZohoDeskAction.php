<?php

namespace BitApps\Integrations\Actions\ZohoDesk;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ZohoDeskAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zohodesk',
        'fields'   => [
            'dataCenter'   => 'dataCenter',
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at', 'generates_on', 'api_domain']],
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

        $tokenDetails = $integrationDetails->tokenDetails;
        $orgId = $integrationDetails->orgId;
        $department = $integrationDetails->department;
        $dataCenter = $integrationDetails->dataCenter;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        if (empty($tokenDetails)
        || empty($orgId)
        || empty($department)
        || empty($fieldMap)
        ) {
            return new WP_Error('REQ_FIELD_EMPTY', __('list are required for zoho desk api', 'bit-integrations'));
        }

        $required = $integrationDetails->default->fields->{$orgId}->required ?? [];

        if ((\intval($tokenDetails->generates_on) + (55 * 60)) < time()) {
            $requiredParams['clientId'] = $integrationDetails->clientId;
            $requiredParams['clientSecret'] = $integrationDetails->clientSecret;
            $requiredParams['dataCenter'] = $integrationDetails->dataCenter;
            $requiredParams['tokenDetails'] = $tokenDetails;
            $newTokenDetails = ZohoDeskHelper::refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                ZohoDeskHelper::saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }
        $recordApiHelper = new ZohoDeskService($tokenDetails, $orgId, $this->_integrationID);

        $zdeskApiResponse = $recordApiHelper->execute(
            $department,
            $dataCenter,
            $fieldValues,
            $fieldMap,
            $required,
            $actions
        );

        if (is_wp_error($zdeskApiResponse)) {
            return $zdeskApiResponse;
        }

        return $zdeskApiResponse;
    }
}
