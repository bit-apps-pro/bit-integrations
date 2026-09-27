<?php

declare(strict_types=1);

namespace BitApps\Restructure\Support;

final class Lint
{
    /**
     * @var array<string, ?string>
     */
    private array $binaries = [];

    /**
     * @param list<string> $versions
     */
    public function __construct(private readonly array $versions = ['7.4', '8.4'])
    {
        foreach ($this->versions as $version) {
            $this->binaries[$version] = Shell::which("php{$version}");
        }
    }

    /**
     * @return array<string, ?string>
     */
    public function binaries(): array
    {
        return $this->binaries;
    }

    /**
     * @return list<string> one message per failing binary; a missing binary is a failure
     */
    public function lintCode(string $label, string $code): array
    {
        $tmp = tempnam(sys_get_temp_dir(), 'bi-lint-');
        $file = $tmp . '.php';
        rename($tmp, $file);
        file_put_contents($file, $code);

        try {
            return $this->lintFile($label, $file);
        } finally {
            @unlink($file);
        }
    }

    /**
     * @return list<string>
     */
    public function lintFile(string $label, string $file): array
    {
        $errors = [];

        foreach ($this->binaries as $version => $binary) {
            if ($binary === null) {
                $errors[] = "php{$version} not found on PATH, cannot lint {$label}";

                continue;
            }

            [$code, $out, $err] = Shell::run([$binary, '-n', '-l', $file]);

            if ($code !== 0) {
                $message = trim(str_replace($file, $label, $out . $err));
                $errors[] = "php{$version} -l {$label}: {$message}";
            }
        }

        return $errors;
    }
}
