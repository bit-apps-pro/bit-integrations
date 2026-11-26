<?php

namespace BitApps\Integrations\Actions\SeoPress;

class SeoPressHelper
{
    /**
     * Validate if SEOPress plugin exists or not. If not exists then terminate
     * request and send an error response.
     *
     * @return void
     */
    public static function isExists()
    {
        if (!\defined('SEOPRESS_VERSION')) {
            wp_send_json_error(
                __(
                    'SEOPress is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }
}
