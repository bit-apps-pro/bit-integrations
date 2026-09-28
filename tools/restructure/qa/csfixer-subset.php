<?php

declare(strict_types=1);

namespace BitApps\Restructure\Qa\CsFixerSubset;

use FilesystemIterator;
use JsonException;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RuntimeException;

const USAGE = <<<'TXT'
    Usage:
      php csfixer-subset.php --base <gitRef> [--head <gitRef>] [--only A,B]
                             [--manifests <dir>] [--fixer <php-cs-fixer>] [--repo <dir>]

    For every PHP file under backend/ that is added, renamed or copied between
    merge-base(base, head) and head, runs
      php-cs-fixer fix --dry-run --format=json -v --config=.php-cs-fixer.php
    on the new file and on its source files at base, and fails when a fixer fires
    on the new file that fired on none of its sources.

    Sources of a new file, first match wins:
      1. "sources" in a manifest: {"<new path>": ["<base path>", ...]}
      2. the rename or copy origin git reports (-M -C)
      3. for an added file: the files that left the same folder (renamed away or
         deleted), narrowed to *Controller.php when one of them is a Controller;
         otherwise every file the folder had at base

    Both sides are materialized from git into a scratch tree and checked with the
    head .php-cs-fixer.php and composer.json, so only the code differs. Uncommitted
    changes are not checked.

    --only     limit to these backend/Actions folders
    --fixer    php-cs-fixer entry point (phar or vendor/bin script); defaults to
               $PHP_CS_FIXER, then the first of php-cs-fixer.phar, vendor/bin/php-cs-fixer,
               tools/restructure/vendor/bin/php-cs-fixer that answers --version
    --repo     repository root (default: three levels above this file)
    -v         also list the files that pass, with their fixer sets

    Exit codes: 0 every new file is a subset, 1 at least one is not, 2 usage or tool error.
    TXT;

function main(array $argv): int
{
    try {
        $options = parseArguments(\array_slice($argv, 1));
    } catch (RuntimeException $exception) {
        fwrite(STDERR, $exception->getMessage() . "\n\n" . USAGE . "\n");

        return 2;
    }

    if ($options['help']) {
        fwrite(STDOUT, USAGE . "\n");

        return 0;
    }

    $scratch = null;

    try {
        $repo = $options['repo'];
        $head = revParse($repo, $options['head']);
        $base = trim(git($repo, ['merge-base', revParse($repo, $options['base']), $head]));
        $changes = collectChanges($repo, $base, $head);
        $targets = selectTargets($changes, $options['only']);

        if ($targets === []) {
            fwrite(STDOUT, "checked=0 violations=0\n");

            return 0;
        }

        $explicitSources = loadManifestSources($options['manifests']);
        $baseFiles = listBaseFiles($repo, $base);
        $plan = [];

        foreach ($targets as $path => $origin) {
            $plan[$path] = resolveSources($path, $origin, $explicitSources, $changes, $baseFiles);
        }

        $fixer = resolveFixer($repo, $options['fixer']);
        $scratch = makeScratchDirectory();

        $sourcePaths = array_values(array_unique(array_merge([], ...array_values($plan))));
        sort($sourcePaths, SORT_STRING);
        $headPaths = array_keys($plan);

        $baseApplied = runFixer($repo, $fixer, $head, $base, $sourcePaths, $scratch . '/base');
        $headApplied = runFixer($repo, $fixer, $head, $head, $headPaths, $scratch . '/head');
    } catch (RuntimeException $exception) {
        fwrite(STDERR, $exception->getMessage() . "\n");

        return 2;
    } finally {
        if ($scratch !== null) {
            removeTree($scratch);
        }
    }

    return report($plan, $baseApplied, $headApplied, $options['verbose']);
}

