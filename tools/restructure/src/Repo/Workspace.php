<?php

declare(strict_types=1);

namespace BitApps\Restructure\Repo;

use BitApps\Restructure\Php\Source;
use RuntimeException;

final class Workspace
{
    public const ACTIONS_DIR = 'backend/Actions';

    public const ACTIONS_NAMESPACE = 'BitApps\\Integrations\\Actions';

    /**
     * @var array<string, Source|null>
     */
    private array $sources = [];

    /**
     * @var array<string, string>
     */
    private array $errors = [];

    public function __construct(public readonly Tree $tree)
    {
    }

    public function source(string $path): ?Source
    {
        if (\array_key_exists($path, $this->sources)) {
            return $this->sources[$path];
        }

        $code = $this->tree->read($path);

        if ($code === null) {
            return $this->sources[$path] = null;
        }

        try {
            return $this->sources[$path] = Source::fromString($path, $code);
        } catch (RuntimeException $e) {
            $this->errors[$path] = $e->getMessage();

            return $this->sources[$path] = null;
        }
    }

    public function mustSource(string $path): Source
    {
        $source = $this->source($path);

        if ($source === null) {
            throw new RuntimeException($this->errors[$path] ?? "Cannot read {$path} from the {$this->tree->label()}");
        }

        return $source;
    }

    public function parseError(string $path): ?string
    {
        return $this->errors[$path] ?? null;
    }

    public function forget(string $path): void
    {
        unset($this->sources[$path], $this->errors[$path]);
        $this->tree->forget($path);
    }

    /**
     * @return list<string> folder names under backend/Actions that hold <N>Controller.php
     */
    public function integrations(): array
    {
        $names = [];

        foreach ($this->tree->subdirectories(self::ACTIONS_DIR) as $folder) {
            if ($this->tree->exists(self::ACTIONS_DIR . "/{$folder}/{$folder}Controller.php")) {
                $names[] = $folder;
            }
        }

        return $names;
    }

    /**
     * @return list<string> every PHP file in backend/Actions/<N>/, sorted
     */
    public function folderPhpFiles(string $folder): array
    {
        return array_values(array_filter(
            $this->tree->files(self::ACTIONS_DIR . '/' . $folder),
            static fn (string $path): bool => str_ends_with($path, '.php')
        ));
    }
}
