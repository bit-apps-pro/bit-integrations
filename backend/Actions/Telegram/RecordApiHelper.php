<?php

/**
 * Telegram Record Api
 */

namespace BitApps\Integrations\Actions\Telegram;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_integrationID;

    private $_apiEndPoint;

    public function __construct($apiEndPoint, $integId)
    {
        $this->_defaultHeader['Content-Type'] = 'multipart/form-data';
        $this->_integrationID = $integId;
        $this->_apiEndPoint = $apiEndPoint;
    }

    public function sendMessages($data)
    {
        $insertRecordEndpoint = $this->_apiEndPoint . '/sendMessage';

        return HttpHelper::get($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function execute($integrationDetails, $fieldValues)
    {
        $msg = Common::replaceFieldWithValue($integrationDetails->body, $fieldValues);
        $messagesBody = wp_strip_all_tags(static::htmlToMarkdown($msg));

        if (!empty($integrationDetails->actions->attachments)) {
            foreach ($fieldValues as $fieldKey => $fieldValue) {
                if ($integrationDetails->actions->attachments == $fieldKey) {
                    $file = $fieldValue;
                }
            }

            $file = self::getFiles($file);
            if (!empty($file) && \is_array($file) && \count($file) > 1) {
                $data = [
                    'chat_id' => $integrationDetails->chat_id,
                    'caption' => $messagesBody,
                    'media'   => $file
                ];

                $sendPhotoApiHelper = new FilesApiHelper();
                $recordApiResponse = $sendPhotoApiHelper->uploadMultipleFiles($this->_apiEndPoint, $data);
                $recordApiResponse = \is_string($recordApiResponse) ? json_decode($recordApiResponse) : $recordApiResponse;

                if ($recordApiResponse && $recordApiResponse->ok) {
                    $data = [
                        'chat_id'    => $integrationDetails->chat_id,
                        'text'       => $messagesBody,
                        'parse_mode' => $integrationDetails->parse_mode
                    ];
                    $recordApiResponse = $this->sendMessages($data);
                }
            } elseif (!empty($file)) {
                $data = [
                    'chat_id'    => $integrationDetails->chat_id,
                    'caption'    => $messagesBody,
                    'parse_mode' => $integrationDetails->parse_mode,
                    'photo'      => \is_array($file) ? $file[0] : $file
                ];

                $sendPhotoApiHelper = new FilesApiHelper();
                $recordApiResponse = $sendPhotoApiHelper->uploadFiles($this->_apiEndPoint, $data);
            } else {
                $data = [
                    'chat_id'    => $integrationDetails->chat_id,
                    'text'       => $messagesBody,
                    'parse_mode' => $integrationDetails->parse_mode
                ];
                $recordApiResponse = $this->sendMessages($data);
            }

            $type = 'insert';
        } else {
            $data = [
                'chat_id'    => $integrationDetails->chat_id,
                'text'       => $messagesBody,
                'parse_mode' => 'Markdown',
            ];

            $recordApiResponse = $this->sendMessages($data);
            $type = 'insert';
        }
        $recordApiResponse = \is_string($recordApiResponse) ? json_decode($recordApiResponse) : $recordApiResponse;

        if (!empty($recordApiResponse) && isset($recordApiResponse->ok) && $recordApiResponse->ok == true) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', $recordApiResponse);
        }

        return $recordApiResponse;
    }

    private static function htmlToMarkdown($html)
    {
        // Regular expressions for matching HTML elements and attributes
        $patterns = [
            '/<b>(.*?)<\/b>/s'                                                    => '*$1*',
            '/<strong>(.*?)<\/strong>/s'                                          => '*$1*',
            '/<i>(.*?)<\/i>/s'                                                    => '_$1_',
            '/<ul>(.*?)<\/ul>/s'                                                  => "\n $1\n",
            '/<ol>(.*?)<\/ol>/s'                                                  => "\n $1\n",
            '/<li>(.*?)<\/li>/s'                                                  => "• $1\n",
            '/<a title="(.*)" href="(.*?)" target="(.*)" rel="(.*)">(.*?)<\/a>/s' => '[$1]($2)',
            '/<a(.*)href="(.*?)"(.*)>(.*?)<\/a>/s'                                => '[$1]($2)',
            '/<img(.*)src="(.*?)"(.*)alt="(.*?)"(.*)>/s'                          => '$2',
            '/<code>(.*?)<\/code>/s'                                              => "```\n$1\n```",
            '/<pre>(.*?)<\/pre>/s'                                                => "```\n$1\n```",
            '/<h1>(.*?)<\/h1>/s'                                                  => "$1\n",
            '/<h2>(.*?)<\/h2>/s'                                                  => "$1\n",
            '/<h3>(.*?)<\/h3>/s'                                                  => "$1\n",
            '/<h4>(.*?)<\/h4>/s'                                                  => "$1\n",
            '/<h5>(.*?)<\/h5>/s'                                                  => "$1\n",
            '/<h6>(.*?)<\/h6>/s'                                                  => "$1\n",
            '/<p>(.*?)<\/p>/s'                                                    => "$1\n",
            '/<br>(.*?)<\/br>/s'                                                  => "\n",
            '/<del>(.*?)<\/del>/s'                                                => '~$1~',
            '/<s>(.*?)<\/s>/s'                                                    => '~$1~',
        ];

        // Replace HTML elements with their Markdown equivalents
        $markdown = preg_replace(array_keys($patterns), array_values($patterns), $html);

        return str_replace(['**', '\*', '\_', '\|', '\~'], ['*', '*', '_', '|', '~'], $markdown);
    }

    private static function getFiles($files)
    {
        $allFiles = [];
        if (\is_array($files)) {
            foreach ($files as $file) {
                if (\is_array($file)) {
                    $allFiles = self::getFiles($file);
                } else {
                    $allFiles[] = $file;
                }
            }
        } else {
            return $files;
        }

        return $allFiles;
    }
}
