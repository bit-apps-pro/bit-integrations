<?php

/**
 * ZohoBigin Files Api
 */

namespace BitApps\Integrations\Actions\ZohoBigin;

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

    /**
     * Constructor for File API helper. Sets api token details
     *
     * @param object $tokenDetails Api token details
     */
    public function __construct($tokenDetails)
    {
        $this->_payloadBoundary = wp_generate_password(24);
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_defaultHeader['content-type'] = 'multipart/form; boundary=' . $this->_payloadBoundary;
        $this->_apiDomain = urldecode($tokenDetails->api_domain);
    }

    /**
     * Helps to execute upload files api
     *
     * @param mixed      $files     Files path
     * @param mixed      $recordID  Record id
     * @param string     $zohoField zoho bigin upload fieldname
     * @param mixed      $module
     * @param null|mixed $isPhoto
     *
     * @return array $uploadedFiles ID's of uploaded file in Zoho Bigin
     */
    public function uploadFiles($files, $module, $recordID, $isPhoto = null)
    {
        $uploadFileEndpoint = '';

        if ($isPhoto) {
            $uploadFileEndpoint = "{$this->_apiDomain}/bigin/v1/{$module}/{$recordID}/photo";
        } else {
            $uploadFileEndpoint = "{$this->_apiDomain}/bigin/v1/{$module}/{$recordID}/Attachments";
        }

        $payload = '';
        if (\is_array($files)) {
            foreach ($files as $fileIndex => $fileName) {
                if (($safeFile = Common::safeUploadFilePath($fileName)) !== '') {
                    $payload .= '--' . $this->_payloadBoundary;
                    $payload .= "\r\n";
                    $payload .= 'Content-Disposition: form-data; name="' . 'file'
                        . '"; filename="' . basename("{$fileName}") . '"' . "\r\n";
                    $payload .= "\r\n";
                    $payload .= file_get_contents($safeFile);
                    $payload .= "\r\n";
                }
            }
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
