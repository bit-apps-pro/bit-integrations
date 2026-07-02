<?php

namespace BitApps\Integrations\Actions\PCloud;

use BitApps\Integrations\Actions\PCloud\RecordApiHelper as PCloudRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class PCloudController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'pcloud',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public static function getAllFolders($queryParams)
    {
        $accessToken = $queryParams->tokenDetails->access_token ?? ($queryParams->access_token ?? '');

        if (empty($accessToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = 'https://api.pcloud.com/listfolder?folderid=0';
        $header['Authorization'] = 'Bearer ' . $accessToken;

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (!empty($apiResponse) && !isset($apiResponse->error)) {
            foreach ($apiResponse->metadata->contents as $folder) {
                if ($folder->isfolder === true) {
                    $folders[] = [
                        'id'   => $folder->folderid,
                        'name' => $folder->name
                    ];
                }
            }
            wp_send_json_success($folders, 200);
        } else {
            wp_send_json_error(__('Folders fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $accessToken = $integrationData->flow_details->tokenDetails->access_token
            ?? ($integrationData->flow_details->access_token ?? '');

        if (empty($accessToken)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'pCloud', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'PCloud'));

            return false;
        }

        $integrationDetails = $integrationData->flow_details;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('Required fields not mapped', 'bit-integrations'));
            LogHandler::save($this->integrationID, 'record', 'validation', $error);

            return $error;
        }

        (new PCloudRecordApiHelper($accessToken))->executeRecordApi($this->integrationID, $fieldValues, $fieldMap, $actions);

        return true;
    }
}