function parseArguments(array $arguments): array
{
    $options = [
        'base'      => null,
        'head'      => 'HEAD',
        'only'      => null,
        'manifests' => null,
        'fixer'     => getenv('PHP_CS_FIXER') ?: null,
        'repo'      => \dirname(__DIR__, 3),
        'verbose'   => false,
        'help'      => false,
    ];

    for ($index = 0; $index < \count($arguments); $index++) {
        $argument = $arguments[$index];

        if ($argument === '-h' || $argument === '--help') {
            $options['help'] = true;

            continue;
        }

        if ($argument === '-v' || $argument === '--verbose') {
            $options['verbose'] = true;

            continue;
        }

        [$name, $value] = str_contains($argument, '=') ? explode('=', $argument, 2) : [$argument, null];
        $key = ltrim($name, '-');

        if (!str_starts_with($name, '--') || !\array_key_exists($key, $options) || \in_array($key, ['help', 'verbose'], true)) {
            throw new RuntimeException("Unknown argument {$argument}.");
        }

        if ($value === null) {
            $value = $arguments[++$index] ?? null;
        }

        if ($value === null || $value === '') {
            throw new RuntimeException("Option {$name} needs a value.");
        }

        $options[$key] = $key === 'only'
            ? array_values(array_filter(array_map('trim', explode(',', $value)), 'strlen'))
            : $value;
    }

    if (!$options['help'] && $options['base'] === null) {
        throw new RuntimeException('Missing --base.');
    }

    $options['repo'] = rtrim($options['repo'], '/');

    return $options;
}

function git(string $repo, array $arguments): string
{
    [$code, $stdout, $stderr] = run(array_merge(['git', '-C', $repo, '-c', 'core.quotepath=off'], $arguments), $repo);

    if ($code !== 0) {
        throw new RuntimeException('git ' . implode(' ', $arguments) . " failed:\n" . $stderr);
    }

    return $stdout;
}

function revParse(string $repo, string $ref): string
{
    [$code, $stdout] = run(['git', '-C', $repo, 'rev-parse', '--verify', '--quiet', $ref . '^{commit}'], $repo);

    if ($code !== 0) {
        throw new RuntimeException("Unknown commit: {$ref}");
    }

    return trim($stdout);
}

function run(array $command, string $cwd): array
{
    $stdoutFile = tempnam(sys_get_temp_dir(), 'csfs');
    $stderrFile = tempnam(sys_get_temp_dir(), 'csfs');
    $process = proc_open($command, [0 => ['file', '/dev/null', 'r'], 1 => ['file', $stdoutFile, 'w'], 2 => ['file', $stderrFile, 'w']], $pipes, $cwd);

    if (!\is_resource($process)) {
        throw new RuntimeException('Cannot start ' . $command[0]);
    }

    $code = proc_close($process);
    $stdout = (string) file_get_contents($stdoutFile);
    $stderr = (string) file_get_contents($stderrFile);
    unlink($stdoutFile);
    unlink($stderrFile);

    return [$code, $stdout, $stderr];
}

function collectChanges(string $repo, string $base, string $head): array
{
    $output = git($repo, ['diff', '--no-ext-diff', '--no-color', '-M', '-C', '--name-status', '-z', $base, $head, '--', 'backend']);
    $fields = explode("\0", rtrim($output, "\0"));
    $changes = [];

    for ($index = 0; $index < \count($fields) && $fields[$index] !== '';) {
        $status = $fields[$index++];
        $kind = $status[0];

        if ($kind === 'R' || $kind === 'C') {
            $changes[] = ['kind' => $kind, 'from' => $fields[$index], 'path' => $fields[$index + 1]];
            $index += 2;

            continue;
        }

        $changes[] = ['kind' => $kind, 'from' => null, 'path' => $fields[$index++]];
    }

    return $changes;
}

