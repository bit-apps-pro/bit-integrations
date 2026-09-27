<?php

declare(strict_types=1);

namespace BitApps\Restructure\Support;

use RuntimeException;

final class Git
{
    public function __construct(private readonly string $root)
    {
    }

    public function isRepository(): bool
    {
        [$code] = Shell::run(['git', 'rev-parse', '--git-dir'], $this->root);

        return $code === 0;
    }

    public function trackedTreeIsClean(): bool
    {
        [$unstaged] = Shell::run(['git', 'diff', '--quiet'], $this->root);
        [$staged] = Shell::run(['git', 'diff', '--cached', '--quiet'], $this->root);

        return $unstaged === 0 && $staged === 0;
    }

    public function move(string $from, string $to): void
    {
        Shell::mustRun(['git', 'mv', '--', $from, $to], $this->root);
    }

    /**
     * @param list<string> $paths
     */
    public function add(array $paths): void
    {
        if ($paths === []) {
            return;
        }

        Shell::mustRun(array_merge(['git', 'add', '-A', '--'], $paths), $this->root);
    }

    /**
     * @param list<string> $paths
     */
    public function commit(string $message, array $paths): string
    {
        Shell::mustRun(array_merge(['git', 'commit', '-q', '-m', $message, '--'], $paths), $this->root);

        return trim(Shell::mustRun(['git', 'rev-parse', 'HEAD'], $this->root));
    }

    public function show(string $ref, string $path): ?string
    {
        [$code, $out] = Shell::run(['git', 'show', "{$ref}:{$path}"], $this->root);

        return $code === 0 ? $out : null;
    }

    public function resolve(string $ref): string
    {
        [$code, $out, $err] = Shell::run(['git', 'rev-parse', '--verify', "{$ref}^{commit}"], $this->root);

        if ($code !== 0) {
            throw new RuntimeException("Unknown git ref {$ref}: " . trim($err));
        }

        return trim($out);
    }

    /**
     * @return list<string>
     */
    public function listFiles(string $ref, string $dir): array
    {
        $out = Shell::mustRun(['git', 'ls-tree', '-r', '--name-only', $ref, '--', $dir], $this->root);
        $files = array_values(array_filter(explode("\n", $out), static fn ($line) => $line !== ''));
        sort($files, SORT_STRING);

        return $files;
    }
}
