<?php

namespace BitApps\Integrations\Actions\Wsms;

class WsmsHelper
{
    public static function isExists()
    {
        if (!\defined('WP_SMS_VERSION')) {
            wp_send_json_error(
                __(
                    'WSMS (WP SMS) is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function refreshGroups()
    {
        self::isExists();

        $groups = [];

        if (class_exists('\WP_SMS\Newsletter')) {
            $allGroups = \WP_SMS\Newsletter::getGroups();

            foreach ($allGroups ?: [] as $group) {
                $groups[] = (object) [
                    'value' => (int) $group->ID,
                    'label' => $group->name,
                ];
            }
        }

        $response['groups'] = $groups;
        wp_send_json_success($response, 200);
    }
}
