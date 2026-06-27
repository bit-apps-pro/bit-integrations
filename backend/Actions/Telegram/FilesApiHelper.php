<?php

/**
 * Telegram Files Api
 */

namespace BitApps\Integrations\Actions\Telegram;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use CURLFile;

/**
 * Provide functionality for Upload files
 */
final class FilesApiHelper
{
    private $_defaultHeader;

    private $_payloadBoundary;

    public function __construct()
    {
        $this->_payloadBoundary = wp_generate_password(24);
        $this->_defaultHeader['Content-Type'] = 'multipart/form-data; boundary=' . $this->_payloadBoundary;
    }

    /**
     * Helps to execute upload files api
     *
     * @param string $apiEndPoint Telegram API base URL
     * @param array  $data        Data to pass to API
     *
     * @return array $uploadResponse Telegram API response
     */
    public function uploadFiles($apiEndPoint, $data)
    {
        $safePath = Common::safeUploadFilePath($data['photo']);
        if ($safePath === '') {
            return false;
        }

        $mimeType = mime_content_type($safePath);
        $fileType = explode('/', $mimeType);

        switch ($fileType[0]) {
            case 'image':
                $apiMethod = '/sendPhoto';
                $param = 'photo';

                break;

            case 'audio':
                $apiMethod = '/sendAudio';
                $param = 'audio';

                break;
            case 'video':
                $apiMethod = '/sendVideo';
                $param = 'video';

                break;

            default:
                $apiMethod = '/sendDocument';
                $param = 'document';

                break;
        }
        $uploadFileEndpoint = $apiEndPoint . $apiMethod;

        $data[$param] = new CURLFile($safePath);

        if ($param != 'photo') {
            unset($data['photo']);
        }

        return HttpHelper::post(
            $uploadFileEndpoint,
            $data,
            [
                'Content-Type' => 'multipart/form-data',
            ]
        );
    }

    public function uploadMultipleFiles($apiEndPoint, $data)
    {
        $param = 'media';
        $uploadMultipleFileEndpoint = $apiEndPoint . '/sendMediaGroup';
        $postFields = [
            'chat_id' => $data['chat_id'],
            'caption' => $data['caption'],
        ];

        foreach ($data['media'] as $key => $value) {
            $safePath = Common::safeUploadFilePath($value);
            if ($safePath === '') {
                continue;
            }

            $mimeType = mime_content_type($safePath);
            $fileType = explode('/', $mimeType);
            unset($data['media'][$key]);

            if ($fileType[0] == 'image') {
                $type = 'photo';
            } elseif ($fileType[0] == 'application' || $fileType[0] == 'text') {
                $type = 'document';
            } else {
                $type = empty($fileType[0]) ? 'photo' : $fileType[0];
            }

            $media[] = [
                'type'       => $type,
                'media'      => "attach://{$key}.path",
                'caption'    => $data['caption'],
                'parse_mode' => 'HTML'
            ];
            $nameK = "{$key}.path";
            $postFields[$nameK] = new CURLFile($safePath);
        }
        $postFields['media'] = wp_json_encode($media);

        if ($param != 'media') {
            unset($data['media']);
        }

        return HttpHelper::post(
            $uploadMultipleFileEndpoint,
            $postFields,
            [
                'Content-Type' => 'multipart/form-data',
            ]
        );
    }
}
