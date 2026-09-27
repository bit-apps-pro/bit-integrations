<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

final class Canon
{
    private const FLAGS = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR;

    public static function encode(mixed $value): string
    {
        return json_encode($value, self::FLAGS) . "\n";
    }

    public static function same(mixed $a, mixed $b): bool
    {
        return self::encode($a) === self::encode($b);
    }

    /**
     * @return list<string>
     */
    public static function diff(mixed $baseline, mixed $current, string $path = '$', int $limit = 25): array
    {
        $lines = [];
        self::walk(self::plain($baseline), self::plain($current), $path, $lines, $limit);

        if ($lines === [] && !self::same($baseline, $current)) {
            $lines[] = "{$path}: differs only in object/array form ({} vs [])";
        }

        return $lines;
    }

    private static function plain(mixed $value): mixed
    {
        return json_decode(json_encode($value, JSON_THROW_ON_ERROR), true);
    }

    private static function walk(mixed $a, mixed $b, string $path, array &$lines, int $limit): void
    {
        if (\count($lines) >= $limit) {
            return;
        }

        if (\is_array($a) && \is_array($b)) {
            $keys = array_keys($a + $b);
            foreach ($keys as $key) {
                $child = $path . (array_is_list($a) && array_is_list($b) ? "[{$key}]" : '.' . $key);
                if (!\array_key_exists($key, $a)) {
                    $lines[] = "{$child}: added " . self::short($b[$key]);
                } elseif (!\array_key_exists($key, $b)) {
                    $lines[] = "{$child}: removed (was " . self::short($a[$key]) . ')';
                } else {
                    self::walk($a[$key], $b[$key], $child, $lines, $limit);
                }
                if (\count($lines) >= $limit) {
                    $lines[] = '… (more differences)';

                    return;
                }
            }

            if (array_keys($a) !== array_keys($b) && array_diff(array_keys($a), array_keys($b)) === [] && array_diff(array_keys($b), array_keys($a)) === []) {
                $lines[] = "{$path}: key order changed";
            }

            return;
        }

        if ($a !== $b) {
            $lines[] = "{$path}: baseline " . self::short($a) . ' now ' . self::short($b);
        }
    }

    private static function short(mixed $value): string
    {
        $text = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return \strlen($text) > 160 ? substr($text, 0, 157) . '...' : $text;
    }
}
