<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use InvalidArgumentException;

final class Options
{
    private const VALUED = ['wp', 'only', 'batch', 'record', 'compare', 'pro', 'free', 'pro-dir', 'php', 'wp-cli', 'timeout', 'flow', 'results'];

    private const FLAGS = ['force-expiry', 'keep-tmp', 'verbose', 'connections', 'help', 'no-fingerprint'];

    /**
     * @var array<string, string|true>
     */
    private array $values = [];

    /**
     * @param list<string> $argv
     */
    public function __construct(array $argv)
    {
        $args = \array_slice($argv, 1);

        for ($i = 0; $i < \count($args); $i++) {
            $arg = $args[$i];

            if (!str_starts_with($arg, '--')) {
                throw new InvalidArgumentException("unexpected argument '{$arg}'");
            }

            [$name, $value] = array_pad(explode('=', substr($arg, 2), 2), 2, null);

            if (\in_array($name, self::FLAGS, true)) {
                if ($value !== null) {
                    throw new InvalidArgumentException("--{$name} takes no value");
                }
                $this->values[$name] = true;

                continue;
            }

            if (!\in_array($name, self::VALUED, true)) {
                throw new InvalidArgumentException("unknown option --{$name}");
            }

            if ($value === null) {
                $value = $args[++$i] ?? null;
                if ($value === null || str_starts_with($value, '--')) {
                    throw new InvalidArgumentException("--{$name} needs a value");
                }
            }

            $this->values[$name] = $value;
        }

        if (isset($this->values['record'], $this->values['compare'])) {
            throw new InvalidArgumentException('--record and --compare are exclusive');
        }
    }

    public function get(string $name, ?string $default = null): ?string
    {
        $value = $this->values[$name] ?? $default;

        return $value === true ? '1' : $value;
    }

    public function flag(string $name): bool
    {
        return ($this->values[$name] ?? false) === true;
    }

    /**
     * @return list<string>
     */
    public function list(string $name, string $default = ''): array
    {
        $raw = (string) $this->get($name, $default);

        return array_values(array_filter(array_map('trim', explode(',', $raw)), static fn ($v) => $v !== ''));
    }
}
