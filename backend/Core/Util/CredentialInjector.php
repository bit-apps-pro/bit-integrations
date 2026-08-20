<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthorizationFactory;
use stdClass;
use Throwable;

class CredentialInjector
{
    public static function inject(object $target, string $controllerClass): void
    {
        $connectionId = (int) ($target->connection_id ?? 0);

        if ($connectionId <= 0) {
            return;
        }

        if (!property_exists($controllerClass, 'authConfig')) {
            return;
        }

        $config = $controllerClass::$authConfig;

        try {
            $handler = AuthorizationFactory::getAuthorizationHandler(
                $config['authType'],
                $connectionId,
                $config['slug']
            );

            if (!self::belongsToIntegration($handler->getConnection(), $config)) {
                self::debug($controllerClass, "connection {$connectionId} belongs to a different app");

                return;
            }

            $authDetails = $handler->getAuthDetails();
        } catch (Throwable $e) {
            self::debug($controllerClass, $e->getMessage());

            return;
        }

        if (!\is_array($authDetails) || $authDetails === []) {
            $reason = method_exists($handler, 'getLastError') ? $handler->getLastError() : null;
            self::debug($controllerClass, $reason['message'] ?? 'no auth details resolved');

            return;
        }

        foreach ($config['fields'] as $oldField => $authKey) {
            if ($oldField === '__object') {
                [$targetProp, $keys] = $authKey;
                $obj = new stdClass();
                foreach ($keys as $key) {
                    if ($key === 'generates_on' && empty($authDetails[$key]) && !empty($authDetails['generated_at'])) {
                        $obj->{$key} = (int) $authDetails['generated_at'];

                        continue;
                    }

                    if ($key === 'generated_at' && empty($authDetails[$key]) && !empty($authDetails['generates_on'])) {
                        $obj->{$key} = (int) $authDetails['generates_on'];

                        continue;
                    }

                    $obj->{$key} = $authDetails[$key] ?? '';
                }
                $target->{$targetProp} = $obj;
            } else {
                $target->{$oldField} = $authDetails[$authKey] ?? '';
            }
        }
    }

    private static function belongsToIntegration($connection, array $config): bool
    {
        if (empty($connection) || empty($connection->app_slug)) {
            return true;
        }

        $normalize = static function ($value) {
            return strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $value));
        };

        $accepted = array_map($normalize, array_merge([$config['slug']], $config['aliases'] ?? []));

        return \in_array($normalize($connection->app_slug), $accepted, true);
    }

    private static function debug(string $controllerClass, string $reason): void
    {
        if (!\defined('WP_DEBUG') || !WP_DEBUG) {
            return;
        }

        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Diagnostic, not leftover debug code: this path swallows every credential-resolution failure to keep the flow from fataling, which otherwise reports a broken connection as a missing parameter. Gated on WP_DEBUG and logs only the controller and the reason — never auth details.
        error_log(\sprintf('CredentialInjector: skipped injection for %s — %s', $controllerClass, $reason));
    }
}
