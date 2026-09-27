<?php

declare(strict_types=1);

namespace BitApps\Restructure\Ci;

use FilesystemIterator;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RuntimeException;

const ACTIONS_DIR = 'backend/Actions';

const ALLOWLIST = 'tools/restructure/ci/actions-shape-allowlist.txt';

const TRANSITIONAL_FILE = '#^backend/Actions/(?:[^/]+/)*[^/]*(?:Controller|ApiHelper)\.php$#';

const PERMANENT = [
    'backend/Actions/ActionController.php',
    'backend/Actions/Salesforce/SalesforceController.php',
];

const USAGE = <<<'TXT'
    Usage: php tools/restructure/ci/actions-shape.php [options]

    Fails when backend/Actions holds a *Controller.php or *ApiHelper.php that the
    allowlist does not list, when the allowlist lists a file that is gone, or when
    an integration folder has neither <N>Action.php nor <N>Controller.php.

      --root=DIR             plugin root (default: three levels above this script)
      --allowlist=FILE       allowlist (default: <root>/tools/restructure/ci/actions-shape-allowlist.txt)
      --base-allowlist=FILE  the base branch's allowlist; any entry it lacks fails the check
      --prune                rewrite the allowlist without entries whose files are gone
      --init                 write the allowlist from the current tree (only when it does not exist)
      --help                 show this help

    TXT;

function main(array $arguments): int
{
    try {
        $options = parseOptions($arguments);
    } catch (RuntimeException $e) {
        fwrite(STDERR, $e->getMessage() . "\n\n" . USAGE);

        return 2;
    }

    if ($options['help']) {
        echo USAGE;

        return 0;
    }

    try {
        return run($options);
    } catch (RuntimeException $e) {
        fwrite(STDERR, 'actions-shape: ' . $e->getMessage() . "\n");

        return 2;
    }
}

function parseOptions(array $arguments): array
{
    $options = [
        'root'          => \dirname(__DIR__, 3),
        'allowlist'     => null,
        'baseAllowlist' => null,
        'prune'         => false,
        'init'          => false,
        'help'          => false,
    ];

    $valued = ['--root' => 'root', '--allowlist' => 'allowlist', '--base-allowlist' => 'baseAllowlist'];
    $flags = ['--prune' => 'prune', '--init' => 'init', '--help' => 'help', '-h' => 'help'];

    foreach ($arguments as $argument) {
        [$name, $value] = array_pad(explode('=', $argument, 2), 2, null);

        if (isset($valued[$name]) && $value !== null && $value !== '') {
            $options[$valued[$name]] = $value;
        } elseif (isset($flags[$name]) && $value === null) {
            $options[$flags[$name]] = true;
        } else {
            throw new RuntimeException("Unknown or incomplete option: {$argument}");
        }
    }

    if ($options['prune'] && $options['init']) {
        throw new RuntimeException('--prune and --init cannot be combined.');
    }

    $root = realpath($options['root']);

    if ($root === false || !is_dir($root . '/' . ACTIONS_DIR)) {
        throw new RuntimeException("No backend/Actions under {$options['root']}");
    }

    $options['root'] = $root;
    $options['allowlist'] ??= $root . '/' . ALLOWLIST;

    return $options;
}

function run(array $options): int
{
    $root = $options['root'];
    $allowlistPath = $options['allowlist'];
    $allowlistLabel = displayPath($root, $allowlistPath);
    $files = transitionalFiles($root);

    if ($options['init']) {
        if (file_exists($allowlistPath)) {
            throw new RuntimeException("{$allowlistLabel} already exists; use --prune to shrink it.");
        }

        writeList($allowlistPath, array_values(array_diff($files, PERMANENT)));
        echo "actions-shape: wrote {$allowlistLabel}\n";
    }

    if (!is_file($allowlistPath)) {
        throw new RuntimeException("Missing allowlist {$allowlistLabel}");
    }

    if ($options['prune']) {
        $entries = readList($allowlistPath);
        $kept = array_values(array_intersect(array_diff($files, PERMANENT), $entries));
        writeList($allowlistPath, $kept);
        echo 'actions-shape: pruned ' . (\count(array_unique($entries)) - \count($kept)) . " entries from {$allowlistLabel}\n";
    }

    $entries = readList($allowlistPath);
    $baseEntries = null;

    if ($options['baseAllowlist'] !== null) {
        if (!is_file($options['baseAllowlist'])) {
            throw new RuntimeException("Missing base allowlist {$options['baseAllowlist']}");
        }

        $baseEntries = array_flip(readList($options['baseAllowlist']));
    }

    $problems = array_merge(
        allowlistProblems($entries, $files, $baseEntries, $allowlistLabel),
        unlistedFileProblems($files, $entries),
        dispatchProblems($root),
    );

    usort($problems, fn (array $a, array $b) => strcmp($a[0], $b[0]) ?: $a[1] <=> $b[1] ?: strcmp($a[2], $b[2]));

    foreach ($problems as [$file, $line, $message]) {
        echo formatProblem($file, $line, $message) . "\n";
    }

    if ($problems !== []) {
        echo 'actions-shape: FAILED with ' . \count($problems) . " problem(s)\n";

        return 1;
    }

    printf(
        "actions-shape: OK (%d dispatchable folders, %d allowlisted files, %d permanent files)\n",
        \count(liveFolders($root)),
        \count($entries),
        \count(array_intersect(PERMANENT, $files)),
    );

    return 0;
}

