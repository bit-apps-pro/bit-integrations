<?php

namespace BitApps\Integrations\Actions\Salesforce;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SalesforceAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'salesforce',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at', 'instance_url']],
        ],
    ];

    private $_integrationID;

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $this->_integrationID = $integrationData->id;
        $tokenDetails = $integrationDetails->tokenDetails;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;

        if (empty($tokenDetails)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('list are required for zoho desk api', 'bit-integrations'));
        }

        if (SalesforceHelper::isTokenExpired($tokenDetails)) {
            $newTokenDetails = SalesforceHelper::refreshAccessToken((object) [
                'clientId'     => $integrationDetails->clientId,
                'clientSecret' => $integrationDetails->clientSecret,
                'tokenDetails' => $tokenDetails
            ]);

            if ($newTokenDetails) {
                SalesforceHelper::saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }

        $recordApiHelper = new SalesforceService($tokenDetails, $this->_integrationID);

        $salesforceApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $fieldValues,
            $fieldMap,
            $actions
        );

        if (is_wp_error($salesforceApiResponse)) {
            return $salesforceApiResponse;
        }

        return $salesforceApiResponse;
    }
}
