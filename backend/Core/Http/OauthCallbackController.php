<?php

namespace BitApps\Integrations\Core\Http;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\RewriteRuleProvider;
use WP;

final class OauthCallbackController
{
    public const ROUTE = Config::SLUG . '/oauth-callback';

    public function handle($wp)
    {
        $pagename = isset($wp->query_vars['pagename']) ? $wp->query_vars['pagename'] : '';

        if ($pagename !== self::pagename()) {
            return;
        }

        header('X-Robots-Tag: noindex, nofollow');
        nocache_headers();

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- OAuth providers redirect here without a nonce; see above for why values are not sanitized.
        $params = wp_unslash($_GET);

        $state = isset($params['state']) ? $params['state'] : '';

        unset($params['state'], $params['pagename'], $params['rest_route']);

        self::redirectToState($state, $params);
    }

    public static function pagename()
    {
        return RewriteRuleProvider::pagenameFor(self::ROUTE);
    }

    public static function redirectToState($state, array $params)
    {
        if (!\is_string($state) || $state === '') {
            return false;
        }

        if (self::hostWithPort($state) !== self::hostWithPort(get_site_url())) {
            return false;
        }

        if ($params !== []) {
            $separator = strpos($state, '?') === false ? '?' : '&';
            $state .= $separator . http_build_query($params);
        }

        if (wp_safe_redirect($state, 302)) {
            exit;
        }

        return false;
    }

    public static function hostWithPort($url)
    {
        $parsedUrl = wp_parse_url($url);

        if (!\is_array($parsedUrl) || empty($parsedUrl['host'])) {
            return '';
        }

        return $parsedUrl['host'] . (empty($parsedUrl['port']) ? '' : (':' . $parsedUrl['port']));
    }
}
