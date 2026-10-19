<?php

namespace BitApps\Integrations\Actions\ZohoBigin;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;

class ZohoBiginHelper
{
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
        if (!is_wp_error($layoutsMetaResponse) && (empty($layoutsMetaResponse->status) || (!empty($layoutsMetaResponse->status) && $layoutsMetaResponse->status !== 'error'))) {
            $retriveLayoutsData = $layoutsMetaResponse->layouts ?? [];
            $allLayouts = [];
            foreach ($retriveLayoutsData as $layout) {
                $allLayouts[] = (object) [
                    'display_label' => $layout->display_label,
                    'name'          => $layout->name
                ];
            }
            usort($allLayouts, function ($a, $b) {
                return strnatcasecmp($a->display_label, $b->display_label);
            });
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

    /**
     * Helps to refresh zoho bigin access_token
     *
     * @param array $apiData Contains required data for refresh access token
     *
     * @return JSON $tokenDetails API token details
     */
    public static function _refreshAccessToken($apiData)
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
    public static function saveRefreshedToken($integrationID, $tokenDetails, $others = null)
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
