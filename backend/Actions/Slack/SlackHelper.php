<?php

/**
 * slack Integration
 */

namespace BitApps\Integrations\Actions\Slack;

use BitApps\Integrations\Core\Util\HttpHelper;

class SlackHelper
{
    public const APIENDPOINT = 'https://slack.com/api';

    /**
     * Process ajax request for generate_token
     *
     * @param object $requestsParams     Params to authorize
     * @param mixed  $tokenRequestParams
     *
     * @return JSON slack api response and status
     */
    public static function fetchChannels($tokenRequestParams)
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
            'Authorization' => 'Bearer ' . $tokenRequestParams->accessToken,
            'Accept'        => '*/*',
            'verify'        => false
        ];
        $apiEndpoint = self::APIENDPOINT . '/conversations.list';

        $apiResponse = HttpHelper::post($apiEndpoint, null, $header);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            wp_send_json_error(
                empty($apiResponse->error) ? 'Unknown' : $apiResponse->error,
                400
            );
        }

        $channels = [];
        if (!empty($apiResponse->channels) && \is_array($apiResponse->channels)) {
            foreach ($apiResponse->channels as $channel) {
                if (!empty($channel->id) && !empty($channel->name)) {
                    $channels[] = [
                        'id'   => $channel->id,
                        'name' => $channel->name,
                    ];
                }
            }
        }

        wp_send_json_success(['channels' => $channels], 200);
    }
}
