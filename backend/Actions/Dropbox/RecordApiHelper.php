<?php

namespace BitApps\Integrations\Actions\Dropbox;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class RecordApiHelper
{
    protected $token;

    protected $errorApiResponse = [];

    protected $successApiResponse = [];

    protected $contentBaseUri = 'https://content.dropboxapi.com';

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function uploadFile($folder, $filePath)
    {
        if ($filePath === '') {
            return false;
        }

        $safeFilePath = Common::safeUploadFilePath(trim($filePath));
        if ($safeFilePath === '') {
            return new WP_Error(423, __('Can\'t open file!', 'bit-integrations'));
        }

        $body = file_get_contents($safeFilePath);

        if (!$body) {
            return new WP_Error(423, __('Can\'t open file!', 'bit-integrations'));
        }

        $apiEndPoint = $this->contentBaseUri . '/2/files/upload';
        $headers = [
            'Authorization'   => 'Bearer ' . $this->token,
            'Content-Type'    => 'application/octet-stream',
            'Dropbox-API-Arg' => wp_json_encode(['path' => $folder . '/' . trim(basename($filePath)), 'mode' => 'add', 'autorename' => true, 'mute' => true, 'strict_conflict' => false]),
        ];

        return HttpHelper::post($apiEndPoint, $body, $headers);
    }

    public function handleAllFiles($folderWithFile, $actions, $folderKey = null)
    {
        foreach ($folderWithFile as $folder => $filePath) {
            $folder = $folderKey ? $folderKey : $folder;
            if ($filePath == '') {
                continue;
            }

            if (\is_array($filePath)) {
                return $this->handleAllFiles($filePath, $actions, $folder);
            }
            $response = $this->uploadFile($folder, $filePath);
            $this->storeInState($response);
            $this->deleteFile($filePath, $actions);
        }
    }

    public function deleteFile($filePath, $actions)
    {
        if (isset($actions->delete_from_wp) && $actions->delete_from_wp) {
            if (file_exists($filePath)) {
                wp_delete_file($filePath);
            }
        }
    }

    public function executeRecordApi($integrationId, $fieldValues, $fieldMap, $actions)
    {
        $folderWithFile = [];
        foreach ($fieldMap as $value) {
            if (!\is_null($fieldValues[$value->formField])) {
                $folderWithFile[$value->dropboxFormField] = $fieldValues[$value->formField];
            }
        }
        $this->handleAllFiles($folderWithFile, $actions);

        if (\count($this->successApiResponse) > 0) {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'dropbox', 'type_name' => 'file_upload']), 'success', __('All Files Uploaded.', 'bit-integrations') . wp_json_encode($this->successApiResponse));
        }
        if (\count($this->errorApiResponse) > 0) {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'dropbox', 'type_name' => 'file_upload']), 'error', __('Some Files Can\'t Upload.', 'bit-integrations') . wp_json_encode($this->errorApiResponse));
        }

        return true;
    }

    protected function storeInState($response)
    {
        if (isset($response->id)) {
            $this->successApiResponse[] = $response;
        } else {
            $this->errorApiResponse[] = $response;
        }
    }
}
