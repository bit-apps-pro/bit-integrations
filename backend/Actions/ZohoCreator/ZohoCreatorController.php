<?php

/**
 * ZohoCreator Integration
 */

namespace BitApps\Integrations\Actions\ZohoCreator;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\IpTool;

/**
 * Provide functionality for ZohoCrm integration
 */
class ZohoCreatorController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zohocreator',
        'fields'   => [
            'dataCenter'   => 'dataCenter',
            'accountOwner' => 'accountOwner',
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

    public static function refreshApplicationsAjaxHelper($queryParams)
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
            $response['tokenDetails'] = self::_refreshAccessToken($queryParams);
        }

        $applicationsMetaApiEndpoint = "https://creator.zoho.{$queryParams->dataCenter}/api/v2/applications";

        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $applicationsMetaResponse = HttpHelper::get($applicationsMetaApiEndpoint, null, $authorizationHeader);

        // wp_send_json_success($applicationsMetaResponse, 200);

        if (!is_wp_error($applicationsMetaResponse)) {
            $allApplications = [];
            $applications = $applicationsMetaResponse->applications;

            if (\count($applications) > 0) {
                foreach ($applications as $application) {
                    $allApplications[$application->application_name] = (object) [
                        'applicationId'   => $application->link_name,
                        'applicationName' => $application->application_name,
                        'time_zone'       => $application->time_zone,
                        'date_format'     => $application->date_format
                    ];
                }
            }
            uksort($allApplications, 'strnatcasecmp');
            $response['applications'] = $allApplications;
        } else {
            wp_send_json_error(
                empty($applicationsMetaResponse->data) ? 'Unknown' : $applicationsMetaResponse->error,
                400
            );
        }
        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::_saveRefreshedToken($queryParams->formID, $queryParams->id, $response['tokenDetails'], $response['lists']);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh crm modules
     *
     * @param mixed $queryParams
     *
     * @return JSON crm module data
     */
    public static function refreshFormsAjaxHelper($queryParams)
    {
        if (empty($queryParams->tokenDetails)
                || empty($queryParams->dataCenter)
                || empty($queryParams->clientId)
                || empty($queryParams->clientSecret)
                || empty($queryParams->accountOwner)
                || empty($queryParams->applicationId)
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
            $response['tokenDetails'] = self::_refreshAccessToken($queryParams);
        }

        $formsMetaApiEndpoint = "https://creator.zoho.{$queryParams->dataCenter}/api/v2/{$queryParams->accountOwner}/{$queryParams->applicationId}/forms";

        // $authorizationHeader["orgId"] = "{$queryParams->orgId}";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $formsMetaResponse = HttpHelper::get($formsMetaApiEndpoint, null, $authorizationHeader);

        // wp_send_json_success($formsMetaResponse, 200);

        if (!is_wp_error($formsMetaResponse)) {
            $allForms = [];
            $forms = $formsMetaResponse->forms;

            if (\count($forms) > 0) {
                foreach ($forms as $form) {
                    $allForms[$form->display_name] = (object) [
                        'formId'   => $form->link_name,
                        'formName' => $form->display_name
                    ];
                }
            }
            uksort($allForms, 'strnatcasecmp');
            $response['forms'] = $allForms;
        } else {
            wp_send_json_error(
                empty($formsMetaResponse->data) ? 'Unknown' : $formsMetaResponse->error,
                400
            );
        }
        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::_saveRefreshedToken($queryParams->formID, $queryParams->id, $response['tokenDetails'], $response['lists']);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refesh crm layouts
     *
     * @param mixed $queryParams
     *
     * @return JSON crm layout data
     */
    public static function refreshFieldsAjaxHelper($queryParams)
    {
        if (empty($queryParams->tokenDetails)
                || empty($queryParams->dataCenter)
                || empty($queryParams->clientId)
                || empty($queryParams->clientSecret)
                || empty($queryParams->accountOwner)
                || empty($queryParams->applicationId)
                || empty($queryParams->formId)
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
            $response['tokenDetails'] = self::_refreshAccessToken($queryParams);
        }

        $fieldsMetaApiEndpoint = "https://creator.zoho.{$queryParams->dataCenter}/api/v2/{$queryParams->accountOwner}/{$queryParams->applicationId}/form/{$queryParams->formId}/fields";

        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $fieldsMetaResponse = HttpHelper::get($fieldsMetaApiEndpoint, null, $authorizationHeader);

        // wp_send_json_success($fieldsMetaResponse, 200);

        if (!is_wp_error($fieldsMetaResponse)) {
            $fields = $fieldsMetaResponse->fields;

            if (\count($fields) > 0) {
                $response['fields'] = [];
                $response['fileUploadFields'] = [];
                $response['required'] = [];
                $response['requiredFileUploadFields'] = [];
                foreach ($fields as $field) {
                    if (isset($field->is_lookup_field) && $field->is_lookup_field) {
                        continue;
                    }
                    if (\in_array($field->type, [9, 20, 21, 22, 23, 24, 26, 28, 31, 35, 36, 37, 38, 39])) {
                        continue;
                    }

                    if (\in_array($field->type, [18, 19, 25, 32, 33])) {
                        $response['fileUploadFields'][$field->display_name] = (object) [
                            'apiName'      => $field->link_name,
                            'displayLabel' => $field->display_name,
                            'required'     => $field->mandatory,
                        ];

                        if ($field->mandatory) {
                            $response['requiredFileUploadFields'][] = $field->link_name;
                        }
                    } else {
                        if (isset($field->subfields)) {
                            foreach ($field->subfields as $subfield) {
                                if (!$subfield->is_hidden) {
                                    $response['fields'][$subfield->display_name] = (object) [
                                        'apiName'      => $subfield->link_name,
                                        'displayLabel' => $subfield->display_name,
                                        'required'     => $field->mandatory,
                                        'parent'       => $field->link_name
                                    ];
                                    if ($field->mandatory) {
                                        $response['required'][] = $subfield->link_name;
                                    }
                                }
                            }
                        } else {
                            $response['fields'][$field->display_name] = (object) [
                                'apiName'      => $field->link_name,
                                'displayLabel' => $field->display_name,
                                'required'     => $field->mandatory
                            ];

                            if (\in_array($field->type, [14, 15])) {
                                $response['fields'][$field->display_name]->type = $field->type;
                            }

                            if ($field->mandatory) {
                                $response['required'][] = $field->link_name;
                            }
                        }
                    }
                }
            }
            uksort($response['fields'], 'strnatcasecmp');
            usort($response['required'], 'strnatcasecmp');
            uksort($response['fileUploadFields'], 'strnatcasecmp');
            usort($response['requiredFileUploadFields'], 'strnatcasecmp');
        } else {
            wp_send_json_error(
                $fieldsMetaResponse->status === 'error' ? $fieldsMetaResponse->message : 'Unknown',
                400
            );
        }
        if (!empty($response['tokenDetails']) && $response['tokenDetails'] && !empty($queryParams->id)) {
            $response['queryModule'] = $queryParams->module;
            self::_saveRefreshedToken($queryParams->formID, $queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        $tokenDetails = $integrationDetails->tokenDetails;
        if (empty($tokenDetails)
        ) {
            return new WP_Error('tokenDetails error', __('tokenDetails error', 'bit-integrations'));
        }

        if ((\intval($tokenDetails->generates_on) + (55 * 60)) < time()) {
            $requiredParams['clientId'] = $integrationDetails->clientId;
            $requiredParams['clientSecret'] = $integrationDetails->clientSecret;
            $requiredParams['dataCenter'] = $integrationDetails->dataCenter;
            $requiredParams['tokenDetails'] = $tokenDetails;
            $newTokenDetails = self::_refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                self::_saveRefreshedToken($this->_formID, $this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }

        // $actions = $integrationDetails->actions;
        $recordApiHelper = new RecordApiHelper($tokenDetails, $this->_integrationID);

        $zcreatorApiResponse = $recordApiHelper->execute(
            $this->_formID,
            $entryID,
            $fieldValues,
            $integrationDetails
        );

        if (is_wp_error($zcreatorApiResponse)) {
            return $zcreatorApiResponse;
        }

        return $zcreatorApiResponse;
    }

    /**
     * Helps to refresh zoho crm access_token
     *
     * @param array $apiData Contains required data for refresh access token
     *
     * @return JSON $tokenDetails API token details
     */
    protected static function _refreshAccessToken($apiData)
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

    /**
     * Save updated access_token to avoid unnecessary token generation
     *
     * @param int        $formID        ID of Integration related form
     * @param int        $integrationID ID of Zoho crm Integration
     * @param Obeject    $tokenDetails  refreshed token info
     * @param null|mixed $others
     *
     * @return null
     */
    protected static function _saveRefreshedToken($formID, $integrationID, $tokenDetails, $others = null)
    {
        if (empty($formID) || empty($integrationID)) {
            return;
        }

        $integrationHandler = new IntegrationHandler($formID, IpTool::getUserDetail());
        $zcreatorDetails = $integrationHandler->getAIntegration($integrationID);

        if (is_wp_error($zcreatorDetails)) {
            return;
        }
        $newDetails = json_decode($zcreatorDetails[0]->integration_details);

        $newDetails->tokenDetails = $tokenDetails;
        if (!empty($others['organizations'])) {
            $newDetails->default->organizations = $others['organizations'];
        }

        $integrationHandler->updateIntegration($integrationID, $zcreatorDetails[0]->integration_name, 'Zoho Creator', wp_json_encode($newDetails), 'form');
    }
}
