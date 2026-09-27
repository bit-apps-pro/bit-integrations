<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

final class RenameMap
{
    /**
     * @var array<string, string> old FQCN => new FQCN, for classes renamed as a whole
     */
    private array $whole = [];

    /**
     * @var array<string, array{primary: string, members: array<string, list<string>>, external: array<string, string>}>
     */
    private array $split = [];

    public function renameWhole(string $from, string $to): void
    {
        $this->whole[$from] = $to;
    }

    /**
     * @param array<string, list<string>> $members  member key => classes that hold it after the move
     * @param array<string, string>       $external member key => class other files must use
     */
    public function split(string $from, string $primary, array $members, array $external): void
    {
        $this->split[$from] = ['primary' => $primary, 'members' => $members, 'external' => $external];
    }

    public function merge(self $other): void
    {
        $this->whole = $other->whole + $this->whole;
        $this->split = $other->split + $this->split;
    }

    public function isRenamed(string $fqcn): bool
    {
        return isset($this->whole[$fqcn]) || isset($this->split[$fqcn]);
    }

    public function isSplit(string $fqcn): bool
    {
        return isset($this->split[$fqcn]);
    }

    public function primary(string $fqcn): ?string
    {
        return $this->whole[$fqcn] ?? $this->split[$fqcn]['primary'] ?? null;
    }

    /**
     * The class a reference from outside the moved class must name after the move.
     */
    public function target(string $fqcn, ?string $member, string $kind): ?string
    {
        if (isset($this->whole[$fqcn])) {
            return $this->whole[$fqcn];
        }

        if (!isset($this->split[$fqcn])) {
            return null;
        }

        $split = $this->split[$fqcn];

        if ($member === null || \in_array($kind, [Reference::CLASS_NAME, Reference::TYPE, Reference::INSTANCEOF, Reference::EXTENDS, Reference::IMPLEMENTS, Reference::NAME, Reference::STRING_FQCN, Reference::CATCH, Reference::IMPORT], true)) {
            return $split['primary'];
        }

        return $split['external'][$member] ?? $split['primary'];
    }

    /**
     * The classes an import of a renamed class must bring in: one per class its code references now name.
     *
     * @param iterable<Reference> $references every reference in the importing file
     *
     * @return list<string>
     */
    public function importTargets(Reference $import, iterable $references): array
    {
        $targets = [];

        foreach ($references as $reference) {
            if (
                $reference->file === $import->file && !$reference->isImport() && $reference->target === $import->target
                && $reference->style === 'unqualified' && strcasecmp((string) $reference->alias, (string) $import->alias) === 0
            ) {
                $targets[(string) $this->target($reference->target, $reference->member, $reference->kind)] = true;
            }
        }

        if ($targets === []) {
            $targets[(string) $this->primary($import->target)] = true;
        }

        $targets = array_map('strval', array_keys($targets));
        sort($targets, SORT_STRING);

        return $targets;
    }

    /**
     * @return list<string> the classes that hold the member after the move
     */
    public function holders(string $fqcn, string $member): array
    {
        if (isset($this->whole[$fqcn])) {
            return [$this->whole[$fqcn]];
        }

        return $this->split[$fqcn]['members'][$member] ?? [];
    }

    /**
     * @return array<string, list<string>|string>
     */
    public function toManifest(): array
    {
        $out = [];

        foreach ($this->whole as $from => $to) {
            $out[$from] = $to;
        }

        foreach ($this->split as $from => $split) {
            $targets = [$split['primary']];

            foreach ($split['members'] as $holders) {
                foreach ($holders as $holder) {
                    $targets[] = $holder;
                }
            }

            $targets = array_values(array_unique($targets));
            sort($targets, SORT_STRING);
            $out[$from] = \count($targets) === 1 ? $targets[0] : $targets;
        }

        ksort($out, SORT_STRING);

        return $out;
    }
}
