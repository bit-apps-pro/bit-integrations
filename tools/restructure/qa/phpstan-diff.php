<?php

declare(strict_types=1);

namespace BitApps\Restructure\Qa\PhpstanDiff;

use JsonException;
use RuntimeException;

const USAGE = <<<'TXT'
    Usage:
      php phpstan-diff.php <base.json> <head.json> [--rename-map <manifests-dir>] [--only A,B]
      php phpstan-diff.php --normalize <phpstan.json> [--rename-map <manifests-dir>] [--only A,B]

    Compares two `phpstan analyse --error-format=json` reports as multisets of
    normalized errors and exits 1 when head has an error that base does not.

    An error is keyed by (scope, identifier, message):
      scope    Actions/<Folder> for files under backend/Actions/<Folder>/, otherwise
               the path below backend/
      message  line numbers and absolute paths removed; action class names mapped
               to one token per role:
                 <N>Controller, <N>Action, <N>Helper             -> <N>{Action|Helper}
                 RecordApiHelper, <N>RecordApiHelper, <N>Service -> <N>Service
                 <Role>ApiHelper, <N><Role>Service               -> <N><Role>Service

    --rename-map reads every *.json in the directory. A "renames" (or "classRenames")
    object maps an old fully qualified class name to a new one or to a list of new
    ones; every name in one entry is compared as the same class.

    --only limits the comparison to the listed Actions folders (or non-Actions scopes).
    --normalize prints the normalized multiset of one report, one "count<TAB>key" line
    per key, for determinism checks.

    Exit codes: 0 no new errors, 1 new errors, 2 bad usage or unreadable report.
    TXT;

const FQCN_PATTERN = '/\\\\?[A-Za-z_][A-Za-z0-9_]*(?:\\\\[A-Za-z_][A-Za-z0-9_]*)+/';

function main(array $argv): int
{
    try {
        $options = parseArguments(array_slice($argv, 1));
    } catch (RuntimeException $exception) {
        fwrite(STDERR, $exception->getMessage() . "\n\n" . USAGE . "\n");

        return 2;
    }

    if ($options['help']) {
        fwrite(STDOUT, USAGE . "\n");

        return 0;
    }

    try {
        $classMap = loadRenameMap($options['renameMap']);

        if ($options['normalize'] !== null) {
            $errors = filterScopes(loadReport($options['normalize'], $classMap), $options['only']);
            fwrite(STDOUT, renderMultiset(countKeys($errors)));

            return 0;
        }

        $base = filterScopes(loadReport($options['files'][0], $classMap), $options['only']);
        $head = filterScopes(loadReport($options['files'][1], $classMap), $options['only']);
    } catch (RuntimeException $exception) {
        fwrite(STDERR, $exception->getMessage() . "\n");

        return 2;
    }

    return compareReports($base, $head);
}

function parseArguments(array $arguments): array
{
    $options = ['files' => [], 'renameMap' => null, 'only' => null, 'normalize' => null, 'help' => false];

    for ($index = 0; $index < \count($arguments); $index++) {
        $argument = $arguments[$index];

        if ($argument === '-h' || $argument === '--help') {
            $options['help'] = true;

            continue;
        }

        if (!str_starts_with($argument, '--')) {
            $options['files'][] = $argument;

            continue;
        }

        [$name, $value] = str_contains($argument, '=') ? explode('=', $argument, 2) : [$argument, null];

        if (!\in_array($name, ['--rename-map', '--only', '--normalize'], true)) {
            throw new RuntimeException("Unknown option {$name}.");
        }

        if ($value === null) {
            $value = $arguments[++$index] ?? null;
        }

        if ($value === null || $value === '') {
            throw new RuntimeException("Option {$name} needs a value.");
        }

        match ($name) {
            '--rename-map' => $options['renameMap'] = $value,
            '--only'       => $options['only'] = array_values(array_filter(array_map('trim', explode(',', $value)), 'strlen')),
            '--normalize'  => $options['normalize'] = $value,
        };
    }

    if ($options['help']) {
        return $options;
    }

    $expectedFiles = $options['normalize'] === null ? 2 : 0;

    if (\count($options['files']) !== $expectedFiles) {
        throw new RuntimeException($expectedFiles === 2 ? 'Expected a base and a head report.' : 'Unexpected positional argument with --normalize.');
    }

    return $options;
}

