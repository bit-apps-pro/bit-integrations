<?php

/**
 * ZohoRecruit Integration
 */

namespace BitApps\Integrations\Actions\ZohoRecruit;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

/**
 * Provide functionality for ZohoCrm integration
 */
class ZohoRecruitController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zohorecruit',
        'fields'   => [
            'dataCenter'   => 'dataCenter',
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

    public static function refreshModules($queryParams)
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
        $zohosIntegratedModules = [
            'zohosign__ZohoSign_Document_Events',
            'zohoshowtime__ShowTime_Sessions',
            'zohoshowtime__Zoho_ShowTime',
            'zohosign__ZohoSign_Documents',
            'zohosign__ZohoSign_Recipients'
        ];
        $modulesMetaApiEndpoint = "https://recruit.zoho.{$queryParams->dataCenter}/recruit/private/json/Info/getModules?authtoken={$queryParams->tokenDetails->access_token}&scope=ZohoRecruit.modules.all&version=2";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $modulesMetaResponse = HttpHelper::get($modulesMetaApiEndpoint, null, $authorizationHeader);
        if (!is_wp_error($modulesMetaResponse) && (empty($modulesMetaResponse->status) || (!empty($modulesMetaResponse->status) && $modulesMetaResponse->status !== 'error'))) {
            $retriveModuleData = $modulesMetaResponse->response->result->row;
            $allModules = [
                'Tasks' => (object) [
                    'aMod' => 'Tasks',
                    'pl'   => 'Tasks'
                ],
                'Events' => (object) [
                    'aMod' => 'Events',
                    'pl'   => 'Events'
                ],
                'Calls' => (object) [
                    'aMod' => 'Calls',
                    'pl'   => 'Calls'
                ],
            ];
            foreach ($retriveModuleData as $value) {
                if (preg_match('/CustomModule/', $value->aMod) || preg_match('/Candidates/', $value->aMod)) {
                    $allModules[$value->aMod] = (object) [
                        'aMod' => $value->aMod,
                        'pl'   => $value->pl
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

    public static function refreshNoteTypes($queryParams)
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

        $notesMetaApiEndpoint = "https: //recruit.zoho.com/recruit/private/json/Notes/getNoteTypes?authtoken={$queryParams->tokenDetails->access_token}&scope=ZohoRecruit.modules.call.all&version=2";

        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $notesMetaResponse = HttpHelper::get($notesMetaApiEndpoint, null, $authorizationHeader);

        // wp_send_json_success($notesMetaResponse, 200);

        if (!is_wp_error($notesMetaResponse) && (empty($notesMetaResponse->status) || (!empty($notesMetaResponse->status) && $notesMetaResponse->status !== 'error'))) {
            $retriveModuleData = $notesMetaResponse->response->result->Notes->row;
            $allNoteTypes = [];
            foreach ($retriveModuleData as $value) {
                $allNoteTypes[$value->FL[0]->dv] = (object) [
                    'noteTypeId'   => $value->FL[1]->content,
                    'noteTypeName' => $value->FL[0]->dv
                ];
            }
            uksort($allNoteTypes, 'strnatcasecmp');
            $response['noteTypes'] = $allNoteTypes;
        } else {
            wp_send_json_error(
                empty($notesMetaResponse->error) ? 'Unknown' : $notesMetaResponse->error,
                400
            );
        }
        if (!empty($response['tokenDetails']) && !empty($queryParams->id)) {
            self::saveRefreshedToken($queryParams->id, $response['tokenDetails'], $response['notetypes']);
        }
        wp_send_json_success($response, 200);
    }

    /**
     * Process ajax request for refresh recruit modules
     *
     * @param mixed $queryParams
     *
     * @return JSON recruit module data
     */
    public static function refreshRelatedModules($queryParams)
    {
        if (empty($queryParams->tokenDetails)
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
                'aMod' => 'Tasks',
                'pl'   => 'Tasks'
            ],
            'Events' => (object) [
                'aMod' => 'Events',
                'pl'   => 'Events'
            ],
            'Calls' => (object) [
                'aMod' => 'Calls',
                'pl'   => 'Calls'
            ],
            // 'Notes' => (object) array(
            //     'aMod' => 'Notes',
            //     'pl' => 'Notes'
            // ),
        ];
        foreach ($allModules as $module) {
            if ($module->aMod !== $queryParams->module) {
                $relatedModules[$module->aMod] = (object) [
                    'aMod' => $module->aMod,
                    'pl'   => $module->pl
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
     * Process ajax request for refesh recruit layouts
     *
     * @param mixed $queryParams
     *
     * @return JSON recruit layout data
     */
    public static function getFields($queryParams)
    {
        if (empty($queryParams->module)
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
            $response['tokenDetails'] = self::refreshAccessToken($queryParams);
        }
        $fieldsMetaApiEndpoint = "https://recruit.zoho.{$queryParams->dataCenter}/recruit/private/json/{$queryParams->module}/getFields?authtoken={$queryParams->tokenDetails->access_token}&scope=recruitapi&version=2";
        $authorizationHeader['Authorization'] = "Zoho-oauthtoken {$queryParams->tokenDetails->access_token}";
        $requiredParams['module'] = $queryParams->module;
        $fieldsMetaResponse = HttpHelper::get($fieldsMetaApiEndpoint, $requiredParams, $authorizationHeader);

        if (!is_wp_error($fieldsMetaResponse) && (empty($fieldsMetaResponse->status) || (!empty($fieldsMetaResponse->status) && $fieldsMetaResponse->status !== 'error'))) {
            $retriveFieldsData = $fieldsMetaResponse->{$queryParams->module}->section;
            if (!\is_array($retriveFieldsData)) {
                $retriveFieldsData = [$retriveFieldsData];
            }
            $fields = [];
            $fileUploadFields = [];
            $requiredFields = [];
            $requiredFileUploadFiles = [];
            if ($queryParams->module === 'Candidates') {
                $fileUploadFields['Candidate Photo'] = (object) [
                    'display_label' => __('Candidate Profile Photo', 'bit-integrations'),
                    'length'        => 1000,
                    'data_type'     => 'UploadText',
                    'required'      => 'false'
                ];
            }
            if (\count($retriveFieldsData)) {
                foreach ($retriveFieldsData as $fieldValue) {
                    foreach ($fieldValue->FL as $sectionValue) {
                        if ($sectionValue->dv === null) {
                            continue;
                        }
                        if ($sectionValue->type === 'UploadText') {
                            $fileUploadFields[$sectionValue->dv] = (object) [
                                'display_label' => $sectionValue->dv,
                                'length'        => $sectionValue->maxlength,
                                'data_type'     => $sectionValue->type,
                                'required'      => $sectionValue->req
                            ];
                            if ($sectionValue->req === 'true') {
                                $requiredFileUploadFiles[] = $sectionValue->dv;
                            }
                        } else {
                            $fields[$sectionValue->dv] = (object) [
                                'display_label' => $sectionValue->dv,
                                'length'        => $sectionValue->maxlength,
                                'data_type'     => $sectionValue->type,
                                'required'      => $sectionValue->req
                            ];
                            if ($sectionValue->req === 'true') {
                                $requiredFields[] = $sectionValue->dv;
                            }
                        }
                    }
                }
            } else {
                foreach ($retriveFieldsData->FL as $sectionValue) {
                    if ($sectionValue->dv === null) {
                        continue;
                    }
                    if ($sectionValue->aMod === 'Candidates') {
                        $fileUploadFields[$sectionValue->dv] = (object) [
                            'display_label' => 'Candidate Profile Photo',
                            'length'        => 1000,
                            'data_type'     => 'UploadText',
                            'required'      => 'false'
                        ];
                    }
                    if ($sectionValue->type === 'UploadText') {
                        $fileUploadFields[$sectionValue->dv] = (object) [
                            'display_label' => $sectionValue->dv,
                            'length'        => $sectionValue->maxlength,
                            'data_type'     => $sectionValue->type,
                            'required'      => $sectionValue->req
                        ];
                        if ($sectionValue->req === 'true') {
                            $requiredFileUploadFiles[] = $sectionValue->dv;
                        }
                    } else {
                        $fields[$sectionValue->dv] = (object) [
                            'display_label' => $sectionValue->dv,
                            'length'        => $sectionValue->maxlength,
                            'data_type'     => $sectionValue->type,
                            'required'      => $sectionValue->req
                        ];
                        if ($sectionValue->req === 'true') {
                            $requiredFields[] = $sectionValue->dv;
                        }
                    }
                }
            }

            if ($queryParams->module === 'Candidates' && isset($fields['Zip/Postal Code'])) {
                $fields['Zip Code'] = $fields['Zip/Postal Code'];
                unset($fields['Zip/Postal Code']);
            }

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
        // } else {
        //     wp_send_json_error(
        //         __(
        //             'Token expired',
        //             'bit-integrations'
        //         ),
        //         401
        //     );
        // }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $tokenDetails = $integrationDetails->tokenDetails;
        $module = $integrationDetails->module;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;
        if (empty($tokenDetails)
            || empty($module)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Zoho Recruit'));
        }
        if (empty($defaultDataConf->moduleData->{$module}->fields) || empty($defaultDataConf->modules->{$module})) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Zoho Recruit'));
        }
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

        $required = !empty($defaultDataConf->moduleData->{$module}->required)
            ? $defaultDataConf->moduleData->{$module}->required : [];

        $actions = $integrationDetails->actions;
        $fileMap = $integrationDetails->upload_field_map;
        $dataCenter = $integrationDetails->dataCenter;
        $recordApiHelper = new RecordApiHelper($dataCenter, $tokenDetails, $this->_integrationID);
        $zRecruitApiResponse = $recordApiHelper->execute(
            $defaultDataConf,
            $module,
            $fieldValues,
            $fieldMap,
            $actions,
            $required,
            $fileMap
        );
        if (is_wp_error($zRecruitApiResponse)) {
            return $zRecruitApiResponse;
        }

        if (\count($integrationDetails->relatedlists)
            && !empty($zRecruitApiResponse->response->result->row->success->details->FL[0])
            && $zRecruitApiResponse->response->result->row->success->details->FL[0]->val === 'Id'
        ) {
            foreach ($integrationDetails->relatedlists as $relatedlist) {
                if (!empty($relatedlist->module)) {
                    $recordID = $zRecruitApiResponse->response->result->row->success->details->FL[0]->content;
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

                    $zRecruitRelatedRecResp = $recordApiHelper->execute(
                        $this->_formID,
                        $entryID,
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

        return $zRecruitApiResponse;
    }

    /**
     * Helps to refresh zoho recruit access_token
     *
     * @param object $apiData Contains required data for refresh access token
     *
     * @return JSON $tokenDetails API token details
     */
    protected static function refreshAccessToken($apiData)
    {
        if (empty($apiData->dataCenter)
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
     * @param int        $integrationID ID of Zoho recruit Integration
     * @param object     $tokenDetails  refreshed token info
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
        $zrecruitDetails = $flow->get(['id' => $integrationID]);

        if (is_wp_error($zrecruitDetails)) {
            return;
        }
        $newDetails = json_decode($zrecruitDetails[0]->integration_details);

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
