<?php

/**
 * Slack Record Api
 */

namespace BitApps\Integrations\Actions\Slack;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_integrationID;

    private $_apiEndPoint;

    private $_accessToken;

    public function __construct($apiEndPoint, $access_token, $integId)
    {
        $this->_defaultHeader['Content-Type'] = 'multipart/form-data';
        $this->_integrationID = $integId;
        $this->_apiEndPoint = $apiEndPoint;
        $this->_accessToken = $access_token;
    }

    public function sendMessages($data)
    {
        $header = [
            'Authorization' => 'Bearer ' . $this->_accessToken,
            'Accept'        => '*/*',
            'verify'        => false
        ];
        $insertRecordEndpoint = $this->_apiEndPoint . '/chat.postMessage';

        return HttpHelper::post($insertRecordEndpoint, $data, $header);
    }

    public function execute($integrationDetails, $fieldValues)
    {
        $msg = Common::replaceFieldWithValue($integrationDetails->body, $fieldValues);
        $messagesBody = str_replace(['<p>', '</p>'], ' ', $msg);

        if (!empty($integrationDetails->actions->attachments)) {
            foreach ($fieldValues as $fieldKey => $fieldValue) {
                if ($integrationDetails->actions->attachments == $fieldKey) {
                    $file = $fieldValue;
                }
            }

            if (!empty($file)) {
                $data = [
                    'channels'        => $integrationDetails->channel_id,
                    'initial_comment' => $messagesBody,
                    'text'            => $messagesBody,
                    'parse_mode'      => $integrationDetails->parse_mode,
                    'file'            => \is_array($file) ? $file[0] : $file
                ];

                $sendPhotoApiHelper = new FilesApiHelper($this->_accessToken);
                $recordApiResponse = $sendPhotoApiHelper->uploadFiles($this->_apiEndPoint, $data, $this->_accessToken);
            } else {
                $data = [
                    'channel'    => $integrationDetails->channel_id,
                    'text'       => $messagesBody,
                    'parse_mode' => $integrationDetails->parse_mode
                ];
                $recordApiResponse = $this->sendMessages($data);
            }

            $type = 'insert';
        } else {
            $data = [
                'channel'    => $integrationDetails->channel_id,
                'text'       => $messagesBody,
                'parse_mode' => $integrationDetails->parse_mode
            ];
            $recordApiResponse = $this->sendMessages($data);
            $type = 'insert';
        }

        $recordApiResponse = \is_string($recordApiResponse) ? json_decode($recordApiResponse) : $recordApiResponse;

        if ($recordApiResponse && $recordApiResponse->ok) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', $recordApiResponse);
        }

        return $recordApiResponse;
    }
}
