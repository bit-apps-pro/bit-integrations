<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use InvalidArgumentException;

final class ClassRenames
{
    /**
     * @param list<array{0: string, 1: string}> $pairs
     */
    public function __construct(private array $pairs)
    {
    }

    public static function fromOption(string $option): self
    {
        $pairs = [];

        foreach (array_filter(array_map('trim', explode(',', $option)), 'strlen') as $pair) {
            if (!preg_match('/^([A-Za-z0-9_]+):([A-Za-z0-9_]+)$/', $pair, $match)) {
                throw new InvalidArgumentException("--allow expects From:To suffix pairs, got '{$pair}'");
            }

            $pairs[] = [$match[1], $match[2]];
        }

        return new self($pairs);
    }

    /**
     * The short names must be <P>From and <Q>To in the same namespace, where Q is P, or the
     * namespace's last segment followed by P (RecordApiHelper -> <N>Service, FilesApiHelper -> <N>FilesService).
     */
    public function allows(string $base, string $head): bool
    {
        if ($base === $head) {
            return true;
        }

        [$baseNamespace, $baseShort] = self::split($base);
        [$headNamespace, $headShort] = self::split($head);

        if ($baseNamespace === '' || $baseNamespace !== $headNamespace) {
            return false;
        }

        $integration = substr((string) strrchr('\\' . $baseNamespace, '\\'), 1);

        foreach ($this->pairs as [$from, $to]) {
            if (!str_ends_with($baseShort, $from) || !str_ends_with($headShort, $to)) {
                continue;
            }

            $basePrefix = substr($baseShort, 0, -\strlen($from));
            $headPrefix = substr($headShort, 0, -\strlen($to));

            if ($headPrefix === $basePrefix) {
                return true;
            }

            if (!str_starts_with($basePrefix, $integration) && $headPrefix === $integration . $basePrefix) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array{0: string, 1: string}
     */
    private static function split(string $class): array
    {
        $class = ltrim($class, '\\');
        $position = strrpos($class, '\\');

        return $position === false ? ['', $class] : [substr($class, 0, $position), substr($class, $position + 1)];
    }
}
