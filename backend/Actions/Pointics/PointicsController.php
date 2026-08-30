<?php

/**
 * Pointics Integration
 */

namespace BitApps\Integrations\Actions\Pointics;

use Throwable;
use WP_Error;

class PointicsController
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

    public function refreshRewards()
    {
        self::isExists();

        $rewards = [];
        $service = self::resolve('\Pointics\Rewards\Reward_Service');

        if ($service) {
            $result = $service->list(['page' => 1, 'per_page' => 100]);

            foreach ($result['items'] ?? [] as $reward) {
                $rewards[] = (object) [
                    'reward_id'   => $reward->id,
                    'reward_name' => $reward->name,
                ];
            }
        }

        $response['rewards'] = $rewards;
        wp_send_json_success($response, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integDetails->field_map;
        $utilities = $integDetails->utilities ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
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
