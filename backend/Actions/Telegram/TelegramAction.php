<?php

namespace BitApps\Integrations\Actions\Telegram;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class TelegramAction
{
    public const APIENDPOINT = 'https://api.telegram.org/bot';

    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'telegram',
        'fields'   => [
            'bot_api_key' => 'value',
        ],
    ];

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
        $recordApiHelper = new TelegramService(self::APIENDPOINT . $bot_api_key, $integrationId);
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
