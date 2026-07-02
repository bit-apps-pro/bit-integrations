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

    public static function getAuthorizationHandler($type, $connectionId, $appSlug = '')
    {
        switch ($type) {
            case AuthorizationType::BASIC_AUTH:
                return new BasicAuthorization($connectionId);

            case AuthorizationType::API_KEY:
                return new ApiKeyAuthorization($connectionId);

            case AuthorizationType::BEARER_TOKEN:
                return new BearerTokenAuthorization($connectionId);

            case AuthorizationType::OAUTH2:
                return new OAuth2Authorization($connectionId);

            case AuthorizationType::OAUTH1:
                return new OAuth1Authorization($connectionId);

            case AuthorizationType::CUSTOM:
                $class = self::authorizationClassExists($appSlug);

                if ($class) {
                    return new $class($connectionId);
                }

                throw new Exception(esc_html__('Authorization class not found', 'bit-integrations'));

            default:
                throw new Exception(esc_html__('Invalid authorization type', 'bit-integrations'));
        }
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
