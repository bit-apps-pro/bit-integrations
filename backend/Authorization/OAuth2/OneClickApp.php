<?php

namespace BitApps\Integrations\Authorization\OAuth2;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;

final class OneClickApp
{
    private const BROKER_URL = 'https://auth-apps.bitapps.pro/';

    private const CLIENT_INFO_CACHE_TTL = 12 * HOUR_IN_SECONDS;

    private const HTTP_TIMEOUT = 10;

    private static $secrets = [];

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

    public static function clientSecret(string $app, string $clientId): string
    {
        if ($app === '' || $clientId === '') {
            return '';
        }

        $memoKey = $app . '|' . $clientId;

        if (isset(self::$secrets[$memoKey])) {
            return self::$secrets[$memoKey];
        }

        $response = HttpHelper::post(
            self::brokerUrl() . 'apps/secret',
            wp_json_encode(['client_id' => $clientId, 'platform' => $app]),
            ['Content-Type' => 'application/json'],
            ['timeout' => self::HTTP_TIMEOUT]
        );

        if (is_wp_error($response) || !\is_object($response) || empty($response->clientSecret)) {
            return '';
        }

        self::$secrets[$memoKey] = (string) $response->clientSecret;

        return self::$secrets[$memoKey];
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
