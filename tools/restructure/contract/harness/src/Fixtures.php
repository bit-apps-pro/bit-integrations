<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use RuntimeException;

final class Fixtures
{
    private string $dir;

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
