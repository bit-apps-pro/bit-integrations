<?php

declare(strict_types=1);

namespace BitApps\Restructure\Verify;

use FilesystemIterator;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RuntimeException;

final class TestResults
{
    /**
     * Evidence each plan 8.5 test needs: the harness results that must exist and pass.
     */
    public const EVIDENCE = [
        'T1' => ['T1'],
        'T2' => ['T2'],
        'T3' => ['T3'],
        'T4' => ['route-smoke', 'flow-smoke'],
        'T5' => ['route-smoke', 'flow-smoke'],
        'T6' => ['route-smoke', 'flow-smoke'],
    ];

    public static function folderDigest(string $freeRoot, string $folder): string
    {
        $dir = rtrim($freeRoot, '/') . '/backend/Actions/' . $folder;

        if (!is_dir($dir)) {
            return 'missing';
        }

        $entries = [];
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $relative = substr($file->getPathname(), \strlen($dir) + 1);
                $entries[$relative] = $relative . "\0" . sha1((string) file_get_contents($file->getPathname()));
            }
        }

        ksort($entries, SORT_STRING);

        return sha1(implode("\n", $entries));
    }

    /**
     * @param array<string, array{ok: bool, detail: string}> $results
     */
    public static function record(string $dir, string $integration, string $digest, array $results): void
    {
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("cannot create {$dir}");
        }

        $existing = self::load($dir, $integration);
        $merged = ($existing !== null && ($existing['tree'] ?? null) === $digest) ? (array) ($existing['results'] ?? []) : [];

        foreach ($results as $name => $result) {
            $merged[$name] = ['detail' => $result['detail'], 'ok' => $result['ok']];
        }

        ksort($merged, SORT_STRING);
        $document = ['integration' => $integration, 'results' => $merged, 'tree' => $digest];
        file_put_contents(self::path($dir, $integration), json_encode($document, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n");
    }

    /**
     * @param list<string> $required plan 8.5 test ids from the manifest
     *
     * @return array{problems: list<string>, satisfied: list<string>}
     */
    public static function check(string $dir, string $integration, string $digest, array $required): array
    {
        $problems = [];
        $satisfied = [];
        $document = self::load($dir, $integration);

        if ($required === []) {
            return ['problems' => [], 'satisfied' => []];
        }

        if ($document === null) {
            return ['problems' => ['no harness results in ' . basename($dir) . '/' . basename(self::path($dir, $integration)) . ' for ' . implode(', ', $required)], 'satisfied' => []];
        }

        if (($document['tree'] ?? null) !== $digest) {
            return ['problems' => ['the harness results were recorded against a different state of backend/Actions/' . $integration . '; re-run the harness on this tree'], 'satisfied' => []];
        }

        $results = (array) ($document['results'] ?? []);

        foreach ($required as $test) {
            $evidence = self::EVIDENCE[$test] ?? [$test];
            $missing = [];

            foreach ($evidence as $name) {
                $result = $results[$name] ?? null;

                if (!\is_array($result)) {
                    $missing[] = "{$name} has no result";
                } elseif (($result['ok'] ?? false) !== true) {
                    $missing[] = "{$name} failed: " . ($result['detail'] ?? '');
                }
            }

            if ($missing === []) {
                $satisfied[] = $test . ' (' . implode('; ', array_map(static fn (string $name) => $name . ': ' . ($results[$name]['detail'] ?? ''), $evidence)) . ')';
            } else {
                $problems[] = "{$test}: " . implode('; ', $missing);
            }
        }

        return ['problems' => $problems, 'satisfied' => $satisfied];
    }

    private static function path(string $dir, string $integration): string
    {
        return rtrim($dir, '/') . '/' . $integration . '.json';
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function load(string $dir, string $integration): ?array
    {
        $path = self::path($dir, $integration);

        if (!is_file($path)) {
            return null;
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return \is_array($decoded) ? $decoded : null;
    }
}
