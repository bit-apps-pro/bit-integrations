<?php

namespace BitApps\Integrations\Actions\WPCafe;

class WPCafeHelper
{
    public static function isExists()
    {
        if (!class_exists('WpCafe\Init')) {
            wp_send_json_error(
                __(
                    'WPCafe is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }
}