function loadRenameMap(?string $directory): array
{
    if ($directory === null) {
        return [];
    }

    if (!is_dir($directory)) {
        throw new RuntimeException("Rename map directory not found: {$directory}");
    }

    $files = glob(rtrim($directory, '/') . '/*.json') ?: [];
    sort($files, SORT_STRING);

    $groups = [];

    foreach ($files as $file) {
        $manifest = decodeJsonFile($file);

        foreach (['renames', 'classRenames'] as $key) {
            foreach (normalizeRenameEntries($manifest[$key] ?? [], $file) as $names) {
                $groups[] = $names;
            }
        }
    }

    return buildEquivalenceMap($groups);
}

function normalizeRenameEntries(mixed $entries, string $file): array
{
    if (!\is_array($entries)) {
        throw new RuntimeException("Renames in {$file} must be an object or a list.");
    }

    $groups = [];

    foreach ($entries as $from => $to) {
        if (\is_array($to) && isset($to['from'], $to['to'])) {
            $from = $to['from'];
            $to = $to['to'];
        }

        $targets = \is_array($to) ? array_values($to) : [$to];
        $names = array_merge([$from], $targets);

        foreach ($names as $name) {
            if (!\is_string($name) || $name === '') {
                throw new RuntimeException("Invalid rename entry in {$file}.");
            }
        }

        $groups[] = array_map(fn (string $name): string => ltrim($name, '\\'), $names);
    }

    return $groups;
}

function buildEquivalenceMap(array $groups): array
{
    $parent = [];

    $find = function (string $name) use (&$parent, &$find): string {
        if (!isset($parent[$name])) {
            $parent[$name] = $name;
        }

        if ($parent[$name] !== $name) {
            $parent[$name] = $find($parent[$name]);
        }

        return $parent[$name];
    };

    foreach ($groups as $names) {
        $root = $find($names[0]);

        foreach (\array_slice($names, 1) as $name) {
            $other = $find($name);

            if ($other !== $root) {
                $parent[$other] = $root;
            }
        }
    }

    $members = [];

    foreach (array_keys($parent) as $name) {
        $members[$find($name)][] = $name;
    }

    $map = [];

    foreach ($members as $names) {
        sort($names, SORT_STRING);
        $token = '{' . implode('|', $names) . '}';

        foreach ($names as $name) {
            $map[$name] = $token;
        }
    }

    return $map;
}

function loadReport(string $file, array $classMap): array
{
    $report = decodeJsonFile($file);

    if (!isset($report['files']) || !\is_array($report['files'])) {
        throw new RuntimeException("Not a PHPStan JSON report (no \"files\" object): {$file}");
    }

    $errors = [];

    foreach ($report['files'] as $path => $details) {
        $relative = relativeToBackend((string) $path);
        $scope = scopeOf($relative);

        foreach ($details['messages'] ?? [] as $message) {
            $errors[] = [
                'scope'    => $scope,
                'key'      => implode("\t", [
                    $scope,
                    (string) ($message['identifier'] ?? '-'),
                    normalizeMessage((string) ($message['message'] ?? ''), $classMap),
                ]),
                'location' => $relative . ':' . (int) ($message['line'] ?? 0),
            ];
        }
    }

    foreach ($report['errors'] ?? [] as $message) {
        $errors[] = [
            'scope'    => '(general)',
            'key'      => "(general)\t-\t" . normalizeMessage((string) $message, $classMap),
            'location' => '(general)',
        ];
    }

    return $errors;
}

