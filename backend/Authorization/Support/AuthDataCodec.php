<?php

namespace BitApps\Integrations\Authorization\Support;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Hash;

/**
 * Shared encode/decode/normalize helpers for the connection authorization layer.
 * Single source for nested-path access, encrypt-key handling, and SSL verify coercion.
 */
class AuthDataCodec
{
    public static function normalizeSslVerify($value): ?bool
    {
        if (\is_bool($value)) {
            return $value;
        }

        if (\is_int($value)) {
            return $value !== 0;
        }

        if (\is_string($value)) {
            $normalized = strtolower(trim($value));

            if (\in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
                return true;
            }

            if (\in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
                return false;
            }
        }

        return null;
    }

    public static function parseEncryptKeys($value): array
    {
        if (\is_array($value)) {
            $keys = array_filter(array_map('strval', $value), static function ($v) {
                return $v !== '';
            });
        } elseif (\is_string($value) && $value !== '') {
            $keys = array_filter(array_map('trim', explode(',', $value)));
        } else {
            return [];
        }

        return array_values(array_unique($keys));
    }

    public static function getNested(array $data, string $path)
    {
        if ($path === '') {
            return;
        }

        $cursor = $data;

        foreach (explode('.', $path) as $segment) {
            if (!\is_array($cursor) || !\array_key_exists($segment, $cursor)) {
                return;
            }

            $cursor = $cursor[$segment];
        }

        return $cursor;
    }

    public static function setNested(array &$data, string $path, $value): void
    {
        if ($path === '') {
            return;
        }

        $segments = explode('.', $path);
        $last = array_pop($segments);
        $cursor = &$data;

        foreach ($segments as $segment) {
            if (!isset($cursor[$segment]) || !\is_array($cursor[$segment])) {
                $cursor[$segment] = [];
            }

            $cursor = &$cursor[$segment];
        }

        $cursor[$last] = $value;
    }

    public static function encryptValues(array $data, array $keys): array
    {
        return self::transformValues($data, $keys, [Hash::class, 'encrypt']);
    }

    public static function decryptValues(array $data, array $keys): array
    {
        return self::transformValues($data, $keys, [Hash::class, 'decrypt']);
    }

    public static function toArray($value): array
    {
        if (\is_array($value)) {
            return $value;
        }

        if (\is_object($value)) {
            return (array) $value;
        }

        return [];
    }

    private static function transformValues(array $data, array $keys, callable $fn): array
    {
        foreach ($keys as $path) {
            $value = self::getNested($data, $path);

            if (!\is_string($value) || $value === '') {
                continue;
            }

            self::setNested($data, $path, $fn($value));
        }

        return $data;
    }
}