function selectTargets(array $changes, ?array $only): array
{
    $targets = [];

    foreach ($changes as $change) {
        if (!\in_array($change['kind'], ['A', 'R', 'C'], true) || !str_ends_with($change['path'], '.php')) {
            continue;
        }

        if ($only !== null && !\in_array(actionsFolder($change['path']), $only, true)) {
            continue;
        }

        $targets[$change['path']] = $change['from'];
    }

    ksort($targets, SORT_STRING);

    return $targets;
}

function actionsFolder(string $path): ?string
{
    return preg_match('#^backend/Actions/([^/]+)/#', $path, $match) ? $match[1] : null;
}

function loadManifestSources(?string $directory): array
{
    if ($directory === null) {
        return [];
    }

    if (!is_dir($directory)) {
        throw new RuntimeException("Manifest directory not found: {$directory}");
    }

    $files = glob(rtrim($directory, '/') . '/*.json') ?: [];
    sort($files, SORT_STRING);
    $sources = [];

    foreach ($files as $file) {
        try {
            $manifest = json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException("Invalid JSON in {$file}: {$exception->getMessage()}");
        }

        foreach ((\is_array($manifest) ? $manifest['sources'] ?? [] : []) as $path => $list) {
            if (!\is_array($list)) {
                throw new RuntimeException("\"sources\" entries in {$file} must be lists of paths.");
            }

            $sources[$path] = array_values(array_unique(array_merge($sources[$path] ?? [], array_map('strval', $list))));
        }
    }

    return $sources;
}

function listBaseFiles(string $repo, string $base): array
{
    $output = git($repo, ['ls-tree', '-r', '-z', '--name-only', $base, '--', 'backend']);

    return array_fill_keys(array_filter(explode("\0", $output), fn (string $path): bool => str_ends_with($path, '.php')), true);
}

function resolveSources(string $path, ?string $origin, array $explicitSources, array $changes, array $baseFiles): array
{
    if (isset($explicitSources[$path])) {
        $sources = $explicitSources[$path];
    } elseif ($origin !== null) {
        $sources = [$origin];
    } else {
        $sources = departedFromFolder(\dirname($path), $changes);

        $controllers = array_values(array_filter($sources, fn (string $source): bool => str_ends_with($source, 'Controller.php')));

        if ($controllers !== []) {
            $sources = $controllers;
        } elseif ($sources === []) {
            $sources = array_values(array_filter(array_keys($baseFiles), fn (string $source): bool => \dirname($source) === \dirname($path)));
        }
    }

    foreach ($sources as $source) {
        if (!isset($baseFiles[$source])) {
            throw new RuntimeException("Source {$source} of {$path} does not exist at base.");
        }
    }

    sort($sources, SORT_STRING);

    return array_values(array_unique($sources));
}

function departedFromFolder(string $folder, array $changes): array
{
    $departed = [];

    foreach ($changes as $change) {
        $left = match ($change['kind']) {
            'D'     => $change['path'],
            'R'     => $change['from'],
            default => null,
        };

        if ($left !== null && str_ends_with($left, '.php') && \dirname($left) === $folder) {
            $departed[] = $left;
        }
    }

    return $departed;
}

function resolveFixer(string $repo, ?string $explicit): string
{
    $candidates = $explicit !== null
        ? [$explicit]
        : [$repo . '/php-cs-fixer.phar', $repo . '/vendor/bin/php-cs-fixer', $repo . '/tools/restructure/vendor/bin/php-cs-fixer'];

    $failures = [];

    foreach ($candidates as $candidate) {
        if (!is_file($candidate)) {
            $failures[] = "{$candidate}: not found";

            continue;
        }

        [$code, , $stderr] = run([PHP_BINARY, $candidate, '--version'], $repo);

        if ($code === 0) {
            return $candidate;
        }

        $failures[] = "{$candidate}: exit {$code}: " . strtok(trim($stderr), "\n");
    }

    throw new RuntimeException("No working php-cs-fixer (pass --fixer or set PHP_CS_FIXER):\n  " . implode("\n  ", $failures));
}

