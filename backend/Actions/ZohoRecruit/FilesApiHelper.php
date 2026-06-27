<?php

/**
 * ZohoRecruit Files Api
 */

namespace BitApps\Integrations\Actions\ZohoRecruit;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;

/**
 * Provide functionality for Upload files
 */
final class FilesApiHelper
{
    private $_defaultHeader;

    private $_payloadBoundary;

    private $_module;

    /**
     * @param string $module       zoho recruit module name
     * @param string $dataCenter   DC for API endpoint
     * @param object $tokenDetails Api token details
     */
    public function __construct($module, $dataCenter, $tokenDetails)
    {
        $this->_module = $module;
        $this->_dataCenter = $dataCenter;
        $this->_payloadBoundary = wp_generate_password(24);
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_defaultHeader['content-type'] = 'multipart/form; boundary=' . $this->_payloadBoundary;
    }

    /**
     * Helps to execute upload files api
     *
     * @param mixed  $files     Files path
     * @param mixed  $recordID  Record id
     * @param string $zohoField zoho recruit upload fieldname
     *
     * @return object $uploadedFiles ID's of uploaded file in Zoho Recruit
     */
    public function uploadFiles($files, $recordID, $zohoField)
    {
        $uploadFileEndpoint = '';

        if ($zohoField === 'Candidate Photo') {
            $uploadFileEndpoint = "https://recruit.zoho.{$this->_dataCenter}/recruit/private/xml/{$this->_module}/uploadPhoto?Scope=recruitapi&type={$zohoField}&version=2&id={$recordID}";
        } else {
            $uploadFileEndpoint = "https://recruit.zoho.{$this->_dataCenter}/recruit/private/json/{$this->_module}/uploadFile?Scope=ZohoRecruit.modules.all&type={$zohoField}&version=2&id={$recordID}";
        }

        $payload = '';
        if (\is_array($files)) {
            foreach ($files as $fileIndex => $fileName) {
                if (($safeFile = Common::safeUploadFilePath($fileName)) !== '') {
                    $payload .= '--' . $this->_payloadBoundary;
                    $payload .= "\r\n";
                    $payload .= 'Content-Disposition: form-data; name="' . 'content'
                        . '"; filename="' . basename("{$fileName}") . '"' . "\r\n";
                    $payload .= "\r\n";
                    $payload .= file_get_contents($safeFile);
                    $payload .= "\r\n";
                }
            }
        } elseif (($safeFiles = Common::safeUploadFilePath($files)) !== '') {
            $payload .= '--' . $this->_payloadBoundary;
            $payload .= "\r\n";
            $payload .= 'Content-Disposition: form-data; name="' . 'content'
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
