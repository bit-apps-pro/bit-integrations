<?php

/**
 * Freshdesk Files Api
 */

namespace BitApps\Integrations\Actions\Freshdesk;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use CURLFile;

final class AllFilesApiHelper
{
    private $_defaultHeader;

    private $_payloadBoundary;

    public function __construct()
    {
        $this->_payloadBoundary = wp_generate_password(24);
        $this->_defaultHeader['Content-Type'] = 'multipart/form-data; boundary=' . $this->_payloadBoundary;
    }

    public function allUploadFiles($apiEndPoint, $data, $api_key)
    {
        $data['attachments'] = static::setAttachment($data['attachments']);

        $uploadResponse = HttpHelper::post(
            $apiEndPoint,
            $data,
            [
                'Authorization' => base64_encode("{$api_key}"),
                'Content-Type'  => 'multipart/form-data',
            ]
        );

        return $uploadResponse;
    }

    private static function setAttachment($files)
    {
        $attachments = [];
        foreach ($files as $file) {
            if (\is_array($file)) {
                return static::setAttachment($file);
            }
            $safePath = Common::safeUploadFilePath($file);
            if ($safePath === '') {
                continue;
            }
            $attachments[] = new CURLFile($safePath);
        }

        return $attachments;
    }
}
