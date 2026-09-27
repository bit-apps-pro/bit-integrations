<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Repo\Workspace;

final class PlanContext
{
    /**
     * @param array<string, array{folder: string, role: string, path: string}> $candidates FQCN => class that a move renames
     * @param array<string, list<string>>                                      $units      folder => coupled group, sorted
     */
    private function __construct(
        public readonly Workspace $workspace,
        public readonly array $candidates,
        public readonly ReferenceIndex $index,
        public readonly array $units,
        public readonly ?ProIndex $pro,
    ) {
    }

    public static function build(Workspace $workspace, ?ProIndex $pro): self
    {
        $candidates = [];

        foreach ($workspace->integrations() as $folder) {
            foreach ($workspace->folderPhpFiles($folder) as $path) {
                if (\dirname($path) !== Naming::folderPath($folder)) {
                    continue;
                }

                $class = basename($path, '.php');

                if ($class === Naming::controller($folder)) {
                    $candidates[Naming::fqcn($folder, $class)] = ['folder' => $folder, 'role' => 'controller', 'path' => $path];
                } elseif (Naming::isApiHelper($class)) {
                    $candidates[Naming::fqcn($folder, $class)] = ['folder' => $folder, 'role' => 'apiHelper', 'path' => $path];
                }
            }
        }

        ksort($candidates, SORT_STRING);
        $index = ReferenceIndex::build($workspace, array_fill_keys(array_keys($candidates), true));

        return new self($workspace, $candidates, $index, self::units($candidates, $index), $pro);
    }

    /**
     * @return list<string>
     */
    public function unitOf(string $folder): array
    {
        return $this->units[$folder] ?? [$folder];
    }

    /**
     * @return list<string>
     */
    public function candidatesOf(string $folder): array
    {
        $classes = [];

        foreach ($this->candidates as $fqcn => $info) {
            if ($info['folder'] === $folder) {
                $classes[] = $fqcn;
            }
        }

        return $classes;
    }

    public static function folderOfPath(string $path): ?string
    {
        $prefix = Workspace::ACTIONS_DIR . '/';

        if (!str_starts_with($path, $prefix)) {
            return null;
        }

        $rest = substr($path, \strlen($prefix));
        $slash = strpos($rest, '/');

        return $slash === false ? null : substr($rest, 0, $slash);
    }

    /**
     * @param array<string, array{folder: string, role: string, path: string}> $candidates
     *
     * @return array<string, list<string>>
     */
    private static function units(array $candidates, ReferenceIndex $index): array
    {
        $parent = [];
        $find = static function (string $folder) use (&$parent, &$find): string {
            $parent[$folder] ??= $folder;

            if ($parent[$folder] !== $folder) {
                $parent[$folder] = $find($parent[$folder]);
            }

            return $parent[$folder];
        };

        $folders = array_fill_keys(array_column($candidates, 'folder'), true);

        foreach ($candidates as $fqcn => $info) {
            $find($info['folder']);

            foreach ($index->to($fqcn) as $reference) {
                $from = self::folderOfPath($reference->file);

                if ($from === null || $from === $info['folder'] || !isset($folders[$from])) {
                    continue;
                }

                $a = $find($from);
                $b = $find($info['folder']);

                if ($a !== $b) {
                    $parent[max($a, $b)] = min($a, $b);
                }
            }
        }

        $groups = [];

        foreach (array_keys($parent) as $folder) {
            $groups[$find((string) $folder)][] = (string) $folder;
        }

        $units = [];

        foreach ($groups as $members) {
            sort($members, SORT_STRING);

            foreach ($members as $folder) {
                $units[$folder] = $members;
            }
        }

        ksort($units, SORT_STRING);

        return $units;
    }
}
