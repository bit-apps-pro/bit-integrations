<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use BitApps\Restructure\Analyze\IntegrationPlan;
use BitApps\Restructure\Analyze\RenameMap;
use BitApps\Restructure\Repo\Workspace;
use RuntimeException;

final class UnitChange
{
    /**
     * @var array<string, string> from => to
     */
    public array $moves = [];

    /**
     * @var array<string, string> path => content, after the moves
     */
    public array $contents = [];

    /**
     * @var list<string>
     */
    public array $created = [];

    /**
     * @var list<string>
     */
    public array $edited = [];

    /**
     * @param list<IntegrationPlan> $plans
     */
    public static function compute(Workspace $workspace, array $plans): self
    {
        $change = new self();
        $renames = new RenameMap();
        $renamed = [];
        $byFile = [];
        $owned = [];

        foreach ($plans as $plan) {
            $renames->merge($plan->renames);
            $renamed[$plan->controllerFqcn] = true;
            $owned[$plan->controllerPath] = true;

            foreach ($plan->services as $service) {
                $renamed[$service['fromClass']] = true;
                $owned[$service['from']] = true;
            }

            foreach ($plan->references as $reference) {
                $byFile[$reference->file][$reference->id()] = $reference;
            }
        }

        foreach ($plans as $plan) {
            $splitter = new ControllerSplitter($plan, $renames, array_values($byFile[$plan->controllerPath] ?? []), $renamed);
            $change->moves[$plan->controllerPath] = $plan->moveTarget === IntegrationPlan::ACTION ? $plan->actionPath : $plan->helperPath;

            foreach ($splitter->render() as $path => $content) {
                $change->put($path, $content);

                if ($path !== $change->moves[$plan->controllerPath]) {
                    if ($workspace->tree->exists($path)) {
                        $change->edited[] = $path;
                    } else {
                        $change->created[] = $path;
                    }
                }
            }

            foreach ($plan->services as $service) {
                $source = $workspace->mustSource($service['from']);
                $class = $source->findClass(basename($service['from'], '.php')) ?? throw new RuntimeException("{$service['from']} does not declare its class");
                $content = (new FileRewriter($renames))->rewrite($source, array_values($byFile[$service['from']] ?? []), [$class, basename($service['to'], '.php')]);
                $change->moves[$service['from']] = $service['to'];
                $change->put($service['to'], $content);
            }
        }

        ksort($byFile, SORT_STRING);

        foreach ($byFile as $file => $references) {
            if (isset($owned[$file])) {
                continue;
            }

            $content = (new FileRewriter($renames))->rewrite($workspace->mustSource((string) $file), array_values($references));
            $change->put((string) $file, $content);
            $change->edited[] = (string) $file;
        }

        foreach ($change->moves as $from => $to) {
            if ($workspace->tree->exists($to)) {
                throw new RuntimeException("Cannot move {$from}: {$to} already exists");
            }
        }

        foreach ($change->created as $path) {
            if ($workspace->tree->exists($path)) {
                throw new RuntimeException("Cannot create {$path}: it already exists");
            }
        }

        sort($change->created, SORT_STRING);
        $change->edited = array_values(array_unique($change->edited));
        sort($change->edited, SORT_STRING);
        ksort($change->contents, SORT_STRING);

        return $change;
    }

    /**
     * @return list<string> every path the unit touches, old and new
     */
    public function paths(): array
    {
        $paths = array_merge(array_keys($this->moves), array_values($this->moves), array_keys($this->contents));
        $paths = array_values(array_unique(array_map('strval', $paths)));
        sort($paths, SORT_STRING);

        return $paths;
    }

    private function put(string $path, string $content): void
    {
        if (isset($this->contents[$path]) && $this->contents[$path] !== $content) {
            throw new RuntimeException("Two rewrites of {$path} disagree; apply this unit by hand");
        }

        $this->contents[$path] = $content;
    }
}
