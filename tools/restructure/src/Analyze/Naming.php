<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Repo\Workspace;

final class Naming
{
    public static function folderPath(string $folder): string
    {
        return Workspace::ACTIONS_DIR . '/' . $folder;
    }

    public static function namespaceOf(string $folder): string
    {
        return Workspace::ACTIONS_NAMESPACE . '\\' . $folder;
    }

    public static function fqcn(string $folder, string $shortName): string
    {
        return self::namespaceOf($folder) . '\\' . $shortName;
    }

    public static function path(string $folder, string $shortName): string
    {
        return self::folderPath($folder) . '/' . $shortName . '.php';
    }

    public static function controller(string $folder): string
    {
        return $folder . 'Controller';
    }

    public static function action(string $folder): string
    {
        return $folder . 'Action';
    }

    public static function helper(string $folder): string
    {
        return $folder . 'Helper';
    }

    public static function isApiHelper(string $shortName): bool
    {
        return str_ends_with($shortName, 'ApiHelper');
    }

    public static function serviceFor(string $folder, string $apiHelper): string
    {
        if ($apiHelper === 'RecordApiHelper' || $apiHelper === $folder . 'RecordApiHelper') {
            return $folder . 'Service';
        }

        $role = substr($apiHelper, 0, -\strlen('ApiHelper'));

        return str_starts_with($role, $folder) ? $role . 'Service' : $folder . $role . 'Service';
    }

    public static function shortName(string $fqcn): string
    {
        $position = strrpos($fqcn, '\\');

        return $position === false ? $fqcn : substr($fqcn, $position + 1);
    }

    public static function namespaceName(string $fqcn): string
    {
        $position = strrpos($fqcn, '\\');

        return $position === false ? '' : substr($fqcn, 0, $position);
    }

    /**
     * @return array{0: string, 1: string}|null [folder, short class name] for BitApps\Integrations\Actions\<folder>\<class>
     */
    public static function splitActionClass(string $fqcn): ?array
    {
        $fqcn = ltrim($fqcn, '\\');
        $prefix = Workspace::ACTIONS_NAMESPACE . '\\';

        if (strncmp($fqcn, $prefix, \strlen($prefix)) !== 0) {
            return null;
        }

        $segments = explode('\\', substr($fqcn, \strlen($prefix)));

        return \count($segments) === 2 && $segments[0] !== '' && $segments[1] !== '' ? [$segments[0], $segments[1]] : null;
    }
}
