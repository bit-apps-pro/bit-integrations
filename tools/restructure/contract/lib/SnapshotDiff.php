<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

final class SnapshotDiff
{
    private const CLASS_FIELDS = ['class', 'handlerClass', 'authConfigOwner'];

    /**
     * @var list<string>
     */
    private array $problems = [];

    /**
     * @var array<string, int>
     */
    private array $acceptedRenames = [];

    public function __construct(private ClassRenames $renames)
    {
    }

    /**
     * @param array<mixed> $base
     * @param array<mixed> $head
     */
    public function compare(array $base, array $head): void
    {
        $this->walk([], $base, $head);
        sort($this->problems, SORT_STRING);
        ksort($this->acceptedRenames, SORT_STRING);
    }

    /**
     * @return list<string>
     */
    public function problems(): array
    {
        return $this->problems;
    }

    /**
     * @return array<string, int> "base -> head" => occurrences
     */
    public function acceptedRenames(): array
    {
        return $this->acceptedRenames;
    }

    /**
     * @param list<string> $path
     */
    private function walk(array $path, mixed $base, mixed $head): void
    {
        if (\is_array($base) && \is_array($head)) {
            foreach ($base as $key => $value) {
                if (!\array_key_exists($key, $head)) {
                    $this->problem([...$path, (string) $key], 'missing in head' . self::detail('base', $value));

                    continue;
                }

                $this->walk([...$path, (string) $key], $value, $head[$key]);
            }

            foreach ($head as $key => $value) {
                if (!\array_key_exists($key, $base)) {
                    $this->problem([...$path, (string) $key], 'only in head' . self::detail('head', $value));
                }
            }

            return;
        }

        if ($base === $head) {
            return;
        }

        $field = $path === [] ? '' : $path[\count($path) - 1];

        if (\in_array($field, self::CLASS_FIELDS, true) && \is_string($base) && \is_string($head)) {
            if ($this->renames->allows($base, $head)) {
                $rename = "{$base} -> {$head}";
                $this->acceptedRenames[$rename] = ($this->acceptedRenames[$rename] ?? 0) + 1;

                return;
            }

            $this->problem($path, "class {$base} -> {$head} is not an allowed rename");

            return;
        }

        $this->problem($path, 'base ' . self::show($base) . ', head ' . self::show($head));
    }

    /**
     * @param list<string> $path
     */
    private function problem(array $path, string $message): void
    {
        $this->problems[] = implode(' > ', $path) . ": {$message}";
    }

    private static function detail(string $side, mixed $value): string
    {
        return \is_array($value) ? '' : " ({$side} " . self::show($value) . ')';
    }

    private static function show(mixed $value): string
    {
        $encoded = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        if ($encoded === false) {
            return get_debug_type($value);
        }

        return \strlen($encoded) > 160 ? substr($encoded, 0, 157) . '...' : $encoded;
    }
}
