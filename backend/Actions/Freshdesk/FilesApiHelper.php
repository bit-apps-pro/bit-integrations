<?php

/**
 * Slack Files Api
 */

namespace BitApps\Integrations\Actions\Freshdesk;

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
     * @param string $apiEndPoint FreshDesk API base URL
     * @param array  $data        Data to pass to API
     * @param mixed  $api_key
     *
     * @return array|bool $uploadResponse FreshDesk API response
     */
    public function uploadFiles($apiEndPoint, $data, $api_key)
    {
        $safePath = Common::safeUploadFilePath($data['avatar']);
        if ($safePath === '') {
            return false;
        }
        $data['avatar'] = new CURLFile($safePath);

        return HttpHelper::post(
            $apiEndPoint,
            $data,
            [
                'Authorization' => base64_encode("{$api_key}"),
                'Content-Type'  => 'multipart/form-data',
            ]
        );
    }
}
