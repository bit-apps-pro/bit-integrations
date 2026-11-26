<?php

namespace BitApps\Integrations\Actions\Discord;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class DiscordAction
{
    public const APIENDPOINT = 'https://discord.com/api/v10';

    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'discord',
        'fields'   => [
            'accessToken' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        $integrationId = $integrationData->id;

        $access_token = $integrationDetails->accessToken;
        $parse_mode = $integrationDetails->parse_mode;
        $server_id = $integrationDetails->selectedServer;
        $channel_id = $integrationDetails->selectedChannel;
        $body = $integrationDetails->body;

        if (
            empty($access_token)
            || empty($parse_mode)
            || empty($server_id)
            || empty($channel_id)
            || empty($body)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Discord'));
        }
        $recordApiHelper = new DiscordService(self::APIENDPOINT, $access_token, $integrationId);
        $discordApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $fieldValues
        );

        if (is_wp_error($discordApiResponse)) {
            return $discordApiResponse;
        }

        return $discordApiResponse;
    }
}
