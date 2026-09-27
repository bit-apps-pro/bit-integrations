<?php

declare(strict_types=1);

namespace BitApps\Restructure\Support;

use RuntimeException;

final class Json
{
    public static function encode(mixed $value): string
    {
        return json_encode(
            self::normalize($value),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
        ) . "\n";
    }

    public static function decodeFile(string $path): array
    {
        $raw = file_get_contents($path);

        if ($raw === false) {
            throw new RuntimeException("Cannot read {$path}");
        }

        $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (!\is_array($data)) {
            throw new RuntimeException("{$path} does not hold a JSON object");
        }

        return $data;
    }

    public static function writeFile(string $path, mixed $value): void
    {
        $dir = \dirname($path);

        if (!is_dir($dir) && !mkdir($dir, 0777, true) && !is_dir($dir)) {
            throw new RuntimeException("Cannot create {$dir}");
        }

        file_put_contents($path, self::encode($value));
    }

    private static function normalize(mixed $value): mixed
    {
        if (!\is_array($value)) {
            return $value;
        }

        if ($value === []) {
            return [];
        }

        $normalized = [];

        foreach ($value as $key => $item) {
            $normalized[$key] = self::normalize($item);
        }

        if (!array_is_list($normalized)) {
            ksort($normalized, SORT_STRING);
        }

        return $normalized;
    }
}
