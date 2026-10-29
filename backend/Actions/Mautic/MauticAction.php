<?php

namespace BitApps\Integrations\Actions\Mautic;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MauticAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'mautic',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            'baseUrl'      => 'baseUrl',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
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
        $baseUrl = $integrationDetails->baseUrl;

        $tokenDetails = $integrationDetails->tokenDetails;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;

        if (
            empty($tokenDetails)
            || empty($fieldMap)
            || empty($defaultDataConf)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'mautic'));
        }
        if (MauticHelper::isTokenExpired($tokenDetails)) {
            $requiredParams['clientId'] = $integrationDetails->clientId;
            $requiredParams['clientSecret'] = $integrationDetails->clientSecret;
            $requiredParams['baseUrl'] = $integrationDetails->baseUrl;
            $requiredParams['tokenDetails'] = $tokenDetails;
            $newTokenDetails = MauticHelper::_refreshAccessToken((object) $requiredParams);
            $tokenDetails = $newTokenDetails;
        }
        $recordApiHelper = new MauticService($tokenDetails, $this->_integrationID, $baseUrl);
        $mChimpApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $defaultDataConf,
            $fieldValues,
            $fieldMap,
            $actions
        );

        if (is_wp_error($mChimpApiResponse)) {
            return $mChimpApiResponse;
        }

        return $mChimpApiResponse;
    }
}
