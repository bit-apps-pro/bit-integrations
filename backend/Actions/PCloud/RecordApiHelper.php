<?php

namespace BitApps\Integrations\Actions\PCloud;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use CURLFile;

class RecordApiHelper
{
    protected $token;

    protected $errorApiResponse = [];

    protected $successApiResponse = [];

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function uploadFile($folder, $filePath)
    {
        if ($filePath === '') {
            return false;
        }

        if (\is_array($filePath)) {
            foreach ($filePath as $item) {
                $safePath = Common::safeUploadFilePath($item);
                if ($safePath === '') {
                    continue;
                }
                $response = HttpHelper::post(
                    'https://api.pcloud.com/uploadfile?folderid=' . $folder,
                    [
                        'filename' => new CURLFile($safePath)
                    ],
                    [
                        'Content-Type'  => 'multipart/form-data',
                        'Authorization' => 'Bearer ' . $this->token
                    ]
                );
            }
        } else {
            $safePath = Common::safeUploadFilePath($filePath);
            if ($safePath === '') {
                return false;
            }
            $response = HttpHelper::post(
                'https://api.pcloud.com/uploadfile?folderid=' . $folder,
                [
                    'filename' => new CURLFile($safePath)
                ],
                [
                    'Content-Type'  => 'multipart/form-data',
                    'Authorization' => 'Bearer ' . $this->token
                ]
            );
        }

        return $response;
    }

    public function handleAllFiles($folderWithFiles, $actions)
    {
        foreach ($folderWithFiles as $folderWithFile) {
            if ($folderWithFile == '') {
                continue;
            }
            foreach ($folderWithFile as $folder => $singleFilePath) {
                if ($singleFilePath == '') {
                    continue;
                }
                $response = $this->uploadFile($folder, \is_array($singleFilePath) ? $singleFilePath[0] : $singleFilePath);
                $this->storeInState($response);
                $this->deleteFile($singleFilePath[0], $actions);
            }
        }
    }

    public function deleteFile($filePath, $actions)
    {
        if (isset($actions->delete_from_wp) && $actions->delete_from_wp) {
            $safePath = Common::safeUploadFilePath($filePath);

            if ($safePath !== '' && file_exists($safePath)) {
                wp_delete_file($safePath);
            }
        }
    }

    public function executeRecordApi($integrationId, $fieldValues, $fieldMap, $actions)
    {
        foreach ($fieldMap as $value) {
            if (!\is_null($fieldValues[$value->formField])) {
                $folderWithFiles[] = [$value->pCloudFormField => $fieldValues[$value->formField]];
            }
        }

        $this->handleAllFiles($folderWithFiles, $actions);

        if (\count($this->successApiResponse) > 0) {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'PCloud', 'type_name' => 'file_upload']), 'success', __('All Files Uploaded', 'bit-integrations') . wp_json_encode($this->successApiResponse));
        }
        if (\count($this->errorApiResponse) > 0) {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'PCloud', 'type_name' => 'file_upload']), 'error', __('Some Files Can\'t Upload', 'bit-integrations') . wp_json_encode($this->errorApiResponse));
        }
    }

    protected function storeInState($response)
    {
        if (isset($response->metadata[0]->id)) {
            $this->successApiResponse[] = $response;
        } else {
            $this->errorApiResponse[] = $response;
        }
    }
}
