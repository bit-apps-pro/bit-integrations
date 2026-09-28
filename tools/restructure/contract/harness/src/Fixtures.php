<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use RuntimeException;

final class Fixtures
{
    private string $dir;

    /**
     * @var list<string>|null
     */
    private ?array $allowedDiagnostics = null;

    public function __construct(Workspace $workspace)
    {
        $this->dir = $workspace->harnessDir . '/fixtures';
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function http(string $integration): array
    {
        $rules = [];

        foreach ([$integration, '_common'] as $name) {
            foreach ($this->json("http/{$name}.json") ?? [] as $index => $rule) {
                $rule['id'] ??= "{$name}#{$index}";
                $rules[] = $rule;
            }
        }

        return $rules;
    }

    /**
     * @return array<string, mixed>
     */
    public function params(string $integration): array
    {
        return ($this->json("params/{$integration}.json") ?? []) + ($this->json('params/_common.json') ?? []);
    }

    /**
     * @return array<string, array<string, mixed>> fixture name => fixture flow
     */
    public function flows(string $integration): array
    {
        $flows = [];

        foreach (glob($this->dir . "/flows/{$integration}/*.json") ?: [] as $file) {
            $flows[basename($file, '.json')] = $this->json(substr($file, \strlen($this->dir) + 1));
        }

        ksort($flows, SORT_STRING);

        return $flows;
    }

    /**
     * Whether a new PHP error or error_log line is expected noise, per fixtures/allowed-diagnostics.txt
     * (one PCRE per line, # comments).
     */
    public function diagnosticAllowed(string $line): bool
    {
        if ($this->allowedDiagnostics === null) {
            $this->allowedDiagnostics = [];
            $file = $this->dir . '/allowed-diagnostics.txt';

            foreach (is_file($file) ? (array) file($file, FILE_IGNORE_NEW_LINES) : [] as $pattern) {
                $pattern = trim((string) $pattern);

                if ($pattern === '' || str_starts_with($pattern, '#')) {
                    continue;
                }

                if (@preg_match($pattern, '') === false) {
                    throw new RuntimeException("allowed-diagnostics.txt: bad pattern {$pattern}");
                }

                $this->allowedDiagnostics[] = $pattern;
            }
        }

        foreach ($this->allowedDiagnostics as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<string, string> route record name => why its handler cannot reach HTTP here
     */
    public function coverageExempt(): array
    {
        return array_map('strval', $this->json('coverage-exempt.json') ?? []);
    }

    private function json(string $relative): ?array
    {
        $file = $this->dir . '/' . $relative;

        if (!is_file($file)) {
            return null;
        }

        $decoded = json_decode((string) file_get_contents($file), true);

        if (!\is_array($decoded)) {
            throw new RuntimeException("fixture {$relative} is not valid JSON");
        }

        return $decoded;
    }
}
