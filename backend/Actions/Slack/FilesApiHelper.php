<?php

/**
 * Slack Files Api
 */

namespace BitApps\Integrations\Actions\Slack;

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
     * @param string $apiEndPoint  slack API base URL
     * @param array  $data         Data to pass to API
     * @param mixed  $_accessToken
     *
     * @return array $uploadResponse slack API response
     */
    public function uploadFiles($apiEndPoint, $data, $_accessToken)
    {
        $uploadFileEndpoint = $apiEndPoint . '/files.upload';

        if (\is_array($data['file'])) {
            $file = $data['file'][0];
        } else {
            $file = $data['file'];
        }

        if (empty($file)) {
            return false;
        }

        $safePath = Common::safeUploadFilePath($file);
        if ($safePath === '') {
            return false;
        }

        $data['file'] = new CURLFile($safePath);

        return HttpHelper::post(
            $uploadFileEndpoint,
            $data,
            [
                'Content-Type'  => 'multipart/form-data',
                'Authorization' => 'Bearer ' . $_accessToken
            ]
        );
    }
}
