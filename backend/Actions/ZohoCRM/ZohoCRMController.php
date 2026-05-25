<?php

/**
 * ZohoCrm Integration
 */

namespace BitApps\Integrations\Actions\ZohoCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use BitApps\Integrations\Log\LogHandler;
use stdClass;
use WP_Error;

/**
 * Provide functionality for ZohoCrm integration
 */
final class ZohoCRMController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zohocrm',
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

    public static function refreshModulesAjaxHelper($queryParams)
    {
        if (
            empty($queryParams->tokenDetails)
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
            $refreshedToken = ZohoCRMController::_refreshAccessToken($queryParams);
            if ($refreshedToken) {
                $response['tokenDetails'] = $refreshedToken;
            } else {
                wp_send_json_error(
                    __('Failed to refresh access token', 'bit-integrations'),
                    400
                );
            }
        }
        $zohosIntegratedModules = [
            'zohosign__ZohoSign_Document_Events',
            'zohoshowtime__ShowTime_Sessions',
            'zohoshowtime__Zoho_ShowTime',
            'zohosign__ZohoSign_Documents',
            'zohosign__ZohoSign_Recipients'
        ];
        $modulesMetaApiEndpoint = "{$queryParams->tokenDetails->api_domain}/crm/v2.1/settings/modules";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";

        $modulesMetaResponse = HttpHelper::get($modulesMetaApiEndpoint, null, $authorizationHeader);

        if (
            !is_wp_error($modulesMetaResponse)
            && (
                empty($modulesMetaResponse->status)
                || (
                    !empty($modulesMetaResponse->status)
                && $modulesMetaResponse->status !== 'error'
                )
            )
        ) {
            $retriveModuleData = $modulesMetaResponse->modules;

            $allModules = [];
            foreach ($retriveModuleData as $key => $value) {
                if (
                    (
                        !empty($value->inventory_template_supported)
                        && $value->inventory_template_supported
                    )
                    || \in_array($value->api_name, $zohosIntegratedModules)
                    || (
                        \count((array) $value->parent_module) > 0
                        && $value->module_name !== 'Tasks'
                    )
                ) {
                    continue;
                }

                if (!empty($value->api_supported) && $value->api_supported && !empty($value->editable) && $value->editable) {
                    $allModules[$value->api_name] = (object) [
                        'plural_label'       => $value->plural_label,
                        'triggers_supported' => $value->triggers_supported,
                        'quick_create'       => $value->quick_create,
                    ];
                }
            }
            uksort($allModules, 'strnatcasecmp');
        } else {
            wp_send_json_error(
                empty($modulesMetaResponse->message) ? 'Unknown' : $modulesMetaResponse->message,
                400
            );
        }

        $response['modules'] = $allModules;

        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            ZohoCRMController::_saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response['modules']);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh crm layouts
     *
     * @param $queryParams Mandatory params for refresh layout
     *
     * @return JSON crm layout data
     */
    public static function refreshLayoutsAjaxHelper($queryParams)
    {
        if (
            empty($queryParams->module)
            || empty($queryParams->tokenDetails)
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
            $response['tokenDetails'] = ZohoCRMController::_refreshAccessToken($queryParams);
        }
        $layoutsMetaApiEndpoint = "{$queryParams->tokenDetails->api_domain}/crm/v2.1/settings/layouts";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $requiredParams['module'] = $queryParams->module;
        $layoutsMetaResponse = HttpHelper::get($layoutsMetaApiEndpoint, $requiredParams, $authorizationHeader);

        if (!is_wp_error($layoutsMetaResponse) && (empty($layoutsMetaResponse->status) || (!empty($layoutsMetaResponse->status) && $layoutsMetaResponse->status !== 'error'))) {
            $retriveLayoutsData = $layoutsMetaResponse->layouts;
            $layouts = [];
            foreach ($retriveLayoutsData as $layoutKey => $layoutValue) {
                // if ($layoutValue->name !== 'Standard') {
                //     continue;
                // }
                $fields = [];
                $fileUploadFields = [];
                $requiredFields = [];
                $requiredFileUploadFiles = [];
                $uniqueFields = [];
                $fieldToShow = ['Email', 'First_Name', 'Last_Name', 'Phone'];

                foreach ($layoutValue->sections as $sectionKey => $sectionValue) {
                    foreach ($sectionValue->fields as $fieldKey => $fieldDetails) {
                        // if (!\in_array($fieldDetails->api_name, $fieldToShow)) {
                        //     continue;
                        // }
                        if (
                            empty($fieldDetails->subform)
                            && !empty($fieldDetails->api_name)
                            && !empty($fieldDetails->view_type->create)
                            && $fieldDetails->view_type->create
                            && $fieldDetails->data_type !== 'ownerlookup'
                        ) {
                            if ($fieldDetails->data_type === 'fileupload' || $fieldDetails->data_type === 'imageupload') {
                                $fileUploadFields[$fieldDetails->api_name] = (object) [
                                    'display_label' => $fieldDetails->display_label,
                                    'length'        => $fieldDetails->length,
                                    'visible'       => $fieldDetails->visible,
                                    'json_type'     => !empty($fieldDetails->json_type) ? $fieldDetails->json_type : null,
                                    'data_type'     => $fieldDetails->data_type,
                                    'required'      => $fieldDetails->required
                                ];
                            } else {
                                $fields[$fieldDetails->api_name] = (object) [
                                    'display_label' => $fieldDetails->display_label,
                                    'length'        => $fieldDetails->length,
                                    'visible'       => $fieldDetails->visible,
                                    'json_type'     => !empty($fieldDetails->json_type) ? $fieldDetails->json_type : null,
                                    'data_type'     => $fieldDetails->data_type,
                                    'required'      => $fieldDetails->required
                                ];
                            }

                            if (!empty($fieldDetails->required) && $fieldDetails->required) {
                                if ($fieldDetails->data_type === 'fileupload' || $fieldDetails->data_type === 'imageupload') {
                                    $requiredFileUploadFiles[] = $fieldDetails->api_name;
                                } elseif ($fieldDetails->api_name !== 'Parent_Id') {
                                    $requiredFields[] = $fieldDetails->api_name;
                                }
                            }
                            if (!empty($fieldDetails->unique) && \count((array) $fieldDetails->unique)) {
                                $uniqueFields[] = $fieldDetails->api_name;
                            }
                        }
                    }
                }
                uksort($fields, 'strnatcasecmp');
                uksort($fileUploadFields, 'strnatcasecmp');
                usort($requiredFields, 'strnatcasecmp');
                usort($requiredFileUploadFiles, 'strnatcasecmp');

                $layouts[$layoutValue->name] = (object) [
                    'visible'                  => $layoutValue->visible,
                    'fields'                   => $fields,
                    'required'                 => $requiredFields,
                    'unique'                   => $uniqueFields,
                    'id'                       => $layoutValue->id,
                    'fileUploadFields'         => $fileUploadFields,
                    'requiredFileUploadFields' => $requiredFileUploadFiles
                ];
            }
            uksort($layouts, 'strnatcasecmp');
            $response['layouts'] = $layouts;
        } else {
            wp_send_json_error(
                $layoutsMetaResponse->status === 'error' ? $layoutsMetaResponse->message : 'Unknown',
                400
            );
        }
        if (!empty($response['tokenDetails']) && $response['tokenDetails'] && !empty($queryParams->id)) {
            $response['queryModule'] = $queryParams->module;
            ZohoCRMController::_saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request to get assignment rules of a Zoho CRM module
     *
     * @param mixed $queryParams
     *
     * @return JSON crm assignment rules data
     */
    public static function getAssignmentRulesAjaxHelper($queryParams)
    {
        if (
            empty($queryParams->module)
            || empty($queryParams->tokenDetails)
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
        $metaDataApiHelper = new MetaDataApiHelper($queryParams->tokenDetails, true);
        $assignmentRulesResponse = $metaDataApiHelper->getAssignmentRules($queryParams->module);
        if (
            !is_wp_error($assignmentRulesResponse)
            && !empty($assignmentRulesResponse)
            && empty($assignmentRulesResponse->status)
        ) {
            $rules = (array) $assignmentRulesResponse;
            uksort($rules, 'strnatcasecmp');
            $response['assignmentRules'] = $rules;
        } else {
            wp_send_json_error(
                !empty($assignmentRulesResponse->status)
                    && $assignmentRulesResponse->status === 'error'
                    ? $assignmentRulesResponse->message : (empty($assignmentRulesResponse) ? __('Assignment rules is empty', 'bit-integrations') : 'Unknown'),
                empty($assignmentRulesResponse) ? 204 : 400
            );
        }
        if (!empty($response['tokenDetails']) && $response['tokenDetails'] && !empty($queryParams->id)) {
            static::_saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request to get realted lists of a Zoho CRM module
     *
     * @param $queryParams Mandatory params
     *
     * @return JSON crm layout data
     */
    public static function getRelatedListsAjaxHelper($queryParams)
    {
        if (
            empty($queryParams->module)
            || empty($queryParams->tokenDetails)
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
            $response['tokenDetails'] = static::_refreshAccessToken($queryParams);
        }
        $metaDataApiHelper = new MetaDataApiHelper($queryParams->tokenDetails);
        $relatedListResponse = $metaDataApiHelper->getRelatedLists($queryParams->module);
        if (
            !is_wp_error($relatedListResponse)
            && !empty($relatedListResponse)
            && \is_array($relatedListResponse)
        ) {
            uksort($relatedListResponse, 'strnatcasecmp');
            $response['relatedLists'] = $relatedListResponse;
        } else {
            wp_send_json_error(
                \is_object($relatedListResponse->status)
                    && !empty($relatedListResponse->status)
                    && $relatedListResponse->status === 'error'
                    ? $relatedListResponse->message : (empty($relatedListResponse) ? __('RelatedList is empty', 'bit-integrations') : 'Unknown'),
                empty($relatedListResponse) ? 204 : 400
            );
        }
        if (!empty($response['tokenDetails']) && $response['tokenDetails'] && !empty($queryParams->id)) {
            static::_saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh crm users
     *
     * @param $queryParams Mandatory params
     *
     * @return JSON crm users data
     */
    public static function refreshUsersAjaxHelper($queryParams)
    {
        if (
            empty($queryParams->tokenDetails)
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
            $response['tokenDetails'] = static::_refreshAccessToken($queryParams);
        }
        $usersApiEndpoint = "{$queryParams->tokenDetails->api_domain}/crm/v2.1/users?type=ActiveConfirmedUsers";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $retrivedUsersData = [];
        $usersResponse = null;
        do {
            $requiredParams = [];
            if ($usersResponse instanceof stdClass && !empty($usersResponse->users)) {
                if (!empty($retrivedUsersData)) {
                    $retrivedUsersData = array_merge($retrivedUsersData, $usersResponse->users);
                } else {
                    $retrivedUsersData = $usersResponse->users;
                }
            }
            if ($usersResponse instanceof stdClass && !empty($usersResponse->info->more_records) && $usersResponse->info->more_records) {
                $requiredParams['page'] = \intval($usersResponse->info->page) + 1;
            }
            $usersResponse = HttpHelper::get($usersApiEndpoint, $requiredParams, $authorizationHeader);
        } while ($usersResponse == null || (!empty($usersResponse->info->more_records) && $usersResponse->info->more_records));
        if (empty($requiredParams) && !is_wp_error($usersResponse)) {
            $retrivedUsersData = $usersResponse->users;
        }
        if (!is_wp_error($usersResponse) && !empty($retrivedUsersData)) {
            $users = [];
            foreach ($retrivedUsersData as $userKey => $userValue) {
                $users[$userValue->full_name] = (object) [
                    'full_name' => $userValue->full_name,
                    'id'        => $userValue->id,
                ];
            }
            uksort($users, 'strnatcasecmp');
            $response['users'] = $users;
        } else {
            wp_send_json_error(
                $usersResponse->status === 'error' ? $usersResponse->message : 'Unknown',
                400
            );
        }
        if (!empty($response['tokenDetails']) && $response['tokenDetails'] && !empty($queryParams->id)) {
            static::_saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh tags of a module
     *
     * @param $queryParams Mandatory params
     *
     * @return JSON crm Tags  for a module
     */
    public static function refreshTagListAjaxHelper($queryParams)
    {
        if (
            empty($queryParams->module)
            || empty($queryParams->tokenDetails)
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
            $response['tokenDetails'] = static::_refreshAccessToken($queryParams);
        }
        $tokenDetails = empty($response['tokenDetails']) ? $queryParams->tokenDetails : $response['tokenDetails'];
        $tagApiHelper = new TagApiHelper($tokenDetails, $queryParams->module);
        $tagListApiResponse = $tagApiHelper->getTagList();
        if (!is_wp_error($tagListApiResponse)) {
            usort($tagListApiResponse, 'strnatcasecmp');
            $response['tags'] = $tagListApiResponse;
        } else {
            wp_send_json_error(
                is_wp_error($tagListApiResponse) ? $tagListApiResponse->get_error_message() : (empty($tagListApiResponse) ? __('Tag is empty', 'bit-integrations') : 'Unknown'),
                empty($tagListApiResponse) ? 204 : 400
            );
        }
        if (!empty($response['tokenDetails']) && $response['tokenDetails'] && !empty($queryParams->id)) {
            static::_saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    public static function addRelatedList($zcrmApiResponse, $integID, $fieldValues, $integrationDetails, RecordApiHelper $recordApiHelper)
    {
        foreach ($integrationDetails->relatedlists as $relatedlist) {
            // Related List apis..
            $relatedListModule = !empty($relatedlist->module) ? $relatedlist->module : '';
            $relatedListLayout = !empty($relatedlist->layout) ? $relatedlist->layout : '';
            $defaultDataConf = $integrationDetails->default;
            if (empty($relatedListModule) || empty($relatedListLayout)) {
                return new WP_Error('REQ_FIELD_EMPTY', __('module, layout are required for zoho crm relatedlist', 'bit-integrations'));
            }
            $module = $integrationDetails->module;
            $moduleSingular = substr($module, 0, \strlen($module) - 1);
            if (isset($defaultDataConf->layouts->{$relatedListModule}->{$relatedListLayout}->fields->{$module})) {
                $moduleSingular = $module;
            } elseif (!isset($defaultDataConf->layouts->{$relatedListModule}->{$relatedListLayout}->fields->{$moduleSingular})) {
                $moduleSingular = '';
            }
            $relatedListRequired = !empty($defaultDataConf->layouts->{$relatedListModule}->{$relatedListLayout}->required)
                ? $defaultDataConf->layouts->{$relatedListModule}->{$relatedListLayout}->required : [];
            $recordID = $zcrmApiResponse->data[0]->details->id;
            $defaultDataConf->layouts->{$relatedListModule}->{$relatedListLayout}->fields->{'$se_module'} = (object) [
                'length'    => 200,
                'visible'   => true,
                'json_type' => 'string',
                'data_type' => 'string',
            ];
            $fieldValues['$se_module'] = $module;
            $relatedlist->field_map[] = (object)
            [
                'formField'     => '$se_module',
                'zohoFormField' => '$se_module'
            ];
            if (isset($defaultDataConf->layouts->{$relatedListModule}->{$relatedListLayout}->fields->Parent_Id)) {
                $fieldValues['Parent_Id'] = (object) ['id' => $recordID];
                $relatedlist->field_map[] = (object)
                [
                    'formField'     => 'Parent_Id',
                    'zohoFormField' => 'Parent_Id'
                ];
            } elseif (!empty($moduleSingular)) {
                $fieldValues[$moduleSingular] = ['id' => $recordID];
                $relatedlist->field_map[] = (object)
                [
                    'formField'     => $moduleSingular,
                    'zohoFormField' => $moduleSingular
                ];
            } elseif ($module === 'Contacts') {
                $fieldValues['Who_Id'] = (object) ['id' => $recordID];
                $relatedlist->field_map[] = (object)
                [
                    'formField'     => 'Who_Id',
                    'zohoFormField' => 'Who_Id'
                ];
            } else {
                $fieldValues['What_Id'] = (object) ['id' => $recordID];
                $relatedlist->field_map[] = (object)
                [
                    'formField'     => 'What_Id',
                    'zohoFormField' => 'What_Id'
                ];
            }

            $zcrmRelatedlistApiResponse = $recordApiHelper->execute(
                $integID,
                $defaultDataConf,
                $relatedListModule,
                $relatedListLayout,
                $fieldValues,
                $relatedlist->field_map,
                $relatedlist->actions,
                $relatedListRequired,
                $relatedlist->upload_field_map,
                true
            );
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        $tokenDetails = $integrationDetails->tokenDetails;
        $module = $integrationDetails->module;
        $layout = $integrationDetails->layout;
        $fieldMap = $integrationDetails->field_map;
        $fileMap = $integrationDetails->upload_field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;

        if (
            empty($tokenDetails)
            || empty($module)
            || empty($layout)
            || empty($fieldMap)
        ) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('module, layout, fields are required for zoho crm api', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }
        if (empty($defaultDataConf->layouts->{$module}->{$layout}->fields) || empty($defaultDataConf->modules->{$module})) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('module, layout, fields are required for zoho crm api', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }
        if ((\intval($tokenDetails->generates_on) + (55 * 60)) < time()) {
            $requiredParams['clientId'] = $integrationDetails->clientId;
            $requiredParams['clientSecret'] = $integrationDetails->clientSecret;
            $requiredParams['dataCenter'] = $integrationDetails->dataCenter;
            $requiredParams['tokenDetails'] = $tokenDetails;
            $newTokenDetails = ZohoCRMController::_refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                ZohoCRMController::_saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            } else {
                LogHandler::save($this->_integrationID, 'token', 'error', __('Failed to refresh access token', 'bit-integrations'));

                return;
            }
        }

        $required = !empty($defaultDataConf->layouts->{$module}->{$layout}->required)
            ? $defaultDataConf->layouts->{$module}->{$layout}->required : [];
        $actions = $integrationDetails->actions;
        $recordApiHelper = new RecordApiHelper($tokenDetails);
        $zcrmApiResponse = $recordApiHelper->execute(
            $this->_integrationID,
            $defaultDataConf,
            $module,
            $layout,
            $fieldValues,
            $fieldMap,
            $actions,
            $required,
            $fileMap
        );
        if (is_wp_error($zcrmApiResponse)) {
            return $zcrmApiResponse;
        }
        if (
            !empty($zcrmApiResponse->data)
            && !empty($zcrmApiResponse->data[0]->code)
            && $zcrmApiResponse->data[0]->code === 'SUCCESS'
            && \count($integrationDetails->relatedlists)
        ) {
            self::addRelatedList($zcrmApiResponse, $this->_integrationID, $fieldValues, $integrationDetails, $recordApiHelper);
        }

        return $zcrmApiResponse;
    }

    /**
     * Helps to refresh zoho crm access_token
     *
     * @param object $apiData Contains required data for refresh access token
     *
     * @return JSON $tokenDetails API token details
     */
    protected static function _refreshAccessToken($apiData)
    {
        if (
            empty($apiData->dataCenter)
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
     * @param int        $integrationID ID of Zoho crm Integration
     * @param object     $tokenDetails  refreshed token info
     * @param null|mixed $others
     *
     * @return null
     */
    private static function _saveRefreshedToken($integrationID, $tokenDetails, $others = null)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $zcrmDetails = $flow->get(['id' => $integrationID]);

        if (is_wp_error($zcrmDetails)) {
            return;
        }
        $newDetails = json_decode($zcrmDetails[0]->flow_details);

        $newDetails->tokenDetails = $tokenDetails;
        if (!empty($others['modules'])) {
            $newDetails->default->modules = $others['modules'];
        }
        if (!empty($others['layouts']) && !empty($others['queryModule'])) {
            $newDetails->default->layouts->{$others['queryModule']} = $others['layouts'];
        }

        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
