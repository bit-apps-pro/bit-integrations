<?php

/**
 * ZohoCrm Files Api
 */

namespace BitApps\Integrations\Actions\ZohoCRM;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Upload files
 */
final class FilesApiHelper
{
    private $_defaultHeader;

    private $_apiDomain;

    private $_payloadBoundary;

    /**
     * @param object $tokenDetails Api token details
     * @param int    $integId      ID of the flow to execute
     */
    public function __construct($tokenDetails, $integId)
    {
        $this->_integId = $integId;
        $this->_payloadBoundary = wp_generate_password(24);
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_defaultHeader['content-type'] = 'multipart/form; boundary=' . $this->_payloadBoundary;
        $this->_apiDomain = urldecode($tokenDetails->api_domain);
    }

    /**
     * Helps to execute upload files api
     *
     * @param mixed  $files        Files path
     * @param string $uploadType   Type of upload field. CRM has two type of
     *                             upload field: fileupload | imageupload
     * @param bool   $isAttachment Check upload type
     * @param mixed  $module       Attachment Module name
     * @param mixed  $recordID     Record id
     *
     * @return array $uploadedFiles ID's of uploaded file in Zoho CRM
     */
    public function uploadFiles($files, $uploadType, $isAttachment = false, $module = '', $recordID = 0)
    {
        $uploadFileEndpoint = $isAttachment
            ? "{$this->_apiDomain}/crm/v2/{$module}/{$recordID}/Attachments"
            : "{$this->_apiDomain}/crm/v2/files";
        $payload = '';
        if (\is_array($files)) {
            foreach ($files as $fileIndex => $file) {
                $payload .= $this->preparePayload($file);
            }
        } else {
            $payload .= $this->preparePayload($files);
        }
        if (empty($payload)) {
            return false;
        }
        $payload .= '--' . $this->_payloadBoundary . '--';
        $uploadResponse = HttpHelper::post($uploadFileEndpoint, $payload, $this->_defaultHeader);
        if (!$isAttachment) {
            $uploadedFiles = [];
            if (!empty($uploadResponse->data) && \is_array($uploadResponse->data)) {
                foreach ($uploadResponse->data as $singleFileResponse) {
                    if (!empty($singleFileResponse->code) && $singleFileResponse->code === 'SUCCESS') {
                        $uploadedFiles[] = $this->setIdByUploadType($singleFileResponse->details->id, $uploadType);
                    }
                }
            }
            if (isset($uploadResponse->status) && $uploadResponse->status === 'error') {
                LogHandler::save($this->_integId, wp_json_encode(['type' => 'upload', 'type_name' => 'file']), 'error', wp_json_encode($uploadResponse));
            } else {
                LogHandler::save($this->_integId, wp_json_encode(['type' => 'upload', 'type_name' => 'file']), 'success', wp_json_encode($uploadResponse));
            }

            return $uploadedFiles;
        }

        return $uploadResponse;
    }

    /**
     * Prepares payload for file upload
     *
     * @param $file File path
     *
     * @return string
     */
    public function preparePayload($file)
    {
        $payload = '';
        if ((is_readable("{$file}") && !is_dir("{$file}")) || filter_var($file, FILTER_VALIDATE_URL)) {
            $payload .= '--' . $this->_payloadBoundary;
            $payload .= "\r\n";
            $payload .= 'Content-Disposition: form-data; name="' . 'file'
                . '"; filename="' . basename("{$file}") . '"' . "\r\n";
            $payload .= "\r\n";

            if (filter_var($file, FILTER_VALIDATE_URL)) {
                $response = Common::safeRemoteGet($file);
                if (is_wp_error($response)) {
                    return '';
                }
                $payload .= wp_remote_retrieve_body($response);
            } else {
                $safeFilePath = Common::safeUploadFilePath($file);
                if ($safeFilePath === '') {
                    return '';
                }
                $payload .= file_get_contents($safeFilePath);
            }

            $payload .= "\r\n";
        }

        return $payload;
    }

    /**
     * Sets file id by file upload type
     *
     * @param string $id         ID received from Files API
     * @param string $uploadType Type of upload field. CRM has two type of
     *                           upload field: fileupload | imageupload
     *
     * @return object
     */
    public function setIdByUploadType($id, $uploadType)
    {
        if ($uploadType === 'imageupload') {
            return (object) ['Encrypted_Id' => $id];
        }

        return (object) ['file_id' => $id];
    }
}
