<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use RuntimeException;

final class Workspace
{
    public readonly string $freeDir;

    public readonly string $proDir;

    public readonly string $wpPath;

    public readonly string $harnessDir;

    private string $tmpDir;

    private int $jobs = 0;

    public function __construct(Options $options)
    {
        $this->harnessDir = \dirname(__DIR__);
        $this->freeDir = self::dir($options->get('free', \dirname(__DIR__, 5)), 'free plugin');
        $this->proDir = rtrim((string) $options->get('pro-dir', \dirname($this->freeDir) . '/bit-integrations-pro'), '/');
        $wp = $options->get('wp');

        if ($wp === null) {
            throw new RuntimeException('--wp=<WordPress root> is required');
        }

        $this->wpPath = self::dir($wp, 'WordPress root');

        if (!is_file($this->wpPath . '/wp-config.php') && !is_file(\dirname($this->wpPath) . '/wp-config.php')) {
            throw new RuntimeException("no wp-config.php at {$this->wpPath}");
        }

        $this->tmpDir = rtrim(sys_get_temp_dir(), '/') . '/bi-smoke-' . getmypid() . '-' . bin2hex(random_bytes(4));

        if (!mkdir($this->tmpDir, 0700, true) && !is_dir($this->tmpDir)) {
            throw new RuntimeException("cannot create {$this->tmpDir}");
        }
    }

    public function newJobDir(string $label): string
    {
        $dir = $this->tmpDir . '/' . \sprintf('%04d', ++$this->jobs) . '-' . preg_replace('~[^A-Za-z0-9_.-]+~', '_', $label);

        if (!mkdir($dir, 0700, true) && !is_dir($dir)) {
            throw new RuntimeException("cannot create {$dir}");
        }

        return $dir;
    }

    public function tmpDir(): string
    {
        return $this->tmpDir;
    }

    public function cleanup(): void
    {
        self::remove($this->tmpDir);
    }

    public function actionsDir(string $repo): string
    {
        return ($repo === 'pro' ? $this->proDir : $this->freeDir) . '/backend/Actions';
    }

    private static function dir(string $path, string $what): string
    {
        $real = realpath($path);

        if ($real === false || !is_dir($real)) {
            throw new RuntimeException("{$what} not found: {$path}");
        }

        return $real;
    }

    private static function remove(string $path): void
    {
        if (is_dir($path) && !is_link($path)) {
            foreach (scandir($path) ?: [] as $entry) {
                if ($entry !== '.' && $entry !== '..') {
                    self::remove($path . '/' . $entry);
                }
            }
            rmdir($path);
        } elseif (file_exists($path) || is_link($path)) {
            unlink($path);
        }
    }
}
