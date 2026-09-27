<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use ReflectionClass;
use ReflectionMethod;
use ReflectionProperty;
use Throwable;

final class ClassFacts
{
    public const ACTION_RESOLVER = 'BitApps\\Integrations\\Core\\Integration\\ActionResolver';

    public static function loadError(string $class): ?string
    {
        try {
            return class_exists($class) ? null : 'class not found';
        } catch (Throwable $e) {
            return \get_class($e) . ': ' . $e->getMessage();
        }
    }

    /**
     * @return array{ctorParams: ?int, ctorRequired: ?int}
     */
    public static function constructor(string $class): array
    {
        $constructor = (new ReflectionClass($class))->getConstructor();

        return [
            'ctorParams'   => $constructor?->getNumberOfParameters(),
            'ctorRequired' => $constructor?->getNumberOfRequiredParameters(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function method(string $class, string $method, string $prefix): array
    {
        $reflection = new ReflectionClass($class);

        if (!$reflection->hasMethod($method)) {
            return [$prefix . 'Exists' => false];
        }

        $reflectionMethod = $reflection->getMethod($method);

        return [
            $prefix . 'Exists'     => true,
            $prefix . 'Static'     => $reflectionMethod->isStatic(),
            $prefix . 'Visibility' => self::visibility($reflectionMethod),
            $prefix . 'Params'     => $reflectionMethod->getNumberOfParameters(),
            $prefix . 'Required'   => $reflectionMethod->getNumberOfRequiredParameters(),
            $prefix . 'Variadic'   => $reflectionMethod->isVariadic(),
        ];
    }

    /**
     * @return array{authConfigOwner: ?string, authConfigHash: ?string}
     */
    public static function authConfig(string $class): array
    {
        try {
            $owner = self::authConfigOwner($class);
        } catch (Throwable $e) {
            return ['authConfigOwner' => null, 'authConfigHash' => 'error: ' . \get_class($e) . ': ' . $e->getMessage()];
        }

        if ($owner === null) {
            return ['authConfigOwner' => null, 'authConfigHash' => null];
        }

        $property = new ReflectionProperty($owner, 'authConfig');

        return [
            'authConfigOwner' => $owner,
            'authConfigHash'  => $property->isStatic() ? Json::hash($property->getValue()) : 'instance property',
        ];
    }

    private static function authConfigOwner(string $class): ?string
    {
        if (class_exists(self::ACTION_RESOLVER)) {
            return \call_user_func([self::ACTION_RESOLVER, 'authConfigOwner'], $class);
        }

        return property_exists($class, 'authConfig') ? $class : null;
    }

    private static function visibility(ReflectionMethod $method): string
    {
        if ($method->isPublic()) {
            return 'public';
        }

        return $method->isProtected() ? 'protected' : 'private';
    }
}
