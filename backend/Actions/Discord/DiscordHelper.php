<?php

/**
 * discord Integration
 */

namespace BitApps\Integrations\Actions\Discord;

use BitApps\Integrations\Core\Util\HttpHelper;

class DiscordHelper
{
    public const APIENDPOINT = 'https://discord.com/api/v10';

    public static function fetchServers($tokenRequestParams)
    {
        if (
            empty($tokenRequestParams->accessToken)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => 'Bot ' . $tokenRequestParams->accessToken,
        ];
        $apiEndpoint = self::APIENDPOINT . '/users/@me/guilds';

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (\count($apiResponse) > 0) {
            foreach ($apiResponse as $server) {
                $servers[] = [
                    'id'   => (string) $server->id,
                    'name' => $server->name
                ];
            }
            wp_send_json_success($servers, 200);
        } else {
            wp_send_json_error(__('Servers fetching failed', 'bit-integrations'), 400);
        }
    }

    public static function fetchChannels($tokenRequestParams)
    {
        if (
            empty($tokenRequestParams->accessToken) || empty($tokenRequestParams->serverId)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => 'Bot ' . $tokenRequestParams->accessToken,
        ];
        $apiEndpoint = self::APIENDPOINT . '/guilds/' . $tokenRequestParams->serverId . '/channels';

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (\count($apiResponse) > 0) {
            foreach ($apiResponse as $channel) {
                $channels[] = [
                    'id'   => (string) $channel->id,
                    'name' => $channel->name
                ];
            }
            wp_send_json_success($channels, 200);
        } else {
            wp_send_json_error(__('Channels fetching failed', 'bit-integrations'), 400);
        }
    }
}
