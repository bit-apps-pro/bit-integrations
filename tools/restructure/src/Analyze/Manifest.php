<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Support\Json;
use PhpParser\Node\Stmt;
use RuntimeException;

final class Manifest
{
    public const SCHEMA = 1;

    /**
     * @return array<string, mixed>
     */
    public static function fromPlan(IntegrationPlan $plan): array
    {
        $manifest = [
            'schema'       => self::SCHEMA,
            'integration'  => $plan->folder,
            'namespace'    => $plan->namespace,
            'unit'         => $plan->unit,
            'refused'      => $plan->isRefused(),
            'refusals'     => $plan->refusals,
            'tests'        => $plan->tests,
            'sourceHashes' => $plan->hashes,
        ];

        if ($plan->layout === null) {
            return $manifest;
        }

        $crossingByEdge = [];

        foreach ($plan->crossings as $crossing) {
            $crossingByEdge[spl_object_id($crossing['edge'])] = $crossing['replacement'];
        }

        $members = [];

        foreach ($plan->layout->members as $member) {
            if (!$member->isCode()) {
                continue;
            }

            $members[] = array_filter([
                'key'         => $member->key,
                'kind'        => $member->kind,
                'names'       => $member->names,
                'static'      => $member->isStatic(),
                'visibility'  => $member->visibility(),
                'lines'       => [$member->startLine, $member->endLine],
                'placement'   => $plan->placement[$member->key] ?? null,
                'reason'      => $plan->reasons[$member->key] ?? null,
                'reachedFrom' => $plan->reach[$member->key] ?? [],
                'widenTo'     => $plan->widen[$member->key] ?? null,
            ], static fn ($value) => $value !== null);
        }

        $execute = $plan->layout->member('method:execute');
        $callGraph = [];

        foreach ($plan->graph?->edges ?? [] as $edge) {
            $replacement = $crossingByEdge[spl_object_id($edge)] ?? null;
            $callGraph[] = $edge->describe() + ($replacement === null ? [] : ['crosses' => true, 'rewriteTo' => $replacement]);
        }

        $references = [];

        foreach ($plan->references as $reference) {
            $target = $reference->isImport()
                ? $plan->renames->importTargets($reference, $plan->references)
                : $plan->renames->target($reference->target, $reference->member, $reference->kind);
            $references[] = $reference->describe() + ['rewriteTo' => \is_array($target) && \count($target) === 1 ? $target[0] : $target];
        }

        $manifest += [
            'controller' => [
                'path'                      => $plan->controllerPath,
                'class'                     => $plan->controllerFqcn,
                'modifiers'                 => $plan->modifiers,
                'extends'                   => $plan->parent,
                'constructorRequiredParams' => $plan->ctorRequired,
                'executeStatic'             => $execute?->isStatic(),
                'lines'                     => $plan->layout->source->lineOf(\strlen($plan->layout->source->code)),
            ],
            'targets'         => self::targets($plan),
            'members'         => $members,
            'serviceMembers'  => $plan->serviceMembers,
            'constructorCopy' => $plan->ctorCopy === null ? null : ['statements' => $plan->ctorCopy, 'properties' => $plan->ctorCopyProperties],
            'routes'          => array_map(static fn (array $route) => [
                'file'   => $route['file'],
                'line'   => $route['line'],
                'verb'   => $route['verb'],
                'route'  => $route['route'],
                'method' => $route['method'],
                'target' => $plan->renames->target($plan->controllerFqcn, $route['key'], Reference::CALLABLE),
            ], $plan->routes),
            'hooks' => array_map(static fn (array $hook) => [
                'file'   => $hook['file'],
                'line'   => $hook['line'],
                'hook'   => $hook['hook'],
                'method' => $hook['method'],
                'target' => $plan->renames->target($plan->controllerFqcn, $hook['key'], Reference::CALLABLE),
            ], $plan->hooks),
            'callGraph'  => $callGraph,
            'references' => $references,
            'renames'    => $plan->renames->toManifest(),
            'memberMap'  => self::memberMap($plan),
            'sources'    => self::sources($plan),
            'fileOps'    => self::fileOps($plan),
            'flags'      => $plan->flags,
        ];

        return $manifest;
    }

    public static function path(string $directory, string $folder): string
    {
        return rtrim($directory, '/') . '/' . $folder . '.json';
    }

