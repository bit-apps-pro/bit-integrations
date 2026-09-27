<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use RuntimeException;

final class Store
{
    private ?string $recordDir;

    private ?string $compareDir;

    public function __construct(Options $options)
    {
        $this->recordDir = self::normalize($options->get('record'));
        $this->compareDir = self::normalize($options->get('compare'));

        if ($this->recordDir !== null && !is_dir($this->recordDir) && !mkdir($this->recordDir, 0775, true) && !is_dir($this->recordDir)) {
            throw new RuntimeException("cannot create {$this->recordDir}");
        }

        if ($this->compareDir !== null && !is_dir($this->compareDir)) {
            throw new RuntimeException("baseline directory not found: {$this->compareDir}");
        }
    }

    public function mode(): string
    {
        return $this->recordDir !== null ? 'record' : ($this->compareDir !== null ? 'compare' : 'dry');
    }

    public function baseline(string $name): mixed
    {
        if ($this->compareDir === null) {
            return null;
        }

        $file = $this->compareDir . '/' . $name . '.json';

        return is_readable($file) ? json_decode((string) file_get_contents($file)) : null;
    }

    /**
     * @return list<string> record names in the baseline for this integration and kind
     */
    public function baselineNames(string $integration, string $kind): array
    {
        if ($this->compareDir === null) {
            return [];
        }

        $names = [];
        foreach (glob($this->compareDir . '/' . $integration . '__*.json') ?: [] as $file) {
            $record = json_decode((string) file_get_contents($file));
            if (\is_object($record) && ($record->kind ?? null) === $kind) {
                $names[] = basename($file, '.json');
            }
        }
        sort($names, SORT_STRING);

        return $names;
    }

    public function clear(string $integration, string $kind): void
    {
        if ($this->recordDir === null) {
            return;
        }

        foreach (glob($this->recordDir . '/' . $integration . '__*.json') ?: [] as $file) {
            $record = json_decode((string) file_get_contents($file));
            if (\is_object($record) && ($record->kind ?? null) === $kind) {
                unlink($file);
            }
        }
    }

    public function write(string $name, mixed $record): void
    {
        if ($this->recordDir === null) {
            return;
        }

        file_put_contents($this->recordDir . '/' . $name . '.json', Canon::encode($record));
    }

    private static function normalize(?string $dir): ?string
    {
        return $dir === null ? null : rtrim($dir, '/');
    }
}
