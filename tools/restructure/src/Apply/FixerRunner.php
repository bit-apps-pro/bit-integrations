<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use BitApps\Restructure\Support\Shell;
use RuntimeException;

final class FixerRunner
{
    private const IMPORT_RULES = ['ordered_imports', 'no_unused_imports', 'blank_line_between_import_groups', 'single_line_after_imports', 'no_leading_import_slash', 'no_unneeded_import_alias'];

    private function __construct(private readonly string $fixer, private readonly string $root)
    {
    }

    public static function locate(string $root, string $toolRoot, ?string $explicit): ?self
    {
        $candidates = $explicit !== null ? [$explicit] : [$toolRoot . '/vendor/bin/php-cs-fixer', $root . '/php-cs-fixer.phar', $root . '/vendor/bin/php-cs-fixer'];

        foreach ($candidates as $candidate) {
            if (!is_file($candidate)) {
                continue;
            }

            [$code] = Shell::run([PHP_BINARY, $candidate, '--version'], $root);

            if ($code === 0) {
                return new self($candidate, $root);
            }
        }

        if ($explicit !== null) {
            throw new RuntimeException("php-cs-fixer at {$explicit} does not run");
        }

        return null;
    }

    public function label(): string
    {
        return $this->fixer;
    }

    /**
     * Runs only the import rules of the project config on $paths (files the tool created).
     *
     * @param list<string> $paths relative to the root
     *
     * @return list<string> paths the fixer changed
     */
    public function fixImports(array $paths): array
    {
        if ($paths === []) {
            return [];
        }

        $projectConfig = $this->root . '/.php-cs-fixer.php';

        if (!is_file($projectConfig)) {
            throw new RuntimeException("{$projectConfig} is missing");
        }

        $config = tempnam(sys_get_temp_dir(), 'bi-fixer-');
        $script = "<?php\n\n\$project = require " . var_export($projectConfig, true) . ";\n"
            . '$rules = array_intersect_key($project->getRules(), array_flip(' . var_export(self::IMPORT_RULES, true) . "));\n"
            . "return (new PhpCsFixer\\Config())->setRiskyAllowed(true)->setIndent(\$project->getIndent())->setLineEnding(\$project->getLineEnding())->setRules(\$rules);\n";
        file_put_contents($config, $script);

        try {
            $before = [];

            foreach ($paths as $path) {
                $before[$path] = (string) file_get_contents($this->root . '/' . $path);
            }

            [$code, $out, $err] = Shell::run(array_merge([PHP_BINARY, $this->fixer, 'fix', '--config=' . $config, '--using-cache=no', '--path-mode=override', '--quiet', '--'], $paths), $this->root);

            if ($code !== 0 && $code !== 8) {
                throw new RuntimeException('php-cs-fixer failed: ' . trim($err . "\n" . $out));
            }

            $changed = [];

            foreach ($paths as $path) {
                if ((string) file_get_contents($this->root . '/' . $path) !== $before[$path]) {
                    $changed[] = $path;
                }
            }

            return $changed;
        } finally {
            @unlink($config);
        }
    }
}
