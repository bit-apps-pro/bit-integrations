<?php

namespace BitApps\Integrations\Actions\Telegram;

use BitApps\Integrations\Core\Util\HttpHelper;

class TelegramHelper
{
    public const APIENDPOINT = 'https://api.telegram.org/bot';

    private $_integrationID;

    public static function refreshGetUpdates($requestsParams)
    {
        if (empty($requestsParams->bot_api_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoint = self::APIENDPOINT . $requestsParams->bot_api_key . '/getUpdates';
        $authorizationHeader['Accept'] = 'application/json';
        $telegramResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        if (is_wp_error($telegramResponse) || empty($telegramResponse->ok)) {
            wp_send_json_error($telegramResponse->description, 400);
        }

        $allList = [];
        foreach ($telegramResponse->result as $list) {
            if (isset($list->my_chat_member)) {
                $allList[$list->my_chat_member->chat->title] = (object) [
                    'id'   => $list->my_chat_member->chat->id,
                    'name' => $list->my_chat_member->chat->title,
                ];
            } elseif (isset($list->channel_post)) {
                $allList[$list->channel_post->chat->title] = (object) [
                    'id'   => $list->channel_post->chat->id,
                    'name' => $list->channel_post->chat->title,
                ];
            }
        }

        uksort($allList, 'strnatcasecmp');

        wp_send_json_success(['telegramChatLists' => $allList], 200);
    }
}
