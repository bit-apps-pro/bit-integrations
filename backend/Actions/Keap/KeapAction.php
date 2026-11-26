<?php

namespace BitApps\Integrations\Actions\Keap;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class KeapAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'keap',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at', 'generates_on']],
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

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
        $tokenDetails = $integrationDetails->tokenDetails;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;

        if (
            empty($tokenDetails)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Keap'));
        }

        if ((\intval($tokenDetails->generates_on) + (60 * 60 * 23)) < time()) {
            $requiredParams['clientId'] = $integrationDetails->clientId;
            $requiredParams['clientSecret'] = $integrationDetails->clientSecret;
            $requiredParams['tokenDetails'] = $tokenDetails;
            $newTokenDetails = KeapHelper::refreshAccessToken((object) $requiredParams);
            $tokenDetails = $newTokenDetails;
            KeapHelper::saveRefreshedToken($this->_integrationID, $tokenDetails);
        }

        $recordApiHelper = new KeapService($tokenDetails, $this->_integrationID);
        $keapApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $fieldValues,
            $fieldMap,
            $actions
        );

        if (is_wp_error($keapApiResponse)) {
            return $keapApiResponse;
        }

        return $keapApiResponse;
    }
}
