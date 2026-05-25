<?php

/**
 * Telegrom Integration
 */

namespace BitApps\Integrations\Actions\Telegram;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Telegram integration
 */
class TelegramController
{
    public const APIENDPOINT = 'https://api.telegram.org/bot';
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'telegram',
        'fields'   => [
            'bot_api_key' => 'value',
        ],
    ];

    private $_integrationID;

    // public function __construct($integrationID=0)
    // {
    //     $this->_integrationID = $integrationID;
    // }

    /**
     * Process ajax request for refresh telegram get Updates
     *
     * @param object $requestsParams Params to get update
     *
     * @return JSON telegram get Updates data
     */
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
            if (empty($list->my_chat_member)) {
                continue;
            }

            $allList[$list->my_chat_member->chat->title] = (object) [
                'id'   => $list->my_chat_member->chat->id,
                'name' => $list->my_chat_member->chat->title,
            ];
        }
        uksort($allList, 'strnatcasecmp');

        wp_send_json_success(['telegramChatLists' => $allList], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integrationId = $integrationData->id;

        $bot_api_key = $integrationDetails->bot_api_key;
        $parse_mode = $integrationDetails->parse_mode;
        $chat_id = $integrationDetails->chat_id;
        $body = $integrationDetails->body;

        if (
            empty($bot_api_key)
            || empty($parse_mode)
            || empty($chat_id)
            || empty($body)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Telegram'));
        }
        $recordApiHelper = new RecordApiHelper(self::APIENDPOINT . $bot_api_key, $integrationId);
        $telegramApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $fieldValues
        );

        if (is_wp_error($telegramApiResponse)) {
            return $telegramApiResponse;
        }

        return $telegramApiResponse;
    }
}
