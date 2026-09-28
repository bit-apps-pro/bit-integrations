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
     * One name for a class before and after the move: Actions\<N>\<N>Controller, <N>Action and <N>Helper
     * become Actions\<N>\{main}; RecordApiHelper and <N>Service become {service}; <Role>ApiHelper and
     * <N><Role>Service become {service:<Role>}. Other names are returned unchanged.
     */
    public static function canonical(string $class): string
    {
        if (!preg_match('/^((?:.*\\\\)?Actions\\\\([A-Za-z0-9_]+))\\\\([A-Za-z0-9_]+)$/', ltrim($class, '\\'), $match)) {
            return $class;
        }

        [, $namespace, $integration, $short] = $match;

        if (\in_array($short, [$integration . 'Controller', $integration . 'Action', $integration . 'Helper'], true)) {
            return $namespace . '\\{main}';
        }

        if (\in_array($short, ['RecordApiHelper', $integration . 'RecordApiHelper', $integration . 'Service'], true)) {
            return $namespace . '\\{service}';
        }

        $role = null;

        if (str_ends_with($short, 'ApiHelper')) {
            $role = substr($short, 0, -\strlen('ApiHelper'));
        } elseif (str_ends_with($short, 'Service') && str_starts_with($short, $integration)) {
            $role = substr($short, \strlen($integration), -\strlen('Service'));
        }

        if ($role === null || $role === '') {
            return $class;
        }

        $role = str_starts_with($role, $integration) ? substr($role, \strlen($integration)) : $role;

        return $namespace . '\\{service:' . $role . '}';
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