function allowlistProblems(array $entries, array $files, ?array $baseEntries, string $label): array
{
    $problems = [];
    $existing = array_flip($files);
    $previous = null;

    foreach ($entries as $index => $entry) {
        $line = $index + 1;

        if (!preg_match(TRANSITIONAL_FILE, $entry)) {
            $problems[] = [$label, $line, "'{$entry}' is not a *Controller.php or *ApiHelper.php path under backend/Actions"];

            continue;
        }

        if (\in_array($entry, PERMANENT, true)) {
            $problems[] = [$label, $line, "{$entry} is permanently allowed; remove it from the allowlist"];
        } elseif (!isset($existing[$entry])) {
            $problems[] = [$label, $line, "{$entry} no longer exists; remove it from the allowlist (run with --prune)"];
        }

        if ($previous !== null && strcmp($previous, $entry) >= 0) {
            $problems[] = [$label, $line, "{$entry} is out of order or duplicated; keep the allowlist byte-sorted and unique"];
        }

        if ($baseEntries !== null && !isset($baseEntries[$entry])) {
            $problems[] = [$label, $line, "{$entry} was added to the allowlist; it may only shrink"];
        }

        $previous = $entry;
    }

    return $problems;
}

function unlistedFileProblems(array $files, array $entries): array
{
    $listed = array_flip($entries);
    $problems = [];

    foreach ($files as $file) {
        if (isset($listed[$file]) || \in_array($file, PERMANENT, true)) {
            continue;
        }

        $problems[] = [
            $file,
            0,
            'new Controller/ApiHelper file; use <N>Action.php, <N>Helper.php, <N>Service.php or <N><Role>Service.php instead',
        ];
    }

    return $problems;
}

function dispatchProblems(string $root): array
{
    $problems = [];

    foreach (liveFolders($root) as $folder) {
        $entries = scandir("{$root}/" . ACTIONS_DIR . "/{$folder}");

        if (
            \in_array("{$folder}Action.php", $entries, true)
            || \in_array("{$folder}Controller.php", $entries, true)
        ) {
            continue;
        }

        $problems[] = [
            ACTIONS_DIR . "/{$folder}",
            0,
            "no {$folder}Action.php or {$folder}Controller.php, so Flow cannot dispatch this integration",
        ];
    }

    return $problems;
}

function transitionalFiles(string $root): array
{
    $files = [];

    foreach (phpFiles("{$root}/" . ACTIONS_DIR) as $relative) {
        $path = ACTIONS_DIR . "/{$relative}";

        if (preg_match(TRANSITIONAL_FILE, $path)) {
            $files[] = $path;
        }
    }

    sort($files, SORT_STRING);

    return $files;
}

function liveFolders(string $root): array
{
    $folders = [];

    foreach (scandir("{$root}/" . ACTIONS_DIR) as $name) {
        $path = "{$root}/" . ACTIONS_DIR . "/{$name}";

        if ($name === '.' || $name === '..' || !is_dir($path) || is_link($path)) {
            continue;
        }

        if (phpFiles($path) !== []) {
            $folders[] = $name;
        }
    }

    sort($folders, SORT_STRING);

    return $folders;
}

function phpFiles(string $directory): array
{
    $files = [];
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS | FilesystemIterator::UNIX_PATHS)
    );

    foreach ($iterator as $file) {
        if ($file->isFile() && strtolower($file->getExtension()) === 'php') {
            $files[] = substr($file->getPathname(), \strlen($directory) + 1);
        }
    }

    sort($files, SORT_STRING);

    return $files;
}

function readList(string $path): array
{
    $contents = file_get_contents($path);

    if ($contents === false) {
        throw new RuntimeException("Cannot read {$path}");
    }

    $lines = explode("\n", str_replace("\r\n", "\n", $contents));

    if (end($lines) === '') {
        array_pop($lines);
    }

    return array_map('trim', $lines);
}

function writeList(string $path, array $entries): void
{
    $entries = array_values(array_unique($entries));
    sort($entries, SORT_STRING);

    if (file_put_contents($path, $entries === [] ? '' : implode("\n", $entries) . "\n") === false) {
        throw new RuntimeException("Cannot write {$path}");
    }
}

function displayPath(string $root, string $path): string
{
    $directory = realpath(\dirname($path));
    $absolute = $directory === false ? $path : $directory . '/' . basename($path);

    return strpos($absolute, $root . '/') === 0 ? substr($absolute, \strlen($root) + 1) : $path;
}

function formatProblem(string $file, int $line, string $message): string
{
    $location = $line > 0 ? "{$file}:{$line}" : $file;

    if (getenv('GITHUB_ACTIONS') === 'true') {
        $properties = $line > 0 ? "file={$file},line={$line}" : "file={$file}";

        return "::error {$properties}::{$location}: {$message}";
    }

    return "{$location}: {$message}";
}

exit(main(\array_slice($argv, 1)));
