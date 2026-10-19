<?php

/**
 * Pointics Integration
 */

namespace BitApps\Integrations\Actions\Pointics;

use Throwable;

class PointicsHelper
{
    public static function isExists()
    {
        if (!\defined('POINTICS_VERSION')) {
            wp_send_json_error(
                __(
                    'Pointics is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshChannels()
    {
        self::isExists();

        $channels = [];
        $service = self::resolve('\Pointics\Channels\Channel_Service');

        if ($service) {
            $result = $service->list(['page' => 1, 'per_page' => 100]);

            foreach ($result['items'] ?? [] as $channel) {
                $channels[] = (object) [
                    'channel_id'   => $channel->id,
                    'channel_name' => $channel->name,
                ];
            }
        }

        $response['channels'] = $channels;
        wp_send_json_success($response, 200);
    }

    private static function resolve($className)
    {
        if (!\function_exists('pointics_container') || !class_exists($className)) {
            return;
        }

        try {
            return pointics_container()->make($className);
        } catch (Throwable $exception) {
            return;
        }
    }
}
