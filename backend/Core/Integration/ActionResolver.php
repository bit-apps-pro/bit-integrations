<?php

namespace BitApps\Integrations\Core\Integration;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;

final class ActionResolver
{
    private const FREE_NAMESPACE = 'BitApps\\Integrations\\Actions\\';

    private const CANDIDATES = [
        [self::FREE_NAMESPACE, 'Action'],
        [self::FREE_NAMESPACE, 'Controller'],
        ['BitApps\\BTCBI_PRO\\Actions\\', 'Controller'],
        ['BitApps\\IntegrationsPro\\Actions\\', 'Controller'],
    ];

    /**
     * @param mixed $name Action folder name
     *
     * @return false|string
     */
    public static function resolve($name)
    {
        if (!\is_string($name) || !preg_match('/^[A-Za-z0-9_]+$/', $name)) {
            return false;
        }

        foreach (self::CANDIDATES as [$namespace, $suffix]) {
            $class = "{$namespace}{$name}\\{$name}{$suffix}";

            if (self::loads($class) && method_exists($class, 'execute')) {
                return $class;
            }
        }

        return false;
    }

    public static function authConfigOwner(string $class): ?string
    {
        if (self::loads($class) && property_exists($class, 'authConfig')) {
            return $class;
        }

        if (strpos($class, self::FREE_NAMESPACE) !== 0) {
            return null;
        }

        $segments = explode('\\', substr($class, \strlen(self::FREE_NAMESPACE)));

        if (\count($segments) !== 2) {
            return null;
        }

        $action = self::FREE_NAMESPACE . "{$segments[0]}\\{$segments[0]}Action";

        return self::loads($action) && property_exists($action, 'authConfig') ? $action : null;
    }

    private static function loads(string $class): bool
    {
        try {
            return class_exists($class);
        } catch (Throwable $e) {
            return false;
        }
    }
}