    /**
     * @return array<string, mixed>
     */
    public static function load(string $directory, string $folder): array
    {
        $path = self::path($directory, $folder);

        if (!is_file($path)) {
            throw new RuntimeException("No manifest for {$folder} at {$path}; run `bi analyze --only {$folder}` first");
        }

        $manifest = Json::decodeFile($path);

        if (($manifest['schema'] ?? null) !== self::SCHEMA || ($manifest['integration'] ?? null) !== $folder) {
            throw new RuntimeException("{$path} is not a schema " . self::SCHEMA . " manifest for {$folder}");
        }

        return $manifest;
    }

    /**
     * @param array<string, mixed> $manifest
     *
     * @return array<string, string>
     */
    public static function placements(array $manifest): array
    {
        $placements = [];

        foreach ($manifest['members'] ?? [] as $member) {
            if (isset($member['key'], $member['placement'])) {
                $placements[(string) $member['key']] = (string) $member['placement'];
            }
        }

        return $placements;
    }

    /**
     * @param array<string, mixed> $manifest
     *
     * @return list<int>|null
     */
    public static function constructorCopy(array $manifest): ?array
    {
        $copy = $manifest['constructorCopy'] ?? null;

        return \is_array($copy) ? array_map('intval', $copy['statements'] ?? []) : null;
    }

    public static function isConstructor(Stmt $stmt): bool
    {
        return $stmt instanceof Stmt\ClassMethod && $stmt->name->toLowerString() === '__construct';
    }

    /**
     * @return array<string, mixed>
     */
    private static function targets(IntegrationPlan $plan): array
    {
        $helperOrigin = match (true) {
            $plan->helperExists                           => 'existing file; members are inserted',
            !$plan->hasHelperMembers()                    => 'none',
            $plan->moveTarget === IntegrationPlan::HELPER => 'git mv of the Controller',
            default                                       => 'created',
        };

        return [
            'action' => [
                'path'   => $plan->actionPath,
                'class'  => $plan->actionFqcn,
                'origin' => $plan->moveTarget === IntegrationPlan::ACTION ? 'git mv of the Controller' : 'created',
            ],
            'helper' => [
                'path'   => $plan->helperPath,
                'class'  => $plan->helperFqcn,
                'origin' => $helperOrigin,
            ],
            'services' => $plan->services,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function memberMap(IntegrationPlan $plan): array
    {
        $map = [$plan->controllerFqcn => $plan->holders()];

        foreach ($plan->services as $service) {
            $map[$service['fromClass']] = ['*' => [$service['toClass']]];
        }

        ksort($map, SORT_STRING);

        return $map;
    }

    /**
     * @return array<string, list<string>>
     */
    private static function sources(IntegrationPlan $plan): array
    {
        $sources = [$plan->actionPath => [$plan->controllerPath]];

        if ($plan->hasHelperMembers()) {
            $sources[$plan->helperPath] = $plan->helperExists ? [$plan->controllerPath, $plan->helperPath] : [$plan->controllerPath];
        }

        foreach ($plan->services as $service) {
            $sources[$service['to']] = [$service['from']];
        }

        ksort($sources, SORT_STRING);

        return $sources;
    }

    /**
     * @return list<array<string, string>>
     */
    private static function fileOps(IntegrationPlan $plan): array
    {
        $ops = [];
        $moveTo = $plan->moveTarget === IntegrationPlan::HELPER ? $plan->helperPath : $plan->actionPath;
        $ops[] = ['op' => 'git-mv', 'from' => $plan->controllerPath, 'to' => $moveTo];

        if ($plan->moveTarget === IntegrationPlan::HELPER) {
            $ops[] = ['op' => 'create', 'path' => $plan->actionPath];
        } elseif ($plan->hasHelperMembers()) {
            $ops[] = ['op' => $plan->helperExists ? 'insert' : 'create', 'path' => $plan->helperPath];
        }

        if ($plan->shim !== null) {
            $ops[] = ['op' => PermanentShims::OP] + $plan->shim;
        }

        foreach ($plan->services as $service) {
            $ops[] = ['op' => 'git-mv', 'from' => $service['from'], 'to' => $service['to']];
        }

        foreach ($plan->editedFiles as $file) {
            $ops[] = ['op' => 'edit', 'path' => $file];
        }

        return $ops;
    }
}
