<?php

namespace BitApps\Integrations\Authorization\OAuth2;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

final class OneClickApp
{
    private const BROKER_URL = 'https://auth-apps.bitapps.pro/';

    private const CLIENT_INFO_CACHE_TTL = 12 * HOUR_IN_SECONDS;

    private const HTTP_TIMEOUT = 10;

    public static function brokerUrl(): string
    {
        $url = (string) Hooks::apply(Config::withPrefix('one_click_broker_url'), self::BROKER_URL);

        return Common::isPublicHttpsUrl($url) ? trailingslashit($url) : self::BROKER_URL;
    }

    public static function redirectUri(): string
    {
        return self::brokerUrl() . 'redirect/v2';
    }

    public static function clientId(string $app): string
    {
        return self::clientInfo($app)['id'] ?? '';
    }

    public static function setting(string $app, string $key): string
    {
        return self::clientInfo($app)['settings'][$key] ?? '';
    }

    public static function requestToken(string $app, array $params, int $timeout = self::HTTP_TIMEOUT)
    {
        if (!preg_match('/^[A-Za-z0-9_-]+$/', $app)) {
            return new WP_Error(Config::withPrefix('one_click_unknown_app'), __('Unknown one-click app', 'bit-integrations'));
        }

        $response = HttpHelper::post(
            self::brokerUrl() . 'apps/' . $app . '/token',
            wp_json_encode($params),
            ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            ['timeout' => $timeout]
        );

        if (is_wp_error($response) || !\is_object($response)) {
            return new WP_Error(Config::withPrefix('one_click_broker_unreachable'), __('Could not reach the Bit Apps authorization server. Please try again.', 'bit-integrations'));
        }

        return $response;
    }

    private static function clientInfo(string $app): array
    {
        if ($app === '') {
            return [];
        }

        $cacheKey = Config::withPrefix('one_click_apps_' . md5(self::brokerUrl()));
        $clientInfo = get_transient($cacheKey);

        if (!\is_array($clientInfo) || empty($clientInfo[$app]['id'])) {
            $clientInfo = self::fetchClientInfo();

            if (empty($clientInfo)) {
                return [];
            }

            set_transient($cacheKey, $clientInfo, self::CLIENT_INFO_CACHE_TTL);
        }

        return $clientInfo[$app] ?? [];
    }

    private static function fetchClientInfo(): array
    {
        $response = HttpHelper::get(self::brokerUrl() . 'apps/all', null, null, ['timeout' => self::HTTP_TIMEOUT]);

        if (is_wp_error($response) || !\is_object($response) || empty($response->clientInfo)) {
            return [];
        }

        $clientInfo = [];

        foreach ((array) $response->clientInfo as $app => $info) {
            if (\is_object($info) && !empty($info->id) && !empty($info->status)) {
                $clientInfo[$app] = [
                    'id'       => (string) $info->id,
                    'settings' => self::publicSettings($info),
                ];
            }
        }

        return $clientInfo;
    }

    private static function publicSettings(object $info): array
    {
        $settings = [];

        foreach (get_object_vars($info) as $key => $value) {
            if (\is_scalar($value) && !\in_array($key, ['id', 'status', 'clientSecret', 'secret'], true)) {
                $settings[$key] = (string) $value;
            }
        }

        return $settings;
    }
}