function makeScratchDirectory(): string
{
    $directory = sys_get_temp_dir() . '/csfixer-subset-' . bin2hex(random_bytes(8));

    if (!mkdir($directory, 0700)) {
        throw new RuntimeException("Cannot create {$directory}");
    }

    return $directory;
}

function runFixer(string $repo, string $fixer, string $configRef, string $contentRef, array $paths, string $root): array
{
    if ($paths === []) {
        return [];
    }

    foreach (['backend', 'views'] as $folder) {
        mkdir($root . '/' . $folder, 0700, true);
    }

    file_put_contents($root . '/.php-cs-fixer.php', git($repo, ['show', $configRef . ':.php-cs-fixer.php']));
    file_put_contents($root . '/composer.json', git($repo, ['show', $configRef . ':composer.json']));

    foreach ($paths as $path) {
        $target = $root . '/' . $path;

        if (!is_dir(\dirname($target))) {
            mkdir(\dirname($target), 0700, true);
        }

        file_put_contents($target, git($repo, ['show', $contentRef . ':' . $path]));
    }

    $applied = array_fill_keys($paths, []);

    foreach (array_chunk($paths, 100) as $chunk) {
        $command = array_merge(
            [PHP_BINARY, $fixer, 'fix', '--dry-run', '--format=json', '-v', '--using-cache=no', '--no-interaction', '--config=' . $root . '/.php-cs-fixer.php'],
            $chunk
        );
        [$code, $stdout, $stderr] = run($command, $root);

        if ($code !== 0 && $code !== 8) {
            throw new RuntimeException("php-cs-fixer exited {$code} on {$contentRef}:\n" . str_replace($root . '/', '', $stderr . $stdout));
        }

        try {
            $result = json_decode($stdout, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException('php-cs-fixer printed invalid JSON: ' . $exception->getMessage());
        }

        foreach ($result['files'] ?? [] as $file) {
            $name = preg_replace('#^\./#', '', str_replace($root . '/', '', (string) $file['name']));

            if (!\array_key_exists($name, $applied)) {
                throw new RuntimeException("php-cs-fixer reported an unexpected file: {$name}");
            }

            $fixers = array_map('strval', $file['appliedFixers'] ?? []);
            sort($fixers, SORT_STRING);
            $applied[$name] = $fixers;
        }
    }

    return $applied;
}

function report(array $plan, array $baseApplied, array $headApplied, bool $verbose): int
{
    $violations = 0;
    $lines = [];

    foreach ($plan as $path => $sources) {
        $allowed = array_unique(array_merge([], ...array_map(fn (string $source): array => $baseApplied[$source] ?? [], $sources)));
        $extra = array_values(array_diff($headApplied[$path] ?? [], $allowed));
        sort($extra, SORT_STRING);

        if ($extra !== []) {
            $violations++;
        } elseif (!$verbose) {
            continue;
        }

        $lines[] = \sprintf(
            "  %s %s\n    head: %s\n    sources: %s%s",
            $extra === [] ? 'ok' : 'FAIL',
            $path,
            implode(', ', $headApplied[$path] ?? []) ?: '-',
            implode(', ', array_map(fn (string $source): string => $source . ' [' . (implode(', ', $baseApplied[$source] ?? []) ?: '-') . ']', $sources)),
            $extra === [] ? '' : "\n    new fixers: " . implode(', ', $extra)
        );
    }

    fwrite(STDOUT, \sprintf("checked=%d violations=%d\n", \count($plan), $violations));

    if ($lines !== []) {
        fwrite(STDOUT, implode("\n", $lines) . "\n");
    }

    return $violations > 0 ? 1 : 0;
}

function removeTree(string $directory): void
{
    if (!is_dir($directory)) {
        return;
    }

    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($items as $item) {
        $item->isDir() && !$item->isLink() ? rmdir($item->getPathname()) : unlink($item->getPathname());
    }

    rmdir($directory);
}

exit(main($argv));
