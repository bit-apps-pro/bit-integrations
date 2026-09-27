<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use RuntimeException;

final class Json
{
    private const FLAGS = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR;

    public static function encode(mixed $data): string
    {
        return json_encode(self::sortMaps($data), self::FLAGS) . "\n";
    }

    public static function hash(mixed $value): string
    {
        $encoded = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);

        return sha1($encoded === false ? serialize($value) : $encoded);
    }

    /**
     * @return array<mixed>
     */
    public static function decodeFile(string $path): array
    {
        $raw = @file_get_contents($path);

        if ($raw === false) {
            throw new RuntimeException("cannot read {$path}");
        }

        $data = json_decode($raw, true);

        if (!\is_array($data)) {
            throw new RuntimeException("{$path} is not a JSON object: " . json_last_error_msg());
        }

        return $data;
    }

    private static function sortMaps(mixed $data): mixed
    {
        if (!\is_array($data)) {
            return $data;
        }

        if (!array_is_list($data)) {
            ksort($data, SORT_STRING);
        }

        return array_map([self::class, 'sortMaps'], $data);
    }
}
