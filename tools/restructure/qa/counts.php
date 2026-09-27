<?php

declare(strict_types=1);

namespace BitApps\Restructure\Qa\Counts;

use FilesystemIterator;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RuntimeException;

function needles(): array
{
    return [
        'legacy_prefix_literal' => "'" . 'btc' . 'bi_',
        'prefix_literal'        => "'" . implode('_', ['bit', 'integrations']) . '_',
        'log_handler_save'      => 'LogHandler::save',
        'config_with_prefix'    => 'Config::withPrefix(',
    ];
}

function usage(): string
{
    $lines = [];

    foreach (needles() as $key => $needle) {
        $lines[] = \sprintf('      %-22s %s', $key, $needle);
    }

    return "Usage:\n"
        . "  php counts.php [<dir>] [--expect key=value,key=value]\n\n"
        . "Counts occurrences of each needle in every file under <dir> (default:\n"
        . "backend/Actions of this repository), like `grep -ro <needle> <dir> | wc -l`,\n"
        . "and prints them as key=value lines:\n"
        . implode("\n", $lines) . "\n\n"
        . "--expect exits 1 when a listed count differs; 2 is bad usage.\n";
}

function main(array $argv): int
{
    try {
        [$directory, $expected, $help] = parseArguments(\array_slice($argv, 1));
    } catch (RuntimeException $exception) {
        fwrite(STDERR, $exception->getMessage() . "\n\n" . usage());

        return 2;
    }

    if ($help) {
        fwrite(STDOUT, usage());

        return 0;
    }

    if (!is_dir($directory)) {
        fwrite(STDERR, "Not a directory: {$directory}\n");

        return 2;
    }

    $counts = countNeedles($directory, needles());
    $mismatches = [];

    foreach ($counts as $key => $count) {
        fwrite(STDOUT, "{$key}={$count}\n");

        if (isset($expected[$key]) && $expected[$key] !== $count) {
            $mismatches[] = "{$key}: expected {$expected[$key]}, found {$count}";
        }
    }

    if ($mismatches !== []) {
        fwrite(STDERR, implode("\n", $mismatches) . "\n");

        return 1;
    }

    return 0;
}

function parseArguments(array $arguments): array
{
    $directory = null;
    $expected = [];
    $help = false;

    for ($index = 0; $index < \count($arguments); $index++) {
        $argument = $arguments[$index];

        if ($argument === '-h' || $argument === '--help') {
            $help = true;

            continue;
        }

        if ($argument === '--expect' || str_starts_with($argument, '--expect=')) {
            $value = $argument === '--expect' ? ($arguments[++$index] ?? '') : substr($argument, \strlen('--expect='));
            $expected = array_merge($expected, parseExpectations($value));

            continue;
        }

        if (str_starts_with($argument, '-') || $directory !== null) {
            throw new RuntimeException("Unexpected argument {$argument}.");
        }

        $directory = $argument;
    }

    return [$directory ?? \dirname(__DIR__, 3) . '/backend/Actions', $expected, $help];
}

function parseExpectations(string $value): array
{
    $expected = [];

    foreach (array_filter(array_map('trim', explode(',', $value)), 'strlen') as $pair) {
        if (!preg_match('/^([a-z_]+)=(\d+)$/', $pair, $match) || !\array_key_exists($match[1], needles())) {
            throw new RuntimeException("Invalid expectation {$pair}.");
        }

        $expected[$match[1]] = (int) $match[2];
    }

    if ($expected === []) {
        throw new RuntimeException('--expect needs key=value pairs.');
    }

    return $expected;
}

function countNeedles(string $directory, array $needles): array
{
    $counts = array_fill_keys(array_keys($needles), 0);
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS));

    foreach ($files as $file) {
        if (!$file->isFile() || $file->isLink()) {
            continue;
        }

        $contents = (string) file_get_contents($file->getPathname());

        foreach ($needles as $key => $needle) {
            $counts[$key] += substr_count($contents, $needle);
        }
    }

    return $counts;
}

exit(main($argv));
