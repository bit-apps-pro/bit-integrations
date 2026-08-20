<?php

/**
 * Slack Files Api
 */

namespace BitApps\Integrations\Actions\Freshdesk;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use CURLFile;

final class FilesApiHelper
{
    private $_defaultHeader;

    private $_payloadBoundary;

    public function __construct()
    {
        $this->_payloadBoundary = wp_generate_password(24);
        $this->_defaultHeader['Content-Type'] = 'multipart/form-data; boundary=' . $this->_payloadBoundary;
    }

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
