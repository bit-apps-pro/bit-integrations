<?php

/**
 * ZohoBigin Integration
 */

namespace BitApps\Integrations\Actions\ZohoBigin;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

/**
 * Provide functionality for ZohoCrm integration
 */
class ZohoBiginController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zohobigin',
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

    public static function refreshModules($queryParams)
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
            $response['tokenDetails'] = self::_refreshAccessToken($queryParams);
        }
        $modulesMetaApiEndpoint = "https://www.zohoapis.{$queryParams->dataCenter}/bigin/v1/settings/modules";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $modulesMetaResponse = HttpHelper::get($modulesMetaApiEndpoint, null, $authorizationHeader);
        // wp_send_json_success($modulesMetaResponse, 200);
        if (!is_wp_error($modulesMetaResponse) && (empty($modulesMetaResponse->status) || (!empty($modulesMetaResponse->status) && $modulesMetaResponse->status !== 'error'))) {
            $retriveModuleData = $modulesMetaResponse->modules;
            $allModules = [];
            foreach ($retriveModuleData as $module) {
                if (!\in_array($module->api_name, ['Activities', 'Social', 'Associated_Products', 'Notes', 'Attachments'])) {
                    $allModules[$module->plural_label] = (object) [
                        'api_name'     => $module->api_name,
                        'plural_label' => $module->plural_label
                    ];
                }
            }
            uksort($allModules, 'strnatcasecmp');
            $response['modules'] = $allModules;
        } else {
            wp_send_json_error(
                empty($modulesMetaResponse->error) ? 'Unknown' : $modulesMetaResponse->error,
                400
            );
        }
        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response['modules']);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh bigin modules
     *
     * @param object $queryParams Params to refresh  modules
     *
     * @return JSON bigin module data
     */
    public static function refreshPLayouts($queryParams)
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
            $response['tokenDetails'] = self::_refreshAccessToken($queryParams);
        }
        $layoutsMetaApiEndpoint = "https://www.zohoapis.{$queryParams->dataCenter}/bigin/v2/settings/layouts?module=Deals";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $layoutsMetaResponse = HttpHelper::get($layoutsMetaApiEndpoint, null, $authorizationHeader);
        // wp_send_json_success($layoutsMetaResponse, 200);
        if (!is_wp_error($layoutsMetaResponse) && (empty($layoutsMetaResponse->status) || (!empty($layoutsMetaResponse->status) && $layoutsMetaResponse->status !== 'error'))) {
            $retriveLayoutsData = $layoutsMetaResponse->layouts;
            $allLayouts = [];
            foreach ($retriveLayoutsData as $layout) {
                $allLayouts[] = (object) [
                    'display_label' => $layout->display_label,
                    'name'          => $layout->name
                ];
            }
            uksort($allLayouts, 'strnatcasecmp');
            $response['pLayouts'] = $allLayouts;
        } else {
            wp_send_json_error(
                empty($layoutsMetaResponse->error) ? 'Unknown' : $layoutsMetaResponse->error,
                400
            );
        }
        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response['modules']);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh bigin modules
     *
     * @param object $queryParams Params to refresh related lists
     *
     * @return JSON bigin module data
     */
    public static function refreshRelatedModules($queryParams)
    {
        if (
            empty($queryParams->tokenDetails)
            || empty($queryParams->dataCenter)
            || empty($queryParams->clientId)
            || empty($queryParams->clientSecret)
            || empty($queryParams->module)
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
        $relatedModules = [];

        $allModules = [
            'Tasks' => (object) [
                'api_name'     => 'Tasks',
                'plural_label' => 'Tasks'
            ],
            'Events' => (object) [
                'api_name'     => 'Events',
                'plural_label' => 'Events'
            ],
            'Calls' => (object) [
                'api_name'     => 'Calls',
                'plural_label' => 'Calls'
            ],
        ];
        // $modulesMetaApiEndpoint = "https://www.zohoapis.{$queryParams->dataCenter}/bigin/v1/settings/related_lists";
        // $authorizationHeader["Authorization"] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        // $requiredParams['module'] = $queryParams->module;
        // $modulesMetaResponse = HttpHelper::get($modulesMetaApiEndpoint, $queryParams, $authorizationHeader);
        // wp_send_json_success($modulesMetaResponse, 200);
        foreach ($allModules as $module) {
            if ($module->api_name !== $queryParams->module) {
                $relatedModules[$module->plural_label] = (object) [
                    'api_name'     => $module->api_name,
                    'plural_label' => $module->plural_label
                ];
            }
        }
        uksort($relatedModules, 'strnatcasecmp');
        $response['related_modules'] = $relatedModules;

        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response['related_modules']);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh bigin layouts
     *
     * @param object $queryParams Params to fetch fields of module
     *
     * @return JSON bigin layout data
     */
    public static function getFields($queryParams)
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
        $fieldsMetaApiEndpoint = "https://www.zohoapis.{$queryParams->dataCenter}/bigin/v1/settings/fields";

        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $requiredParams['module'] = $queryParams->module;
        $fieldsMetaResponse = HttpHelper::get($fieldsMetaApiEndpoint, $requiredParams, $authorizationHeader);

        if (!is_wp_error($fieldsMetaResponse) && (empty($fieldsMetaResponse->status) || (!empty($fieldsMetaResponse->status) && $fieldsMetaResponse->status !== 'error'))) {
            $retriveFieldsData = $fieldsMetaResponse->fields;
            $fields = [];
            $fileUploadFields = [];
            $requiredFields = [];
            $requiredFileUploadFiles = [];
            foreach ($retriveFieldsData as $field) {
                $fields[$field->api_name] = (object) [
                    'api_name'      => $field->api_name,
                    'display_label' => $field->display_label,
                    'data_type'     => $field->data_type,
                    'length'        => $field->length,
                    'required'      => $field->system_mandatory
                ];
                if ($field->system_mandatory) {
                    $requiredFields[] = $field->api_name;
                }
            }

            // $fields['Pipeline'] = (object) array(
            //         'api_name' => 'Pipeline',
            //         'display_label' => 'Pipeline',
            //         'data_type' => 'text',
            //         'length' => 120,
            //         'required' => true
            //     );
            // $requiredFields[] = 'Pipeline';

            uksort($fields, 'strnatcasecmp');
            uksort($fileUploadFields, 'strnatcasecmp');
            usort($requiredFields, 'strnatcasecmp');
            usort($requiredFileUploadFiles, 'strnatcasecmp');

            $fieldDetails = (object) [
                'fields'                   => $fields,
                'fileUploadFields'         => $fileUploadFields,
                'required'                 => $requiredFields,
                'requiredFileUploadFields' => $requiredFileUploadFiles
            ];
            $response['fieldDetails'] = $fieldDetails;
        } else {
            wp_send_json_error(
                $fieldsMetaResponse->status === 'error' ? $fieldsMetaResponse->message : 'Unknown',
                400
            );
        }
        if (!empty($response['tokenDetails']) && $response['tokenDetails'] && !empty($queryParams->id)) {
            $response['queryModule'] = $queryParams->module;
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response);
        }
        wp_send_json_success($response, 200);
    }

    public static function getTagList($queryParams)
    {
        if (
            empty($queryParams->tokenDetails)
            || empty($queryParams->dataCenter)
            || empty($queryParams->clientId)
            || empty($queryParams->clientSecret)
            || empty($queryParams->module)
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

        $accessToken = isset($response['tokenDetails']->access_token) ? $response['tokenDetails']->access_token : $queryParams->tokenDetails->access_token;
        $response['tags'] = Hooks::apply(Config::withPrefix('zbigin_get_tags'), [], $accessToken, $queryParams->dataCenter, $queryParams->module);

        if (empty($response['tags'])) {
            /**
             * @deprecated 2.7.8 Use `bit_integrations_zbigin_get_tags` filter instead.
             * @since 2.7.8
             */
            $response['tags'] = Hooks::apply('btcbi_zbigin_get_tags', [], $accessToken, $queryParams->dataCenter, $queryParams->module);
        }

        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response['lists']);
        }

        wp_send_json_success($response, 200);
    }

    public static function getUsers($queryParams)
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
            $response['tokenDetails'] = self::_refreshAccessToken($queryParams);
        }

        $usersMetaApiEndpoint = "https://www.zohoapis.{$queryParams->dataCenter}/bigin/v1/users";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $usersMetaResponse = HttpHelper::get($usersMetaApiEndpoint, null, $authorizationHeader);

        if (!is_wp_error($usersMetaResponse)) {
            $users = $usersMetaResponse->users;

            if (\count($users) > 0) {
                $allUsers = [];
                foreach ($users as $user) {
                    $allUsers[$user->full_name] = (object) [
                        'userId'   => $user->id,
                        'userName' => $user->full_name
                    ];
                }
                uksort($allUsers, 'strnatcasecmp');
                $response['users'] = $allUsers;
            }
        } else {
            wp_send_json_error(
                empty($usersMetaResponse->data) ? 'Unknown' : $usersMetaResponse->error,
                400
            );
        }
        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response['lists']);
        }
        wp_send_json_success($response, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integID = $integrationData->id;
        $tokenDetails = $integrationDetails->tokenDetails;
        $module = $integrationDetails->module;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;
        if (
            empty($tokenDetails)
            || empty($module)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Zoho Bigin'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }
        if ((\intval($tokenDetails->generates_on) + (55 * 60)) < time()) {
            $requiredParams['clientId'] = $integrationDetails->clientId;
            $requiredParams['clientSecret'] = $integrationDetails->clientSecret;
            $requiredParams['dataCenter'] = $integrationDetails->dataCenter;
            $requiredParams['tokenDetails'] = $tokenDetails;
            $newTokenDetails = self::_refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                self::saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }

        $required = !empty($defaultDataConf->moduleData->{$module}->required)
            ? $defaultDataConf->moduleData->{$module}->required : [];

        $actions = $integrationDetails->actions;
        $fileMap = $integrationDetails->upload_field_map;
        $recordApiHelper = new RecordApiHelper($tokenDetails, $integID);
        $zBiginApiResponse = $recordApiHelper->execute(
            $defaultDataConf,
            $module,
            $fieldValues,
            $fieldMap,
            $actions,
            $required,
            // $fileMap,
            $integrationDetails
        );
        if (is_wp_error($zBiginApiResponse)) {
            return $zBiginApiResponse;
        }

        if (
            \count($integrationDetails->relatedlists)
            && !empty($zBiginApiResponse->response->result->row->success->details->FL[0])
            && $zBiginApiResponse->response->result->row->success->details->FL[0]->val === 'Id'
        ) {
            foreach ($integrationDetails->relatedlists as $relatedlist) {
                if (!empty($relatedlist->module)) {
                    $recordID = $zBiginApiResponse->response->result->row->success->details->FL[0]->content;
                    $relatedListModule = $relatedlist->module;
                    $defaultDataConf->moduleData->{$relatedListModule}->fields->{'SEMODULE'} = (object) [
                        'length'    => \strlen($relatedListModule),
                        'required'  => true,
                        'data_type' => 'string',
                    ];
                    $fieldValues['SEMODULE'] = $relatedListModule;
                    $relatedlist->field_map[] = (object)
                    [
                        'formField'     => 'SEMODULE',
                        'zohoFormField' => 'SEMODULE'
                    ];

                    $defaultDataConf->moduleData->{$relatedListModule}->fields->{'SEID'} = (object) [
                        'length'    => \strlen($recordID),
                        'required'  => true,
                        'data_type' => 'string',
                    ];
                    $fieldValues['SEID'] = $recordID;
                    $relatedlist->field_map[] = (object)
                    [
                        'formField'     => 'SEID',
                        'zohoFormField' => 'SEID'
                    ];

                    $zBiginRelatedRecResp = $recordApiHelper->execute(
                        $defaultDataConf,
                        $relatedListModule,
                        $fieldValues,
                        $relatedlist->field_map,
                        $relatedlist->actions,
                        !empty($defaultDataConf->moduleData->{$relatedListModule}->required)
                            ? $defaultDataConf->moduleData->{$relatedListModule}->required : [],
                        $relatedlist->upload_field_map
                    );
                }
            }
        }

        return $zBiginApiResponse;
    }

    /**
     * Helps to refresh zoho bigin access_token
     *
     * @param array $apiData Contains required data for refresh access token
     *
     * @return JSON $tokenDetails API token details
     */
    protected static function _refreshAccessToken($apiData)
    {
        if (
            !\is_object($apiData)
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
     * @param int        $integrationID ID of Zoho bigin Integration
     * @param Obeject    $tokenDetails  refreshed token info
     * @param null|mixed $others
     *
     * @return null
     */
    protected static function saveRefreshedToken($integrationID, $tokenDetails, $others = null)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $zbiginDetails = $flow->get(['id' => $integrationID]);

        if (is_wp_error($zbiginDetails)) {
            return;
        }
        $newDetails = json_decode($zbiginDetails[0]->flow_details);

        $newDetails->tokenDetails = $tokenDetails;
        if (!empty($others['modules'])) {
            $newDetails->default->modules = $others['modules'];
        }
        if (!empty($others['related_modules'])) {
            $newDetails->default->relatedlist['modules'] = $others['related_modules'];
        }

        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
