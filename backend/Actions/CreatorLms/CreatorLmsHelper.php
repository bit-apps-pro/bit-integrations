<?php

namespace BitApps\Integrations\Actions\CreatorLms;

class CreatorLmsHelper
{
    public static function isExists()
    {
        if (!class_exists('CreatorLms') || !\function_exists('crlms_get_course')) {
            wp_send_json_error(
                __(
                    'Creator LMS is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }
}
