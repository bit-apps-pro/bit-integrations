<?php

namespace BitApps\Integrations\Actions\MailChimp;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MailChimpAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'mailchimp',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at', 'generates_on', 'dc']],
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

        $tokenDetails = MailChimpHelper::resolveTokenDetails($integrationDetails->tokenDetails);
        $listId = $integrationDetails->listId;
        $module = isset($integrationDetails->module) ? $integrationDetails->module : '';
        $tags = $integrationDetails->tags;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;
        $addressFields = $integrationDetails->address_field;

        if (
            empty($tokenDetails)
            || empty($tokenDetails->access_token)
            || empty($tokenDetails->dc)
            || empty($listId)
            || empty($fieldMap)
            || empty($defaultDataConf)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mail Chimp'));
        }
        $recordApiHelper = new MailChimpService($tokenDetails, $this->_integrationID, $integrationDetails);
        $mChimpApiResponse = $recordApiHelper->execute(
            $listId,
            $module,
            $tags,
            $defaultDataConf,
            $fieldValues,
            $fieldMap,
            $actions,
            $addressFields
        );

        if (is_wp_error($mChimpApiResponse)) {
            return $mChimpApiResponse;
        }

        return $mChimpApiResponse;
    }
}
