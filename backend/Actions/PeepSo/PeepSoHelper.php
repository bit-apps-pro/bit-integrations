<?php

namespace BitApps\Integrations\Actions\PeepSo;

class PeepSoHelper
{
    public static function isExists()
    {
        if (!class_exists('PeepSo')) {
            wp_send_json_error(
                __(
                    'PeepSo is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }
}