function decodeJsonFile(string $file): array
{
    if (!is_file($file) || !is_readable($file)) {
        throw new RuntimeException("Cannot read {$file}");
    }

    try {
        $decoded = json_decode((string) file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        throw new RuntimeException("Invalid JSON in {$file}: {$exception->getMessage()}");
    }

    if (!\is_array($decoded)) {
        throw new RuntimeException("Expected a JSON object in {$file}");
    }

    return $decoded;
}

function relativeToBackend(string $path): string
{
    $path = str_replace('\\', '/', $path);
    $position = strpos($path, '/backend/');

    if ($position !== false) {
        return substr($path, $position + 1);
    }

    return str_starts_with($path, 'backend/') ? $path : basename($path);
}

function scopeOf(string $relative): string
{
    if (preg_match('#^backend/Actions/([^/]+)/#', $relative, $match)) {
        return 'Actions/' . $match[1];
    }

    return preg_replace('#^backend/#', '', $relative);
}

function normalizeMessage(string $message, array $classMap): string
{
    $message = preg_replace('#(?:[A-Za-z]:)?[^\s"\'(]*?/(backend/[^\s"\'():]+?\.php)#', '$1', $message);
    $message = preg_replace('#(\.php)(?::\d+|\s+on line \d+)#', '$1', $message);
    $message = preg_replace('#\bon line \d+#', 'on line N', $message);

    return preg_replace_callback(FQCN_PATTERN, fn (array $match): string => canonicalClass($match[0], $classMap), $message);
}

function canonicalClass(string $name, array $classMap): string
{
    $leadingSlash = str_starts_with($name, '\\') ? '\\' : '';
    $bare = ltrim($name, '\\');

    if (isset($classMap[$bare])) {
        return $leadingSlash . $classMap[$bare];
    }

    if (preg_match('/^(BitApps\\\\Integrations\\\\Actions\\\\([A-Za-z0-9_]+)\\\\)([A-Za-z0-9_]+)$/', $bare, $match)) {
        return $leadingSlash . $match[1] . canonicalFreeShortName($match[2], $match[3]);
    }

    if (preg_match('/^(BitApps\\\\IntegrationsPro\\\\Actions\\\\([A-Za-z0-9_]+)\\\\)([A-Za-z0-9_]+)$/', $bare, $match)) {
        return $leadingSlash . $match[1] . canonicalProShortName($match[2], $match[3]);
    }

    return $name;
}

function canonicalFreeShortName(string $folder, string $short): string
{
    if (\in_array($short, [$folder . 'Controller', $folder . 'Action', $folder . 'Helper'], true)) {
        return $folder . '{Action|Helper}';
    }

    if (\in_array($short, ['RecordApiHelper', $folder . 'RecordApiHelper', $folder . 'Service'], true)) {
        return $folder . 'Service';
    }

    if (preg_match('/^([A-Za-z0-9_]+)ApiHelper$/', $short, $match)) {
        return $folder . $match[1] . 'Service';
    }

    return $short;
}

function canonicalProShortName(string $folder, string $short): string
{
    $bound = [$folder . 'ProHelper', $folder . 'HelperPro', $folder . 'RecordHelper', $folder . 'RecordApiHelper', $folder . 'Service'];

    return \in_array($short, $bound, true) ? $folder . 'Service' : $short;
}

function filterScopes(array $errors, ?array $only): array
{
    if ($only === null) {
        return $errors;
    }

    $wanted = [];

    foreach ($only as $name) {
        $wanted[$name] = true;
        $wanted['Actions/' . $name] = true;
    }

    return array_values(array_filter($errors, fn (array $error): bool => isset($wanted[$error['scope']])));
}

function countKeys(array $errors): array
{
    $counts = [];

    foreach ($errors as $error) {
        $counts[$error['key']] = ($counts[$error['key']] ?? 0) + 1;
    }

    ksort($counts, SORT_STRING);

    return $counts;
}

function renderMultiset(array $counts): string
{
    $lines = '';

    foreach ($counts as $key => $count) {
        $lines .= $count . "\t" . $key . "\n";
    }

    return $lines;
}

function compareReports(array $base, array $head): int
{
    $baseCounts = countKeys($base);
    $headCounts = countKeys($head);

    $locations = [];

    foreach ($head as $error) {
        $locations[$error['key']][] = $error['location'];
    }

    $added = [];
    $removed = 0;

    foreach ($headCounts as $key => $count) {
        $extra = $count - ($baseCounts[$key] ?? 0);

        if ($extra > 0) {
            $added[$key] = $extra;
        }
    }

    foreach ($baseCounts as $key => $count) {
        $removed += max(0, $count - ($headCounts[$key] ?? 0));
    }

    $newTotal = array_sum($added);

    fwrite(STDOUT, \sprintf("base=%d head=%d new=%d gone=%d\n", \count($base), \count($head), $newTotal, $removed));

    if ($added === []) {
        return 0;
    }

    fwrite(STDOUT, "\nNew errors in head (scope, identifier, message; +count; head locations):\n");

    foreach ($added as $key => $extra) {
        [$scope, $identifier, $message] = explode("\t", $key, 3);
        $where = $locations[$key];
        sort($where, SORT_NATURAL);
        fwrite(STDOUT, \sprintf("  [%s] %s +%d\n    %s\n    at %s\n", $scope, $identifier, $extra, $message, implode(', ', $where)));
    }

    return 1;
}

exit(main($argv));
