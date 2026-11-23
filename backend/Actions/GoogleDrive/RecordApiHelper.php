<?php

namespace BitApps\Integrations\Actions\GoogleDrive;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\FileSystem;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    protected $token;

    protected $errorApiResponse = [];

    protected $successApiResponse = [];

    private const API_BASE = 'https://www.googleapis.com/drive/v3/files';

    private const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

    private $folderIds = [];

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function uploadFile($folder, $file)
    {
        if ($file === '') {
            return false;
        }

        $filePath = Common::safeUploadFilePath($file);
        if ($filePath === '') {
            return new \WP_Error(423, __("Can't open file!", 'bit-integrations'));
        }

        $apiEndpoint = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true';
        $boundary = $this->getBoundary();
        $headers = [
            'Authorization' => 'Bearer ' . $this->token,
            'Content-Type'  => 'multipart/related; boundary="' . $boundary . '"',
        ];

        return HttpHelper::post($apiEndpoint, $this->getBody($folder, $filePath, $boundary), $headers);
    }

    public function handleAllFiles($folderWithFile, $actions, $folderKey = null)
    {
        foreach ($folderWithFile as $folder => $file) {
            $folder = $folderKey ? $folderKey : $folder;
            if ($file == '') {
                continue;
            }

            if (\is_array($file)) {
                $this->handleAllFiles($file, $actions, $folder);
            } else {
                $response = $this->uploadFile($folder, $file);
                $this->storeInState($response);
                $this->deleteFile($file, $actions);
            }
        }
    }

    public function deleteFile($file, $actions)
    {
        if (isset($actions->delete_from_wp) && $actions->delete_from_wp) {
            $filePath = Common::safeUploadFilePath($file);

            if ($filePath !== '' && file_exists($filePath)) {
                wp_delete_file($filePath);
            }
        }
    }

    public function executeRecordApi($integrationId, $fieldValues, $fieldMap, $actions, $folderPath = '')
    {
        $folderWithFile = [];
        foreach ($fieldMap as $value) {
            if (!\is_null($fieldValues[$value->formField])) {
                $folderId = $this->resolveFolder((string) $value->googleDriveFormField, (string) $folderPath);
                $folderWithFile[$folderId][] = $fieldValues[$value->formField];
            }
        }

        $this->handleAllFiles($folderWithFile, $actions);

        if (\count($this->successApiResponse) > 0) {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'GoogleDrive', 'type_name' => 'file_upload']), 'success', __('All Files Uploaded.', 'bit-integrations') . wp_json_encode($this->successApiResponse));
        }
        if (\count($this->errorApiResponse) > 0) {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'GoogleDrive', 'type_name' => 'file_upload']), 'error', __('Some Files Can\'t Upload.', 'bit-integrations') . wp_json_encode($this->errorApiResponse));
        }
    }

    protected function getBody($folder, $filePath, $boundary)
    {
        $body = '--' . $boundary . "\r\n";
        $body .= "Content-Type: application/json; charset=UTF-8\r\n\r\n";
        $body .= '{"name": "' . basename($filePath) . '", "parents": ["' . $folder . '"]}' . "\r\n";
        $body .= '--' . $boundary . "\r\n";
        $body .= "Content-Type: application/octet-stream\r\n\r\n";
        $body .= FileSystem::read($filePath) . "\r\n";
        $body .= '--' . $boundary . "--\r\n";

        return $body;
    }

    private function resolveFolder($parentId, $folderPath)
    {
        $parentId = $parentId === '' ? 'root' : $parentId;
        $segments = array_filter(array_map('trim', explode('/', $folderPath)), 'strlen');

        foreach ($segments as $name) {
            $key = $parentId . '/' . $name;

            if (!isset($this->folderIds[$key])) {
                $this->folderIds[$key] = $this->findFolder($parentId, $name) ?: $this->createFolder($parentId, $name);
            }

            if ($this->folderIds[$key] === '') {
                return $parentId;
            }

            $parentId = $this->folderIds[$key];
        }

        return $parentId;
    }

    private function findFolder($parentId, $name)
    {
        $query = \sprintf(
            "name = '%s' and '%s' in parents and mimeType = '%s' and trashed = false",
            addcslashes($name, "\\'"),
            addcslashes($parentId, "\\'"),
            self::FOLDER_MIME_TYPE
        );

        $response = HttpHelper::get(
            self::API_BASE . '?' . http_build_query([
                'q'                         => $query,
                'fields'                    => 'files(id)',
                'pageSize'                  => 1,
                'supportsAllDrives'         => 'true',
                'includeItemsFromAllDrives' => 'true',
            ]),
            null,
            ['Authorization' => 'Bearer ' . $this->token]
        );

        return (string) ($response->files[0]->id ?? '');
    }

    private function createFolder($parentId, $name)
    {
        $response = HttpHelper::post(
            self::API_BASE . '?supportsAllDrives=true&fields=id',
            wp_json_encode(['name' => $name, 'mimeType' => self::FOLDER_MIME_TYPE, 'parents' => [$parentId]]),
            ['Authorization' => 'Bearer ' . $this->token, 'Content-Type' => 'application/json']
        );

        return (string) ($response->id ?? '');
    }

    protected function getBoundary()
    {
        return 'BITCODE_BI_' . md5(time());
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
