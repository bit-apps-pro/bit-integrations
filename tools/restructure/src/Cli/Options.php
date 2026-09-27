<?php

declare(strict_types=1);

namespace BitApps\Restructure\Cli;

use InvalidArgumentException;

final class Options
{
    /**
     * @param array<string, string|true> $values
     * @param list<string>               $positional
     */
    private function __construct(private array $values, public readonly array $positional)
    {
    }

    /**
     * @param list<string> $argv
     * @param list<string> $flags  options that take no value
     * @param list<string> $valued options that take a value
     */
    public static function parse(array $argv, array $flags, array $valued): self
    {
        $values = [];
        $positional = [];

        for ($i = 0, $count = \count($argv); $i < $count; $i++) {
            $argument = $argv[$i];

            if (!str_starts_with($argument, '--')) {
                $positional[] = $argument;

                continue;
            }

            $name = substr($argument, 2);
            $value = null;

            if (str_contains($name, '=')) {
                [$name, $value] = explode('=', $name, 2);
            }

            if (\in_array($name, $flags, true)) {
                if ($value !== null) {
                    throw new InvalidArgumentException("--{$name} takes no value");
                }

                $values[$name] = true;

                continue;
            }

            if (!\in_array($name, $valued, true)) {
                throw new InvalidArgumentException("Unknown option --{$name}");
            }

            if ($value === null) {
                if ($i + 1 >= $count) {
                    throw new InvalidArgumentException("--{$name} needs a value");
                }

                $value = $argv[++$i];
            }

            $values[$name] = $value;
        }

        return new self($values, $positional);
    }

    public function has(string $name): bool
    {
        return isset($this->values[$name]);
    }

    public function get(string $name, ?string $default = null): ?string
    {
        $value = $this->values[$name] ?? null;

        return \is_string($value) ? $value : $default;
    }

    public function require(string $name): string
    {
        $value = $this->get($name);

        if ($value === null || $value === '') {
            throw new InvalidArgumentException("--{$name} is required");
        }

        return $value;
    }

    /**
     * @return list<string>
     */
    public function list(string $name): array
    {
        $value = $this->get($name);

        if ($value === null) {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode(',', $value)), static fn (string $item) => $item !== ''));
    }
}
