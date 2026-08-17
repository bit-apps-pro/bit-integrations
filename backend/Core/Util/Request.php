<?php

namespace BitApps\Integrations\Core\Util;

final class Request
{
    public static function Check($type)
    {
        switch ($type) {
            case 'admin':
                return is_admin();

            case 'ajax':
                return \defined('DOING_AJAX');

            case 'cron':
                return \defined('DOING_CRON');

            case 'api':
                return \defined('REST_REQUEST');

            case 'frontend':
                return (! is_admin() || \defined('DOING_AJAX')) && ! \defined('DOING_CRON');
        }
    }

    /**
     * Detects a REST request before `REST_REQUEST` is defined, which core only
     * does once `parse_request` runs.
     *
     * @return bool
     */
    public static function isRest()
    {
        if (\defined('REST_REQUEST')) {
            return true;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only request-type probe, no data is used.
        if (isset($_GET['rest_route'])) {
            return true;
        }

        $requestUri = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '';

        // Not anchored: subdirectory installs serve REST under the site path.
        return strpos($requestUri, '/' . rest_get_url_prefix() . '/') !== false;
    }
}
