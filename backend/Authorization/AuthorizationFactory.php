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

    /**
     * The auth strategy for a saved connection, or null when none can be built.
     *
     * The connection row carries both the auth type and the app slug, so the id alone
     * identifies the handler — which is why callers only ever pass an id around.
     * Building the handler stays free of side effects: it stores the id, and the row,
     * the stored secrets and any OAuth2 refresh are read on first use.
     *
     * Every failure — no id, missing row, wrong app, unknown auth type — collapses to
     * null. To a caller they are one condition ("no usable connection for this app"),
     * and separating them would only leak which connection ids exist.
     *
     * @param int|string  $connectionId
     * @param null|string $appSlug      when set, the connection must belong to this app
     */
    public static function getConnectionHandler($connectionId, ?string $appSlug = null): ?AuthStrategyInterface
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

        if (!self::belongsToApp($storedSlug, $appSlug)) {
            return null;
        }

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

        // $appSlug reaches here from request data (ConnectionController::authorize).
        // class_exists() triggers the PSR-4 autoloader, which maps namespace separators
        // onto the filesystem, so a slug containing a backslash or dot would be resolved
        // as a path. Only a plain class-name segment is ever legitimate.
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

    /**
     * Whether a stored connection was created for the app asking for it.
     *
     * A connection_id arrives as a bare integer, so nothing about it says which app it
     * belongs to: without this check, pointing one integration's action at another's
     * connection_id decrypts that app's token and ships it to this app's endpoint.
     *
     * app_slug is stored as the integration's display name ("Zoho CRM") while callers
     * pass a bare slug ("zohocrm"), so both sides reduce to alphanumerics before
     * comparing. No slug passed means the caller opted out of the check.
     *
     * @param mixed       $storedSlug app_slug from the connection row
     * @param null|string $appSlug    slug the caller requires
     */
    private static function belongsToApp($storedSlug, ?string $appSlug): bool
    {
        if ($appSlug === null || $appSlug === '' || empty($storedSlug)) {
            return true;
        }

        $normalize = static function ($value) {
            return strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $value));
        };

        return $normalize($storedSlug) === $normalize($appSlug);
    }
}
