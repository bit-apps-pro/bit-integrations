<?php

namespace BitApps\Integrations\Actions\ZohoMarketingHub;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ZohoMarketingHubAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zohomarketinghub',
        // Connections store the UI's display name, which carries the Zoho rename.
        'aliases'  => ['Zoho Marketing Automation(Zoho Marketing Hub)'],
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
        $list = $integrationDetails->list;
        $dataCenter = $integrationDetails->dataCenter;
        $fieldMap = $integrationDetails->field_map;
        $required = $integrationDetails->default->fields->{$list}->required;
        if (empty($tokenDetails)
            || empty($list)
            || empty($fieldMap)
        ) {
            return new WP_Error('REQ_FIELD_EMPTY', __('list are required for zoho marketingHub api', 'bit-integrations'));
        }

        if ((\intval($tokenDetails->generates_on) + (55 * 60)) < time()) {
            $requiredParams['clientId'] = $integrationDetails->clientId;
            $requiredParams['clientSecret'] = $integrationDetails->clientSecret;
            $requiredParams['dataCenter'] = $integrationDetails->dataCenter;
            $requiredParams['tokenDetails'] = $tokenDetails;
            $newTokenDetails = ZohoMarketingHubHelper::refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                ZohoMarketingHubHelper::saveRefreshedToken($this->_formID, $this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }

        $recordApiHelper = new ZohoMarketingHubService($tokenDetails, $this->_integrationID);

        $zmarketingHubApiResponse = $recordApiHelper->execute(
            $list,
            $dataCenter,
            $fieldValues,
            $fieldMap,
            $required
        );

        if (is_wp_error($zmarketingHubApiResponse)) {
            return $zmarketingHubApiResponse;
        }

        return $zmarketingHubApiResponse;
    }
}
