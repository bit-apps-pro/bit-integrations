<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke\Wp;

use Closure;
use DateTimeImmutable;
use DateTimeZone;
use Exception;
use stdClass;

final class Scrub
{
    private const SECRET_KEY = '~(token|secret|password|passwd|api_?key|apikey|authorization|client_?id|signature|private_?key|credential|bearer)~i';

    private const WINDOW = 40 * 86400;

    private const BUCKET = 300;

    private const MAX_DEPTH = 8;

    private const EMAIL = '~[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}~';

    /**
     * @var array<int, string>
     */
    private array $aliases = [];

    /**
     * @param array<string, string> $paths absolute prefix => placeholder, longest first
     */
    public function __construct(private int $origin, private array $paths)
    {
        uksort($this->paths, static fn ($a, $b) => \strlen($b) <=> \strlen($a));
    }

    public function alias(int $number, string $label): void
    {
        $this->aliases[$number] = $label;
    }

    public function value(mixed $value, ?string $key = null, int $depth = 0): mixed
    {
        if ($key !== null && $this->isSecret($key, $value)) {
            return '<redacted:' . substr(sha1((string) $value), 0, 12) . '>';
        }

        if (\is_string($value)) {
            return $this->text($value);
        }

        if (\is_int($value) || \is_float($value)) {
            return $this->number($value);
        }

        if ($value === null || \is_bool($value)) {
            return $value;
        }

        if ($depth >= self::MAX_DEPTH) {
            return '<depth>';
        }

        if (\is_array($value)) {
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $this->value($v, (string) $k, $depth + 1);
            }

            return $out;
        }

        if ($value instanceof Closure) {
            return '<closure>';
        }

        if (\is_object($value)) {
            $out = new stdClass();
            if (!$value instanceof stdClass) {
                $out->{'__class'} = self::classLabel(\get_class($value));
            }
            if (is_wp_error($value)) {
                $out->code = $this->value($value->get_error_code(), 'code', $depth + 1);
                $out->messages = $this->value($value->get_error_messages(), 'messages', $depth + 1);
                $out->data = $this->value($value->get_error_data(), 'data', $depth + 1);

                return $out;
            }
            foreach (get_object_vars($value) as $k => $v) {
                $out->{$k} = $this->value($v, (string) $k, $depth + 1);
            }

            return $out;
        }

        return '<' . get_debug_type($value) . '>';
    }

    public function text(string $text): string
    {
        foreach ($this->paths as $prefix => $placeholder) {
            if ($prefix !== '') {
                $text = str_replace($prefix, $placeholder, $text);
            }
        }

        foreach ($this->aliases as $number => $label) {
            if ($number < 100) {
                continue;
            }
            $text = (string) preg_replace('~(?<![\w.])' . $number . '(?![\w.])~', $label, $text);
        }

        $text = (string) preg_replace_callback(
            self::EMAIL,
            static fn (array $m) => str_ends_with(strtolower($m[0]), '@example.com') ? $m[0] : '<email:' . substr(sha1(strtolower($m[0])), 0, 8) . '>',
            $text
        );

        $text = preg_replace_callback(
            '~\b(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?~',
            fn (array $m) => $this->datetime($m[0], $m[1] . ' ' . $m[2], $m[3] ?? ''),
            $text
        );

        $text = preg_replace_callback(
            '~(?<![\d-])(\d{4})-(\d{2})-(\d{2})(?![\d:])~',
            fn (array $m) => $this->date($m[0]),
            $text
        );

        $text = preg_replace_callback(
            '~(?<![\w.])(1\d{9})(\d{3})?(?![\w.])~',
            fn (array $m) => $this->epochText($m[0]),
            $text
        );

        return self::classText($text);
    }

    public function number(int|float $number): int|float|string
    {
        if (\is_int($number)) {
            if (isset($this->aliases[$number])) {
                return $this->aliases[$number];
            }
            if ($this->near($number)) {
                return $this->offsetLabel('ts', $number);
            }
            if ($number > 999999999999 && $this->near(intdiv($number, 1000))) {
                return $this->offsetLabel('ts-ms', intdiv($number, 1000));
            }
        }

        return $number;
    }

    public function message(string $message): string
    {
        $message = preg_replace('~\s+(?:in|called in)\s+\S+?\.php(?::\d+| on line \d+)~', '', $message);
        $message = preg_replace('~ on line \d+~', '', $message);
        $message = preg_replace('~\nStack trace:.*~s', '', $message);

        return $this->text($message);
    }

    public static function classLabel(string $class): string
    {
        if (preg_match('~^BitApps\\\\(Integrations|IntegrationsPro|BTCBI_PRO)\\\\Actions\\\\(\w+)\\\\\w+$~', $class, $m)) {
            return "{$m[1]}\\Actions\\{$m[2]}\\*";
        }

        return $class;
    }

    public static function classText(string $text): string
    {
        return preg_replace_callback(
            '~\\\\?BitApps\\\\(Integrations|IntegrationsPro|BTCBI_PRO)\\\\Actions\\\\(\w+)\\\\\w+~',
            static fn (array $m) => "{$m[1]}\\Actions\\{$m[2]}\\*",
            $text
        );
    }

    public function hash(mixed $value): string
    {
        return substr(sha1(json_encode($this->value($value), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR)), 0, 16);
    }

    private function isSecret(string $key, mixed $value): bool
    {
        if (!\is_scalar($value) || \is_bool($value) || $value === '') {
            return false;
        }

        return (bool) preg_match(self::SECRET_KEY, $key);
    }

    private function datetime(string $raw, string $local, string $zone): string
    {
        $candidates = [];
        foreach (['UTC', wp_timezone_string()] as $tz) {
            try {
                $candidates[] = (new DateTimeImmutable($local . ($zone !== '' ? $zone : ''), new DateTimeZone($tz)))->getTimestamp();
            } catch (Exception $e) {
                continue;
            }
        }

        $best = null;
        foreach ($candidates as $ts) {
            if ($best === null || abs($ts - $this->origin) < abs($best - $this->origin)) {
                $best = $ts;
            }
        }

        return $best !== null && $this->near($best) ? $this->offsetLabel('datetime', $best) : $raw;
    }

    private function date(string $raw): string
    {
        $ts = strtotime($raw . ' 12:00:00 UTC');
        if ($ts === false) {
            return $raw;
        }

        $days = (int) round(($ts - strtotime(gmdate('Y-m-d', $this->origin) . ' 12:00:00 UTC')) / 86400);

        if (abs($days) > 2) {
            return $raw;
        }

        return $days === 0 ? '<date>' : \sprintf('<date%+d>', $days);
    }

    private function epochText(string $raw): string
    {
        $seconds = \strlen($raw) === 13 ? intdiv((int) $raw, 1000) : (int) $raw;

        if (!$this->near($seconds)) {
            return $raw;
        }

        return $this->offsetLabel(\strlen($raw) === 13 ? 'ts-ms' : 'ts', $seconds);
    }

    private function near(int $seconds): bool
    {
        return abs($seconds - $this->origin) <= self::WINDOW;
    }

    private function offsetLabel(string $kind, int $seconds): string
    {
        $offset = (int) (round(($seconds - $this->origin) / self::BUCKET) * self::BUCKET);

        return $offset === 0 ? "<{$kind}>" : \sprintf('<%s%+d>', $kind, $offset);
    }
}
