<?php

declare(strict_types=1);

namespace BitApps\Restructure\Repo;

use BitApps\Restructure\Support\Shell;
use FilesystemIterator;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RuntimeException;

final class Tree
{
    private const SKIPPED_REF_DIRS = ['vendor', 'node_modules', 'frontend', 'assets', 'languages', 'build'];

    /**
     * @var array<string, ?string>
     */
    private array $contents = [];

    /**
     * @var list<string>|null
     */
    private ?array $refFiles = null;

    private function __construct(public readonly string $root, public readonly ?string $ref)
    {
    }

    public static function filesystem(string $root): self
    {
        $real = realpath($root);

        if ($real === false || !is_dir($real)) {
            throw new RuntimeException("Not a directory: {$root}");
        }

        return new self($real, null);
    }

    public static function gitRef(string $root, string $ref): self
    {
        $real = realpath($root);

        if ($real === false || !is_dir($real)) {
            throw new RuntimeException("Not a directory: {$root}");
        }

        [$code, $out, $err] = Shell::run(['git', 'rev-parse', '--verify', "{$ref}^{commit}"], $real);

        if ($code !== 0) {
            throw new RuntimeException("Unknown git ref {$ref}: " . trim($err));
        }

        return new self($real, trim($out));
    }

    public function label(): string
    {
        return $this->ref === null ? 'working tree' : 'git ' . substr($this->ref, 0, 12);
    }

    public function read(string $path): ?string
    {
        if (\array_key_exists($path, $this->contents)) {
            return $this->contents[$path];
        }

        if ($this->ref === null) {
            $full = $this->root . '/' . $path;
            $content = is_file($full) ? file_get_contents($full) : false;

            return $this->contents[$path] = $content === false ? null : $content;
        }

        if (!\in_array($path, $this->allRefFiles(), true)) {
            return $this->contents[$path] = null;
        }

        [$code, $out] = Shell::run(['git', 'show', "{$this->ref}:{$path}"], $this->root);

        return $this->contents[$path] = $code === 0 ? $out : null;
    }

    public function exists(string $path): bool
    {
        if ($this->ref === null) {
            return is_file($this->root . '/' . $path);
        }

        return \in_array($path, $this->allRefFiles(), true);
    }

    public function forget(string $path): void
    {
        unset($this->contents[$path]);
    }

    /**
     * @return list<string> relative paths of files below $dir, sorted
     */
    public function files(string $dir): array
    {
        $dir = trim($dir, '/');

        if ($this->ref !== null) {
            $prefix = $dir === '' ? '' : $dir . '/';

            return array_values(array_filter(
                $this->allRefFiles(),
                static fn (string $path): bool => $prefix === '' || str_starts_with($path, $prefix)
            ));
        }

        $base = $dir === '' ? $this->root : $this->root . '/' . $dir;

        if (!is_dir($base)) {
            return [];
        }

        $files = [];
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $files[] = substr($file->getPathname(), \strlen($this->root) + 1);
            }
        }

        sort($files, SORT_STRING);

        return $files;
    }

    /**
     * @return list<string> names of the direct subdirectories of $dir, sorted
     */
    public function subdirectories(string $dir): array
    {
        $dir = trim($dir, '/');
        $names = [];

        if ($this->ref !== null) {
            $prefix = $dir . '/';

            foreach ($this->allRefFiles() as $path) {
                if (str_starts_with($path, $prefix)) {
                    $rest = substr($path, \strlen($prefix));
                    $slash = strpos($rest, '/');

                    if ($slash !== false) {
                        $names[substr($rest, 0, $slash)] = true;
                    }
                }
            }
        } else {
            foreach (scandir($this->root . '/' . $dir) ?: [] as $entry) {
                if ($entry !== '.' && $entry !== '..' && is_dir($this->root . '/' . $dir . '/' . $entry)) {
                    $names[$entry] = true;
                }
            }
        }

        $names = array_map('strval', array_keys($names));
        sort($names, SORT_STRING);

        return $names;
    }

    /**
     * PHP files that can reference action classes: backend/, views/ and the plugin root.
     *
     * @return list<string>
     */
    public function scanScope(): array
    {
        $paths = [];

        foreach (['backend', 'views'] as $dir) {
            foreach ($this->files($dir) as $path) {
                if (str_ends_with($path, '.php')) {
                    $paths[] = $path;
                }
            }
        }

        foreach ($this->rootPhpFiles() as $path) {
            $paths[] = $path;
        }

        $paths = array_values(array_unique($paths));
        sort($paths, SORT_STRING);

        return $paths;
    }

    /**
     * @return list<string>
     */
    private function rootPhpFiles(): array
    {
        if ($this->ref !== null) {
            return array_values(array_filter($this->allRefFiles(), static fn (string $path): bool => !str_contains($path, '/') && str_ends_with($path, '.php') && $path[0] !== '.'));
        }

        $paths = [];

        foreach (scandir($this->root) ?: [] as $entry) {
            if ($entry[0] !== '.' && str_ends_with($entry, '.php') && is_file($this->root . '/' . $entry)) {
                $paths[] = $entry;
            }
        }

        sort($paths, SORT_STRING);

        return $paths;
    }

    /**
     * @return list<string>
     */
    private function allRefFiles(): array
    {
        if ($this->refFiles !== null) {
            return $this->refFiles;
        }

        $out = Shell::mustRun(['git', 'ls-tree', '-r', '-z', '--name-only', (string) $this->ref], $this->root);
        $files = [];

        foreach (explode("\0", $out) as $path) {
            if ($path === '') {
                continue;
            }

            if (\in_array(explode('/', $path)[0], self::SKIPPED_REF_DIRS, true)) {
                continue;
            }

            $files[] = $path;
        }

        sort($files, SORT_STRING);

        return $this->refFiles = $files;
    }
}
