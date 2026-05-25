<?php

/**
 * Selesforce Integration
 */

namespace BitApps\Integrations\Actions\Salesforce;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

class SalesforceController
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

    public static $actions = [
        'contact-create'      => 'Contact',
        'lead-create'         => 'Lead',
        'account-create'      => 'Account',
        'campaign-create'     => 'Campaign',
        'add-campaign-member' => 'Campaign',
        'opportunity-create'  => 'Opportunity',
        'event-create'        => 'Event',
        'case-create'         => 'Case'
    ];

    private $_integrationID;

    public function customActions($params)
    {
        if (
            empty($params->tokenDetails)
            || empty($params->clientId)
            || empty($params->clientSecret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = self::refreshTokenDetails($params);
        $tokenDetails = $response['tokenDetails'];

        $apiEndpoint = "{$tokenDetails->instance_url}/services/data/v37.0/sobjects";

        $apiResponse = HttpHelper::get($apiEndpoint, null, self::setHeaders($tokenDetails->access_token));

        if (!property_exists((object) $apiResponse, 'sobjects')) {
            wp_send_json_error($apiResponse, 400);
        }

        $customActions = array_filter($apiResponse->sobjects, function ($action) {
            if ($action->custom) {
                return true;
            }
        });

        $allCustomActions = [];
        foreach ($customActions as $action) {
            $allCustomActions[] = (object) [
                'label' => $action->label,
                'value' => $action->name
            ];
        }

        if (!empty($tokenDetails)) {
            self::saveRefreshedToken($params->flowID, $tokenDetails, $response['organizations']);
        }
        wp_send_json_success($allCustomActions, 200);
    }

    public function customFields($params)
    {
        if (
            empty($params->tokenDetails)
            || empty($params->actionName)
            || empty($params->clientId)
            || empty($params->clientSecret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = self::refreshTokenDetails($params);
        $action = self::$actions[$params->actionName] ?? $params->actionName;
        $tokenDetails = $response['tokenDetails'];

        $apiEndpoint = "{$tokenDetails->instance_url}/services/data/v37.0/sobjects/{$action}/describe";

        $apiResponse = HttpHelper::get($apiEndpoint, null, self::setHeaders($tokenDetails->access_token));

        if (!property_exists((object) $apiResponse, 'fields')) {
            wp_send_json_error($apiResponse, 400);
        }

        $excludedFields = [
            'Id', 'Type', 'Status', 'Origin', 'Priority', 'PotentialLiability__c',
            'SLAViolation__c', 'Reason', 'Ownership', 'StageName', 'MasterRecordId',
            'AccountId', 'ReportsToId', 'OwnerId', 'LeadSource', 'IsDeleted',
            'CreatedDate', 'CreatedById', 'LastModifiedDate', 'LastModifiedById',
            'SystemModstamp', 'LastViewedDate', 'LastActivityDate', 'LastCURequestDate',
            'EmailBouncedReason', 'Industry', 'Status', 'Rating', 'EmailBouncedDate', 'IsEmailBounced', 'LastCUUpdateDate',
            'LastReferencedDate', 'Jigsaw', 'JigsawContactId', 'CleanStatus'
        ];

        $customFields = array_filter($apiResponse->fields, function ($field) use ($excludedFields) {
            return !\in_array($field->name, $excludedFields) || (boolean) $field->custom;
        });

        $fieldMap = array_map(function ($field) use ($action) {
            return (object) [
                'key'      => $field->name,
                'label'    => $field->label,
                'required' => static::isRequiredField($field->name, $action)
            ];
        }, array_values($customFields));

        if (!empty($tokenDetails)) {
            self::saveRefreshedToken($params->flowID, $tokenDetails, $response['organizations']);
        }

        wp_send_json_success($fieldMap, 200);
    }

    public static function selesforceCampaignList($params)
    {
        if (
            empty($params->tokenDetails)
            || empty($params->clientId)
            || empty($params->clientSecret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = self::refreshTokenDetails($params);
        $tokenDetails = $response['tokenDetails'];

        $apiEndpoint = "{$tokenDetails->instance_url}/services/data/v37.0/sobjects/Campaign";

        $apiResponse = HttpHelper::get($apiEndpoint, null, self::setHeaders($tokenDetails->access_token));

        if (!property_exists($apiResponse, 'objectDescribe')) {
            wp_send_json_error($apiResponse, 400);
        }

        $response['allCampaignLists'] = $apiResponse->recentItems;

        if (!empty($tokenDetails)) {
            self::saveRefreshedToken($params->flowID, $tokenDetails, $response['organizations']);
        }

        wp_send_json_success($response, 200);
    }

    public static function selesforceLeadList($params)
    {
        if (
            empty($params->tokenDetails)
            || empty($params->clientId)
            || empty($params->clientSecret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = self::refreshTokenDetails($params);
        $tokenDetails = $response['tokenDetails'];

        $apiEndpoint = "{$tokenDetails->instance_url}/services/data/v37.0/sobjects/lead";

        $apiResponse = HttpHelper::get($apiEndpoint, null, self::setHeaders($tokenDetails->access_token));

        if (!property_exists($apiResponse, 'recentItems')) {
            wp_send_json_error($apiResponse, 400);
        }

        $response['leadLists'] = $apiResponse->recentItems;

        if (!empty($tokenDetails)) {
            self::saveRefreshedToken($params->flowID, $tokenDetails, $response['organizations']);
        }

        wp_send_json_success($response, 200);
    }

    public static function selesforceContactList($params)
    {
        if (
            empty($params->tokenDetails)
            || empty($params->clientId)
            || empty($params->clientSecret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = self::refreshTokenDetails($params);
        $tokenDetails = $response['tokenDetails'];

        $apiEndpoint = "{$tokenDetails->instance_url}/services/data/v37.0/sobjects/contact";

        $apiResponse = HttpHelper::get($apiEndpoint, null, self::setHeaders($tokenDetails->access_token));

        if (!property_exists($apiResponse, 'recentItems')) {
            wp_send_json_error($apiResponse, 400);
        }

        $response['contactLists'] = $apiResponse->recentItems;

        if (!empty($tokenDetails)) {
            self::saveRefreshedToken($params->flowID, $tokenDetails, $response['organizations']);
        }

        wp_send_json_success($response, 200);
    }

    public static function selesforceAccountList($params)
    {
        if (
            empty($params->tokenDetails)
            || empty($params->clientId)
            || empty($params->clientSecret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = self::refreshTokenDetails($params);
        $tokenDetails = $response['tokenDetails'];

        $apiEndpoint = "{$tokenDetails->instance_url}/services/data/v37.0/sobjects/Account";

        $apiResponse = HttpHelper::get($apiEndpoint, null, self::setHeaders($tokenDetails->access_token));

        if (!property_exists($apiResponse, 'recentItems')) {
            wp_send_json_error($apiResponse, 400);
        }

        $response['accountLists'] = $apiResponse->recentItems;

        if (!empty($tokenDetails)) {
            self::saveRefreshedToken($params->flowID, $tokenDetails);
        }

        wp_send_json_success($response, 200);
    }

    public static function selesforceCaseOrigin($params)
    {
        $caseOrigin = static::getCaseMetaData($params, 'Origin');
        wp_send_json_success($caseOrigin, 200);
    }

    public static function selesforceCaseType($params)
    {
        $caseTypes = static::getCaseMetaData($params, 'Type');
        wp_send_json_success($caseTypes, 200);
    }

    public static function selesforceCaseReason($params)
    {
        $caseReason = static::getCaseMetaData($params, 'Reason');
        wp_send_json_success($caseReason, 200);
    }

    public static function selesforceCaseStatus($params)
    {
        $caseStatus = static::getCaseMetaData($params, 'Status');
        wp_send_json_success($caseStatus, 200);
    }

    public static function selesforceCasePriority($params)
    {
        $casePriority = static::getCaseMetaData($params, 'Priority');
        wp_send_json_success($casePriority, 200);
    }

    public static function selesforceCasePotentialLiability($params)
    {
        $casePotentialLiability = static::getCaseMetaData($params, 'PotentialLiability__c');
        wp_send_json_success($casePotentialLiability, 200);
    }

    public static function selesforceCaseSLAViolation($params)
    {
        $caseSLAViolation = static::getCaseMetaData($params, 'SLAViolation__c');
        wp_send_json_success($caseSLAViolation, 200);
    }

    public function getAllLeadSources($params)
    {
        $response = Hooks::apply(Config::withPrefix('salesforce_get_lead_utilities'), [], $params, 'LeadSource');

        /**
         * @deprecated 2.7.8 Use `bit_integrations_salesforce_get_lead_utilities` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_salesforce_get_lead_utilities', $response, $params, 'LeadSource');

        return self::getFilterHookResponse($response);
    }

    public function getAllLeadStatus($params)
    {
        $response = Hooks::apply(Config::withPrefix('salesforce_get_lead_utilities'), [], $params, 'Status');

        /**
         * @deprecated 2.7.8 Use `bit_integrations_salesforce_get_lead_utilities` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_salesforce_get_lead_utilities', $response, $params, 'Status');

        return self::getFilterHookResponse($response);
    }

    public function getAllLeadRatings($params)
    {
        $response = Hooks::apply(Config::withPrefix('salesforce_get_lead_utilities'), [], $params, 'Rating');

        /**
         * @deprecated 2.7.8 Use `bit_integrations_salesforce_get_lead_utilities` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_salesforce_get_lead_utilities', $response, $params, 'Rating');

        return self::getFilterHookResponse($response);
    }

    public function getAllLeadIndustries($params)
    {
        $response = Hooks::apply(Config::withPrefix('salesforce_get_lead_utilities'), [], $params, 'Industry');

        /**
         * @deprecated 2.7.8 Use `bit_integrations_salesforce_get_lead_utilities` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_salesforce_get_lead_utilities', $response, $params, 'Industry');

        return self::getFilterHookResponse($response);
    }

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

        if (self::isTokenExpired($tokenDetails)) {
            $newTokenDetails = self::refreshAccessToken((object) [
                'clientId'     => $integrationDetails->clientId,
                'clientSecret' => $integrationDetails->clientSecret,
                'tokenDetails' => $tokenDetails
            ]);

            if ($newTokenDetails) {
                self::saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }

        $recordApiHelper = new RecordApiHelper($tokenDetails, $this->_integrationID);

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

    public static function refreshTokenDetails($params)
    {
        $response = ['tokenDetails' => $params->tokenDetails];

        if (self::isTokenExpired($params->tokenDetails)) {
            $response['tokenDetails'] = self::refreshAccessToken($params);
        }

        return $response;
    }

    public static function setHeaders($accessToken)
    {
        return [
            'Authorization' => "Bearer {$accessToken}",
            'Content-Type'  => 'application/json'
        ];
    }

    public static function saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $selesforceDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($selesforceDetails)) {
            return;
        }

        $newDetails = json_decode($selesforceDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }

    protected static function refreshAccessToken($apiData)
    {
        if (
            !\is_object($apiData)
            || empty($apiData->clientId)
            || empty($apiData->clientSecret)
            || empty($apiData->tokenDetails)
        ) {
            return false;
        }

        $tokenDetails = $apiData->tokenDetails;

        $apiQuery = http_build_query(
            [
                'grant_type'    => 'refresh_token',
                'client_id'     => $apiData->clientId,
                'client_secret' => $apiData->clientSecret,
                'refresh_token' => $tokenDetails->refresh_token
            ]
        );

        $apiEndpoint = 'https://login.salesforce.com/services/oauth2/token?' . $apiQuery;

        $apiResponse = HttpHelper::post($apiEndpoint, null);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }

        $generatedAt = time();
        $tokenDetails->generates_on = $generatedAt;
        $tokenDetails->generated_at = $generatedAt;
        $tokenDetails->access_token = $apiResponse->access_token;
        if (!empty($apiResponse->refresh_token)) {
            $tokenDetails->refresh_token = $apiResponse->refresh_token;
        }
        if (isset($apiResponse->expires_in)) {
            $tokenDetails->expires_in = $apiResponse->expires_in;
        }

        return $tokenDetails;
    }

    private static function isRequiredField($key, $action)
    {
        $requiredFields = [
            'Contact' => ['LastName'],
            'Case'    => ['SuppliedName'],
            'Event'   => ['StartDateTime', 'EndDateTime'],
            'Lead'    => ['LastName', 'Email', 'Company'],
        ];

        return \in_array($key, $requiredFields[$action] ?? ['Name']);
    }

    private static function isTokenExpired($tokenDetails)
    {
        if (empty($tokenDetails) || !\is_object($tokenDetails)) {
            return false;
        }

        $generatedAt = empty($tokenDetails->generates_on) ? ($tokenDetails->generated_at ?? 0) : $tokenDetails->generates_on;
        $expiresIn = $tokenDetails->expires_in ?? 0;

        if (!empty($generatedAt) && !empty($expiresIn) && (int) $expiresIn > 0) {
            return ((int) $generatedAt + (int) $expiresIn - 30) < time();
        }

        return ((int) $generatedAt + (55 * 60)) < time();
    }

    private static function getCaseMetaData($params, $module)
    {
        if (
            empty($params->tokenDetails)
            || empty($params->clientId)
            || empty($params->clientSecret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = self::refreshTokenDetails($params);
        $tokenDetails = $response['tokenDetails'];

        $apiEndpoint = "{$params->tokenDetails->instance_url}/services/data/v52.0/sobjects/Case/describe";

        $apiResponse = HttpHelper::get($apiEndpoint, null, self::setHeaders($tokenDetails->access_token));

        if (empty($apiResponse->fields)) {
            return [];
        }

        $data = [];

        foreach ($apiResponse->fields as $field) {
            if ($field->name == $module && isset($field->picklistValues)) {
                foreach ($field->picklistValues as $picklistValue) {
                    $data[] = (object) [
                        'label' => $picklistValue->label,
                        'value' => $picklistValue->value
                    ];
                }

                break;
            }
        }

        return $data;
    }

    private static function getFilterHookResponse($response)
    {
        return $response['code'] === 200 ? wp_send_json_success($response['response'] ?? [], 200) : wp_send_json_error($response['response'], 400);
    }
}
