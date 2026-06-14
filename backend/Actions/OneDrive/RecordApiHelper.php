<?php

namespace BitApps\Integrations\Actions\OneDrive;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    protected $token;

    protected $errorApiResponse = [];

    protected $successApiResponse = [];

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function uploadFile($folder, $file, $folderId, $parentId)
    {
        if (\is_null($parentId)) {
            // $parentId = 'root';
            $parentId = $folderId;
        }
        $ids = explode('!', $folderId);
        if ($file === '') {
            return false;
        }

        $filePath = Common::safeUploadFilePath($file);
        if ($filePath === '') {
            return new \WP_Error(423, __("Can't open file!", 'bit-integrations'));
        }
        $apiEndpoint = 'https://api.onedrive.com/v1.0/drives/' . $ids[0] . '/items/' . $parentId . ':/' . basename($filePath) . ':/content';

        $headers = [
            'Authorization'  => 'Bearer ' . $this->token,
            'Content-Type'   => 'application/octet-stream',
            'Content-Length' => filesize($filePath),
            'Prefer'         => 'respond-async',
            'X-HTTP-Method'  => 'PUT'
        ];

        return HttpHelper::post(
            $apiEndpoint,
            file_get_contents($filePath),
            $headers
        );
    }

    public function handleAllFiles($folderWithFile, $actions, $folderId, $parentId)
    {
        foreach ($folderWithFile as $folder => $filePath) {
            if ($filePath == '') {
                continue;
            }
            if (\is_array($filePath)) {
                foreach ($filePath as $singleFilePath) {
                    if ($singleFilePath == '') {
                        continue;
                    }
                    $response = $this->uploadFile($folder, $singleFilePath, $folderId, $parentId);
                    $this->storeInState($response);
                    $this->deleteFile($singleFilePath, $actions);
                }
            } else {
                $response = $this->uploadFile($folder, $filePath, $folderId, $parentId);
                $this->storeInState($response);
                $this->deleteFile($filePath, $actions);
            }
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

    public function executeRecordApi($integrationId, $fieldValues, $fieldMap, $actions, $folderId, $parentId)
    {
        $folderWithFile = [];
        $actionsAttachments = explode(',', "{$actions->attachments}");
        if (\is_array($actionsAttachments)) {
            foreach ($actionsAttachments as $actionAttachment) {
                if (\is_array($fieldValues[$actionAttachment])) {
                    foreach ($fieldValues[$actionAttachment] as $value) {
                        // key need correction
                        $folderWithFile = ["{$actionsAttachments}" => $value];
                    }
                    $this->handleAllFiles($folderWithFile, $actions, $folderId, $parentId);
                } else {
                    $folderWithFile = ["{$actionsAttachments}" => $fieldValues[$actionAttachment]];
                    $this->handleAllFiles($folderWithFile, $actions, $folderId, $parentId);
                }
            }
        }

        if (\count($this->successApiResponse) > 0) {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'OneDrive', 'type_name' => 'file_upload']), 'success', __('All Files Uploaded.', 'bit-integrations') . wp_json_encode($this->successApiResponse));
        }
        if (\count($this->errorApiResponse) > 0) {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'OneDrive', 'type_name' => 'file_upload']), 'error', __('Some Files Can\'t Upload.', 'bit-integrations') . wp_json_encode($this->errorApiResponse));
        }
    }

    protected function storeInState($response)
    {
        $response = \is_string($response) ? json_decode($response) : $response;

        if (isset($response->id)) {
            $this->successApiResponse[] = $response;
        } else {
            $this->errorApiResponse[] = $response;
        }
    }
}
