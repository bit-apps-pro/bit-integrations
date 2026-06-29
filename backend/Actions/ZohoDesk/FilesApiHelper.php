<?php

/**
 * ZohoDesk Files Api
 */

namespace BitApps\Integrations\Actions\ZohoDesk;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;

/**
 * Provide functionality for Upload files
 */
final class FilesApiHelper
{
    private $_defaultHeader;

    private $_apiDomain;

    private $_payloadBoundary;

    private $_basepath;

    /**
     * @param object $tokenDetails Api token details
     * @param int    $formID       ID of the form, for which integration is executing
     * @param int    $entryID      Current submittion ID
     * @param mixed  $orgId
     */
    public function __construct($tokenDetails, $orgId)
    {
        $this->_payloadBoundary = wp_generate_password(24);
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_defaultHeader['orgId'] = $orgId;
        $this->_defaultHeader['content-type'] = 'multipart/form-data; boundary=' . $this->_payloadBoundary;
        $this->_apiDomain = urldecode($tokenDetails->api_domain);
    }

    /**
     * Helps to execute upload files api
     *
     * @param mixed $files        Files path
     * @param bool  $isAttachment Check upload type
     * @param mixed $module       Attachment Module name
     * @param mixed $recordID     Record id
     * @param mixed $ticketId
     * @param mixed $dataCenter
     *
     * @return array $uploadedFiles ID's of uploaded file in Zoho Desk
     */
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
                    $payload .= file_get_contents($safeFile);
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
            $payload .= file_get_contents($safeFiles);
            $payload .= "\r\n";
        }
        if (empty($payload)) {
            return false;
        }
        $payload .= '--' . $this->_payloadBoundary . '--';

        return HttpHelper::post($uploadFileEndpoint, $payload, $this->_defaultHeader);
    }
}
