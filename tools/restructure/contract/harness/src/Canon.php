<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

final class Canon
{
    private const FLAGS = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR;

    private const TIME = '~<(ts-ms|ts|datetime|date)([+-]\d+)?@([^>]+)>~';

    private const RELATIVE_TOLERANCE = 600;

    public static function encode(mixed $value): string
    {
        return json_encode($value, self::FLAGS) . "\n";
    }

    public static function same(mixed $a, mixed $b): bool
    {
        return self::encode($a) === self::encode($b) || self::diff($a, $b) === [];
    }

    /**
     * @return list<string>
     */
    public static function diff(mixed $baseline, mixed $current, string $path = '$', int $limit = 25): array
    {
        $lines = [];
        self::walk(self::plain($baseline), self::plain($current), $path, $lines, $limit);

        if ($lines === [] && self::encode(self::stripTimes(self::plain($baseline))) !== self::encode(self::stripTimes(self::plain($current)))) {
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

        if ($a !== $b && !(\is_string($a) && \is_string($b) && self::timeEquivalent($a, $b))) {
            $lines[] = "{$path}: baseline " . self::short($a) . ' now ' . self::short($b);
        }
    }

    /**
     * Two time tokens match when they name the same absolute time (a stored value) or the same
     * offset from the run's own clock (a value the code computed from "now").
     */
    private static function timeEquivalent(string $a, string $b): bool
    {
        if (preg_split(self::TIME, $a) !== preg_split(self::TIME, $b)) {
            return false;
        }

        preg_match_all(self::TIME, $a, $left, PREG_SET_ORDER);
        preg_match_all(self::TIME, $b, $right, PREG_SET_ORDER);

        if ($left === [] || \count($left) !== \count($right)) {
            return false;
        }

        foreach ($left as $i => $token) {
            $other = $right[$i];

            if ($token[1] !== $other[1]) {
                return false;
            }

            if ($token[3] === $other[3]) {
                continue;
            }

            $tolerance = $token[1] === 'date' ? 0 : self::RELATIVE_TOLERANCE;

            if (abs((int) ($token[2] ?? 0) - (int) ($other[2] ?? 0)) > $tolerance) {
                return false;
            }
        }

        return true;
    }

    private static function stripTimes(mixed $value): mixed
    {
        if (\is_string($value)) {
            return preg_replace(self::TIME, '<$1>', $value);
        }

        if (\is_array($value)) {
            return array_map([self::class, 'stripTimes'], $value);
        }

        return $value;
    }

    private static function short(mixed $value): string
    {
        $text = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return \strlen($text) > 160 ? substr($text, 0, 157) . '...' : $text;
    }
}
