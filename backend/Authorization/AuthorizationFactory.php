<?php

namespace BitApps\Integrations\Authorization;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\ApiKey\ApiKeyAuthorization;
use BitApps\Integrations\Authorization\Basic\BasicAuthorization;
use BitApps\Integrations\Authorization\Bearer\BearerTokenAuthorization;
use BitApps\Integrations\Authorization\OAuth1\OAuth1Authorization;
use BitApps\Integrations\Authorization\OAuth2\OAuth2Authorization;
use Exception;

class AuthorizationFactory
{
    public const ACTION_NAMESPACE = 'BitApps\\Integrations\\Actions\\';

    /**
     * Maps a built-in AuthorizationType to its handler class. CUSTOM (and any
     * unmapped type) is dispatched via the authorizationClassExists() probe.
     *
     * @var array<string, class-string>
     */
    private static $handlerMap = [
        AuthorizationType::BASIC_AUTH   => BasicAuthorization::class,
        AuthorizationType::API_KEY      => ApiKeyAuthorization::class,
        AuthorizationType::BEARER_TOKEN => BearerTokenAuthorization::class,
        AuthorizationType::OAUTH2       => OAuth2Authorization::class,
        AuthorizationType::OAUTH1       => OAuth1Authorization::class,
    ];

    public static function getAuthorizationHandler($type, $connectionId, $appSlug = '')
    {
        if (isset(self::$handlerMap[$type])) {
            $class = self::$handlerMap[$type];

            return new $class($connectionId);
        }

        if ($type === AuthorizationType::CUSTOM) {
            $class = self::authorizationClassExists($appSlug);

            if ($class) {
                return new $class($connectionId);
            }

            throw new Exception(esc_html__('Authorization class not found', 'bit-integrations'));
        }

        throw new Exception(esc_html__('Invalid authorization type', 'bit-integrations'));
    }

    public static function authorizationClassExists($appSlug)
    {
        $appSlug = ucfirst((string) $appSlug);
        $class = self::ACTION_NAMESPACE . "{$appSlug}\\{$appSlug}Authorization";

        if (class_exists($class)) {
            return $class;
        }

        return false;
    }
}
