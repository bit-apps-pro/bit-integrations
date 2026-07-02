<?php

/**
 * discord Integration
 */

namespace BitApps\Integrations\Actions\Discord;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for discord integration
 */
class DiscordController
{
    public const APIENDPOINT = 'https://discord.com/api/v10';

    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'discord',
        'fields'   => [
            'accessToken' => 'value',
        ],
    ];

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
        $recordApiHelper = new RecordApiHelper(self::APIENDPOINT, $access_token, $integrationId);
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
