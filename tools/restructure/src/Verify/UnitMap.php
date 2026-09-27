<?php

declare(strict_types=1);

namespace BitApps\Restructure\Verify;

use BitApps\Restructure\Analyze\Reference;

final class UnitMap
{
    /**
     * @var array<string, string> old FQCN => new FQCN, classes renamed whole
     */
    private array $whole = [];

    /**
     * @var array<string, array{primary: string, members: array<string, list<string>>}>
     */
    private array $split = [];

    /**
     * @param array<string, mixed> $manifest
     */
    public function add(array $manifest): void
    {
        $controller = (string) ($manifest['controller']['class'] ?? '');
        $action = (string) ($manifest['targets']['action']['class'] ?? '');

        foreach ($manifest['memberMap'] ?? [] as $old => $members) {
            if (isset($members['*'])) {
                $this->whole[(string) $old] = (string) $members['*'][0];
            } elseif ($old === $controller) {
                $this->split[$controller] = ['primary' => $action, 'members' => array_map(static fn ($holders) => array_values(array_map('strval', (array) $holders)), $members)];
            }
        }
    }

    public function isRenamed(string $fqcn): bool
    {
        return isset($this->whole[$fqcn]) || isset($this->split[$fqcn]);
    }

    public function isSplit(string $fqcn): bool
    {
        return isset($this->split[$fqcn]);
    }

    /**
     * @return list<string>
     */
    public function holders(string $fqcn, string $member): array
    {
        if (isset($this->whole[$fqcn])) {
            return [$this->whole[$fqcn]];
        }

        return $this->split[$fqcn]['members'][$member] ?? [];
    }

    public function primary(string $fqcn): ?string
    {
        return $this->whole[$fqcn] ?? $this->split[$fqcn]['primary'] ?? null;
    }

    /**
     * The class a reference from outside $fqcn names after the move; mirrors RenameMap::target.
     */
    public function external(string $fqcn, ?string $member, string $kind): string
    {
        if (isset($this->whole[$fqcn])) {
            return $this->whole[$fqcn];
        }

        if (!isset($this->split[$fqcn])) {
            return $fqcn;
        }

        if ($member === null || $kind !== Reference::STATIC_CALL && $kind !== Reference::CONST && $kind !== Reference::STATIC_PROP && $kind !== Reference::CALLABLE && $kind !== Reference::NEW) {
            return $this->split[$fqcn]['primary'];
        }

        if ($member === 'method:__construct') {
            return $this->split[$fqcn]['primary'];
        }

        $holders = $this->split[$fqcn]['members'][$member] ?? [];

        if (\count($holders) === 1) {
            return $holders[0];
        }

        foreach ($holders as $holder) {
            if (str_ends_with($holder, 'Helper')) {
                return $holder;
            }
        }

        return $this->split[$fqcn]['primary'];
    }
}
