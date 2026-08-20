<?php

/**
 * ZohoDesk Files Api
 */

namespace BitApps\Integrations\Actions\ZohoDesk;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\FileSystem;
use BitApps\Integrations\Core\Util\HttpHelper;

final class FilesApiHelper
{
    private $_defaultHeader;

    private $_apiDomain;

    private $_payloadBoundary;

    private $_basepath;

    public function __construct($tokenDetails, $orgId)
    {
        $this->_payloadBoundary = wp_generate_password(24);
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_defaultHeader['orgId'] = $orgId;
        $this->_defaultHeader['content-type'] = 'multipart/form-data; boundary=' . $this->_payloadBoundary;
        $this->_apiDomain = urldecode($tokenDetails->api_domain ?? '');
    }

    public function uploadFiles($files, $ticketId, $dataCenter)
    {
        $uploadFileEndpoint = "https://desk.zoho.{$dataCenter}/api/v1/tickets/{$ticketId}/attachments";
        $payload = '';
        if (\is_array($files)) {
            foreach ($files as $fileIndex => $fileName) {
                $payload = '';
                if (($safeFile = Common::safeUploadFilePath($fileName)) !== '') {
                    $payload .= '--' . $this->_payloadBoundary;
                    $payload .= "\r\n";
                    $payload .= 'Content-Disposition: form-data; name="' . 'file'
                        . '"; filename="' . basename("{$fileName}") . '"' . "\r\n";
                    $payload .= "\r\n";
                    $payload .= FileSystem::read($safeFile);
                    $payload .= "\r\n";
                    $payload .= '--' . $this->_payloadBoundary . '--';
                }
                $uploadResponse = HttpHelper::post($uploadFileEndpoint, $payload, $this->_defaultHeader);
            }

            return $uploadResponse;
        } elseif (($safeFiles = Common::safeUploadFilePath($files)) !== '') {
            $payload .= '--' . $this->_payloadBoundary;
            $payload .= "\r\n";
            $payload .= 'Content-Disposition: form-data; name="' . 'file'
                . '"; filename="' . basename("{$files}") . '"' . "\r\n";
            $payload .= "\r\n";
            $payload .= FileSystem::read($safeFiles);
            $payload .= "\r\n";
        }
        if (empty($payload)) {
            return false;
        }
        $payload .= '--' . $this->_payloadBoundary . '--';

        return HttpHelper::post($uploadFileEndpoint, $payload, $this->_defaultHeader);
    }
}
