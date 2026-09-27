<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use LogicException;

final class RouteRecorder
{
    /**
     * @var array<string, true>
     */
    private static array $pending = [];

    /**
     * @var list<array<string, mixed>>
     */
    private static array $registrations = [];

    private static ?string $access = null;

    public function __call(string $name, array $arguments): mixed
    {
        return self::__callStatic($name, $arguments);
    }

    public static function __callStatic(string $name, array $arguments): mixed
    {
        throw new LogicException("Route::{$name}() is not modelled by the contract recorder");
    }

    public static function get($hook, $invokeable): void
    {
        self::record('GET', $hook, $invokeable);
    }

    public static function post($hook, $invokeable): void
    {
        self::record('POST', $hook, $invokeable);
    }

    public static function request($method, $hook, $invokeable): void
    {
        self::record((string) $method, $hook, $invokeable);
    }

    public static function defaultAccess($access): void
    {
        self::$access = (string) $access;
    }

    public static function no_auth(): self
    {
        return self::flag('no_auth');
    }

    public static function ignore_token(): self
    {
        return self::flag('ignore_token');
    }

    public static function no_sanitize(): self
    {
        return self::flag('no_sanitize');
    }

    public static function sanitize_post_content(): self
    {
        return self::flag('sanitize_post_content');
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function drain(): array
    {
        $registrations = self::$registrations;
        self::$registrations = [];
        self::$pending = [];
        self::$access = null;

        return $registrations;
    }

    private static function flag(string $modifier): self
    {
        self::$pending[$modifier] = true;

        return new self();
    }

    private static function record(string $method, $hook, $invokeable): void
    {
        $modifiers = array_keys(self::$pending);
        sort($modifiers, SORT_STRING);
        self::$pending = [];

        self::$registrations[] = [
            'name'       => (string) $hook,
            'method'     => $method,
            'invokeable' => $invokeable,
            'modifiers'  => $modifiers,
            'access'     => self::$access,
        ];
    }
}
