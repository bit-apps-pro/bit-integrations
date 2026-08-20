<?php

/**
 * ZohoDesk Integration
 */

namespace BitApps\Integrations\Actions\ZohoDesk;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

class ZohoDeskController
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

    public static function refreshOrganizations($queryParams)
    {
        if (empty($queryParams->tokenDetails)
                || empty($queryParams->dataCenter)
                || empty($queryParams->clientId)
                || empty($queryParams->clientSecret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $response = [];
        if ((\intval($queryParams->tokenDetails->generates_on) + (55 * 60)) < time()) {
            $response['tokenDetails'] = self::refreshAccessToken($queryParams);
        }

        $organizationsMetaApiEndpoint = "https://desk.zoho.{$queryParams->dataCenter}/api/v1/organizations";

        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $organizationsMetaResponse = HttpHelper::get($organizationsMetaApiEndpoint, null, $authorizationHeader);

        if (self::isErrorResponse($organizationsMetaResponse)) {
            wp_send_json_error(self::responseErrorMessage($organizationsMetaResponse), 400);
        }

        $allOrganizations = [];
        foreach (self::responseData($organizationsMetaResponse) as $organization) {
            $allOrganizations[$organization->companyName] = (object) [
                'orgId'      => $organization->id,
                'portalName' => $organization->companyName
            ];
        }
        uksort($allOrganizations, 'strnatcasecmp');
        $response['organizations'] = $allOrganizations;

        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    public static function refreshDepartments($queryParams)
    {
        if (empty($queryParams->tokenDetails)
                || empty($queryParams->dataCenter)
                || empty($queryParams->clientId)
                || empty($queryParams->clientSecret)
                || empty($queryParams->orgId)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $response = [];
        if ((\intval($queryParams->tokenDetails->generates_on) + (55 * 60)) < time()) {
            $response['tokenDetails'] = self::refreshAccessToken($queryParams);
        }

        $departmentsMetaApiEndpoint = "https://desk.zoho.{$queryParams->dataCenter}/api/v1/departments?isEnabled=true&limit=100";

        $authorizationHeader['orgId'] = "{$queryParams->orgId}";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $departmentsMetaResponse = HttpHelper::get($departmentsMetaApiEndpoint, null, $authorizationHeader);

        if (self::isErrorResponse($departmentsMetaResponse)) {
            wp_send_json_error(self::responseErrorMessage($departmentsMetaResponse), 400);
        }

        $allDepartments = [];
        foreach (self::responseData($departmentsMetaResponse) as $department) {
            $allDepartments[$department->name] = (object) [
                'departmentId'   => $department->id,
                'departmentName' => $department->name
            ];
        }
        uksort($allDepartments, 'strnatcasecmp');
        $response['departments'] = $allDepartments;

        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    public static function refreshFields($queryParams)
    {
        if (empty($queryParams->tokenDetails)
                || empty($queryParams->dataCenter)
                || empty($queryParams->clientId)
                || empty($queryParams->clientSecret)
                || empty($queryParams->orgId)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $response = [];
        if ((\intval($queryParams->tokenDetails->generates_on) + (55 * 60)) < time()) {
            $response['tokenDetails'] = self::refreshAccessToken($queryParams);
        }

        $fieldsMetaApiEndpoint = "https://desk.zoho.{$queryParams->dataCenter}/api/v1/organizationFields?module=tickets";

        $authorizationHeader['orgId'] = "{$queryParams->orgId}";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $fieldsMetaResponse = HttpHelper::get($fieldsMetaApiEndpoint, null, $authorizationHeader);

        if (self::isErrorResponse($fieldsMetaResponse)) {
            wp_send_json_error(self::responseErrorMessage($fieldsMetaResponse), 400);
        }

        $fields = self::responseData($fieldsMetaResponse);
        $response['fields'] = [];
        $response['required'] = [];

        if (\count($fields) > 0) {
            $response['fields']['Contact Name - Last Name'] = (object) [
                'apiName'       => 'lastName',
                'displayLabel'  => __('Contact Name - Last Name', 'bit-integrations'),
                'isCustomField' => false,
                'required'      => true
            ];
            $response['fields']['Contact Name - First Name'] = (object) [
                'apiName'       => 'firstName',
                'displayLabel'  => __('Contact Name - First Name', 'bit-integrations'),
                'isCustomField' => false,
                'required'      => false
            ];
            $response['required'][] = 'lastName';
            foreach ($fields as $field) {
                if ($field->apiName === 'contactId' || $field->apiName === 'assigneeId') {
                    continue;
                }
                $response['fields'][$field->displayLabel] = (object) [
                    'apiName'       => $field->apiName,
                    'displayLabel'  => $field->displayLabel,
                    'isCustomField' => $field->isCustomField,
                    'required'      => $field->isMandatory
                ];

                if ($field->isMandatory) {
                    $response['required'][] = $field->apiName;
                }
            }
        }
        uksort($response['fields'], 'strnatcasecmp');
        usort($response['required'], 'strnatcasecmp');

        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            $response['queryModule'] = $queryParams->module ?? '';
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    public static function refreshTicketOwners($queryParams)
    {
        if (empty($queryParams->tokenDetails)
                || empty($queryParams->dataCenter)
                || empty($queryParams->clientId)
                || empty($queryParams->clientSecret)
                || empty($queryParams->orgId)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $response = [];
        if ((\intval($queryParams->tokenDetails->generates_on) + (55 * 60)) < time()) {
            $response['tokenDetails'] = self::refreshAccessToken($queryParams);
        }

        $ownersMetaApiEndpoint = "https://desk.zoho.{$queryParams->dataCenter}/api/v1/agents?status=ACTIVE&limit=100";

        $authorizationHeader['orgId'] = "{$queryParams->orgId}";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $ownersMetaResponse = HttpHelper::get($ownersMetaApiEndpoint, null, $authorizationHeader);

        if (self::isErrorResponse($ownersMetaResponse)) {
            wp_send_json_error(self::responseErrorMessage($ownersMetaResponse), 400);
        }

        $response['owners'] = [];
        foreach (self::responseData($ownersMetaResponse) as $owner) {
            $response['owners'][] = (object) [
                'ownerId'   => $owner->id,
                'ownerName' => $owner->name
            ];
        }

        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    public static function refreshProducts($queryParams)
    {
        if (empty($queryParams->tokenDetails)
                || empty($queryParams->dataCenter)
                || empty($queryParams->clientId)
                || empty($queryParams->clientSecret)
                || empty($queryParams->orgId)
                || empty($queryParams->departmentId)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = [];
        if ((\intval($queryParams->tokenDetails->generates_on) + (55 * 60)) < time()) {
            $response['tokenDetails'] = self::refreshAccessToken($queryParams);
        }

        $productsMetaApiEndpoint = "https://desk.zoho.{$queryParams->dataCenter}/api/v1/products?departmentId={$queryParams->departmentId}&limit=100";

        $authorizationHeader['orgId'] = "{$queryParams->orgId}";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $productsMetaResponse = HttpHelper::get($productsMetaApiEndpoint, null, $authorizationHeader);

        if (self::isErrorResponse($productsMetaResponse)) {
            wp_send_json_error(self::responseErrorMessage($productsMetaResponse), 400);
        }

        $response['products'] = [];
        foreach (self::responseData($productsMetaResponse) as $product) {
            $response['products'][] = (object) [
                'productId'   => $product->id,
                'productName' => $product->productName
            ];
        }

        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
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
            $newTokenDetails = self::refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                self::saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }
        $recordApiHelper = new RecordApiHelper($tokenDetails, $orgId, $this->_integrationID);

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

    protected static function isErrorResponse($response)
    {
        return is_wp_error($response)
            || !\is_object($response)
            || !empty($response->errorCode)
            || !empty($response->error);
    }

    protected static function responseErrorMessage($response)
    {
        if (is_wp_error($response)) {
            return $response->get_error_message();
        }

        if (\is_object($response)) {
            foreach (['message', 'errorCode', 'error'] as $key) {
                if (!empty($response->{$key})) {
                    return \is_string($response->{$key}) ? $response->{$key} : wp_json_encode($response->{$key});
                }
            }
        }

        return __('Unknown', 'bit-integrations');
    }

    protected static function responseData($response)
    {
        if (!\is_object($response) || empty($response->data) || !\is_array($response->data)) {
            return [];
        }

        return $response->data;
    }

    protected static function refreshAccessToken($apiData)
    {
        if (!\is_object($apiData)
            || empty($apiData->dataCenter)
            || empty($apiData->clientId)
            || empty($apiData->clientSecret)
            || empty($apiData->tokenDetails)
        ) {
            return false;
        }
        $tokenDetails = $apiData->tokenDetails;

        $dataCenter = $apiData->dataCenter;
        $apiEndpoint = "https://accounts.zoho.{$dataCenter}/oauth/v2/token";
        $requestParams = [
            'grant_type'    => 'refresh_token',
            'client_id'     => $apiData->clientId,
            'client_secret' => $apiData->clientSecret,
            'refresh_token' => $tokenDetails->refresh_token,
        ];

        $apiResponse = HttpHelper::post($apiEndpoint, $requestParams);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }
        $tokenDetails->generates_on = time();
        $tokenDetails->access_token = $apiResponse->access_token;

        return $tokenDetails;
    }

    protected static function saveRefreshedToken($integrationID, $tokenDetails, $others = null)
    {
        if (empty($integrationID) || empty($tokenDetails)) {
            return;
        }
        $flow = new FlowController();
        $zdeskDetails = $flow->get(['id' => $integrationID]);

        if (is_wp_error($zdeskDetails) || empty($zdeskDetails[0]->flow_details)) {
            return;
        }
        $newDetails = json_decode($zdeskDetails[0]->flow_details);

        if (!\is_object($newDetails)) {
            return;
        }

        $newDetails->tokenDetails = $tokenDetails;

        if (!empty($others['organizations'])) {
            if (!isset($newDetails->default) || !\is_object($newDetails->default)) {
                $newDetails->default = (object) [];
            }
            $newDetails->default->organizations = $others['organizations'];
        }

        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
