<?php

declare(strict_types=1);

namespace BitApps\Restructure\Support;

use RuntimeException;

final class Shell
{
    /**
     * @param list<string> $argv
     *
     * @return array{int, string, string}
     */
    public static function run(array $argv, ?string $cwd = null, ?string $stdin = null): array
    {
        $descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
        $env = getenv();
        $env['LC_ALL'] = 'C';
        $env['GIT_TERMINAL_PROMPT'] = '0';
        $process = proc_open($argv, $descriptors, $pipes, $cwd, $env);

        if (!\is_resource($process)) {
            throw new RuntimeException('Cannot start ' . implode(' ', $argv));
        }

        if ($stdin !== null) {
            fwrite($pipes[0], $stdin);
        }

        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $code = proc_close($process);

        return [$code, (string) $stdout, (string) $stderr];
    }

    /**
     * @param list<string> $argv
     */
    public static function mustRun(array $argv, ?string $cwd = null): string
    {
        [$code, $out, $err] = self::run($argv, $cwd);

        if ($code !== 0) {
            throw new RuntimeException(implode(' ', $argv) . " failed ({$code}): " . trim($err . "\n" . $out));
        }

        return $out;
    }

    public static function which(string $binary): ?string
    {
        foreach (explode(PATH_SEPARATOR, (string) getenv('PATH')) as $dir) {
            $candidate = rtrim($dir, '/') . '/' . $binary;

            if ($dir !== '' && is_file($candidate) && is_executable($candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}
