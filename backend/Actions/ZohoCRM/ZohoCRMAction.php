<?php

namespace BitApps\Integrations\Actions\ZohoCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

final class ZohoCRMAction
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

    public static function addRelatedList($zcrmApiResponse, $integID, $fieldValues, $integrationDetails, ZohoCRMService $recordApiHelper)
    {
        foreach ($integrationDetails->relatedlists as $relatedlist) {
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
            $newTokenDetails = ZohoCRMHelper::_refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                ZohoCRMHelper::_saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            } else {
                LogHandler::save($this->_integrationID, 'token', 'error', __('Failed to refresh access token', 'bit-integrations'));

                return;
            }
        }

        $required = !empty($defaultDataConf->layouts->{$module}->{$layout}->required)
            ? $defaultDataConf->layouts->{$module}->{$layout}->required : [];
        $actions = $integrationDetails->actions;
        $recordApiHelper = new ZohoCRMService($tokenDetails);
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
}
