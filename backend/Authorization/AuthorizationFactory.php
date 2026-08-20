<?php

namespace BitApps\Integrations\Authorization;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\ApiKey\ApiKeyAuthorization;
use BitApps\Integrations\Authorization\Basic\BasicAuthorization;
use BitApps\Integrations\Authorization\Bearer\BearerTokenAuthorization;
use BitApps\Integrations\Authorization\Contract\AuthStrategyInterface;
use BitApps\Integrations\Authorization\OAuth1\OAuth1Authorization;
use BitApps\Integrations\Authorization\OAuth2\OAuth2Authorization;
use BitApps\Integrations\Core\Database\ConnectionModel;
use Exception;
use Throwable;

class AuthorizationFactory
{
    public const ACTION_NAMESPACE = 'BitApps\\Integrations\\Actions\\';

    private static $handlerMap = [
        AuthorizationType::BASIC_AUTH   => BasicAuthorization::class,
        AuthorizationType::API_KEY      => ApiKeyAuthorization::class,
        AuthorizationType::BEARER_TOKEN => BearerTokenAuthorization::class,
        AuthorizationType::OAUTH2       => OAuth2Authorization::class,
        AuthorizationType::OAUTH1       => OAuth1Authorization::class,
    ];

    public static function getConnectionHandler($connectionId): ?AuthStrategyInterface
    {
        $connectionId = (int) $connectionId;

        if ($connectionId <= 0) {
            return null;
        }

        $result = (new ConnectionModel())->get(
            ['id', 'app_slug', 'auth_type'],
            ['id' => $connectionId],
            1
        );

        if (is_wp_error($result) || empty($result[0])) {
            return null;
        }

        $connection = $result[0];

        if (empty($connection->auth_type)) {
            return null;
        }

        $storedSlug = $connection->app_slug ?? '';

        try {
            return self::getAuthorizationHandler($connection->auth_type, $connectionId, $storedSlug);
        } catch (Throwable $e) {
            return null;
        }
    }

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
        $appSlug = (string) $appSlug;

        if (!preg_match('/^[A-Za-z0-9_]+$/', $appSlug)) {
            return false;
        }

        $appSlug = ucfirst($appSlug);
        $class = self::ACTION_NAMESPACE . "{$appSlug}\\{$appSlug}Authorization";

        if (class_exists($class)) {
            return $class;
        }

        return false;
    }
}
