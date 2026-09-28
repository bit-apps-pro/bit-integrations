<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use ReflectionClass;
use ReflectionMethod;
use ReflectionParameter;
use ReflectionProperty;
use ReflectionType;
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
     * @return array{instantiable: bool, abstract: bool}
     */
    public static function shape(string $class): array
    {
        $reflection = new ReflectionClass($class);

        return ['instantiable' => $reflection->isInstantiable(), 'abstract' => $reflection->isAbstract()];
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
            $prefix . 'Signature'  => array_map([self::class, 'parameter'], $reflectionMethod->getParameters()),
            $prefix . 'Returns'    => self::type($reflectionMethod->getReturnType()),
        ];
    }

    /**
     * CredentialInjector reads `$owner::$authConfig`, so anything but a public static property is fatal at runtime.
     *
     * @return array<string, mixed>
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
        $visibility = $property->isPublic() ? 'public' : ($property->isProtected() ? 'protected' : 'private');

        return [
            'authConfigOwner'      => $owner,
            'authConfigHash'       => $property->isStatic() ? Json::hash($property->getValue()) : 'instance property',
            'authConfigVisibility' => $visibility,
            'authConfigStatic'     => $property->isStatic(),
            'authConfigType'       => self::type($property->getType()),
            'authConfigReadable'   => $visibility === 'public' && $property->isStatic(),
        ];
    }

    /**
     * @return array{type: ?string, byRef: bool, variadic: bool, optional: bool, default: mixed}
     */
    private static function parameter(ReflectionParameter $parameter): array
    {
        $default = null;

        if ($parameter->isDefaultValueAvailable()) {
            try {
                $default = $parameter->isDefaultValueConstant() ? 'const ' . $parameter->getDefaultValueConstantName() : $parameter->getDefaultValue();
            } catch (Throwable $e) {
                $default = 'unavailable';
            }
        }

        return [
            'type'     => self::type($parameter->getType()),
            'byRef'    => $parameter->isPassedByReference(),
            'variadic' => $parameter->isVariadic(),
            'optional' => $parameter->isOptional(),
            'default'  => \is_scalar($default) || $default === null || \is_array($default) ? $default : get_debug_type($default),
        ];
    }

    private static function type(?ReflectionType $type): ?string
    {
        return $type === null ? null : (string) $type;
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
