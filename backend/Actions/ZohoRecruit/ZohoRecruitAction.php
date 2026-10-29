<?php

namespace BitApps\Integrations\Actions\ZohoRecruit;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ZohoRecruitAction
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
            $newTokenDetails = ZohoRecruitHelper::refreshAccessToken((object) $requiredParams);
            if ($newTokenDetails) {
                ZohoRecruitHelper::saveRefreshedToken($this->_integrationID, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
            }
        }

        $required = !empty($defaultDataConf->moduleData->{$module}->required)
            ? $defaultDataConf->moduleData->{$module}->required : [];

        $actions = $integrationDetails->actions;
        $fileMap = $integrationDetails->upload_field_map;
        $dataCenter = $integrationDetails->dataCenter;
        $recordApiHelper = new ZohoRecruitService($dataCenter, $tokenDetails, $this->_integrationID);
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
}
