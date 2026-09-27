<?php

declare(strict_types=1);

namespace BitApps\Restructure\Verify;

use BitApps\Restructure\Analyze\Bindings;
use BitApps\Restructure\Analyze\Naming;
use BitApps\Restructure\Php\ClassLayout;
use BitApps\Restructure\Php\Member;
use BitApps\Restructure\Php\Names;
use BitApps\Restructure\Repo\Workspace;
use BitApps\Restructure\Support\Lint;
use PhpParser\Modifiers;
use PhpParser\Node\Stmt;
use RuntimeException;

final class Verifier
{
    /**
     * @var list<array{ok: bool, check: string, detail: string}>
     */
    private array $results = [];

    public function __construct(
        private readonly Workspace $base,
        private readonly Workspace $head,
        private readonly UnitMap $map,
        private readonly Lint $lint,
    ) {
    }

    /**
     * @param array<string, mixed> $manifest
     *
     * @return list<array{ok: bool, check: string, detail: string}>
     */
    public function verify(array $manifest): array
    {
        $this->results = [];

        try {
            $this->checkBase($manifest);
            $this->checkGone($manifest);
            $this->checkController($manifest);
            $this->checkServices($manifest);
            $this->checkComments($manifest);
            $this->checkLint($manifest);
            $this->checkBindings($manifest);
            $this->checkPsr4($manifest);
        } catch (RuntimeException $e) {
            $this->fail('verify', $e->getMessage());
        }

        return $this->results;
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkBase(array $manifest): void
    {
        $stale = [];

        foreach ($manifest['sourceHashes'] ?? [] as $path => $hash) {
            $content = $this->base->tree->read((string) $path);

            if (($content === null ? 'missing' : sha1($content)) !== $hash) {
                $stale[] = (string) $path;
            }
        }

        if ($stale !== []) {
            throw new RuntimeException('the manifest does not describe the base ref; these files differ: ' . implode(', ', $stale));
        }

        $this->pass('manifest', 'matches the base ref (' . \count($manifest['sourceHashes'] ?? []) . ' source hashes)');
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkGone(array $manifest): void
    {
        $left = [];

        foreach ($manifest['fileOps'] ?? [] as $op) {
            if ($op['op'] === 'git-mv' && $this->head->tree->exists($op['from'])) {
                $left[] = $op['from'];
            }
        }

        $left === [] ? $this->pass('moved files', 'no Controller or *ApiHelper file left behind') : $this->fail('moved files', 'still present: ' . implode(', ', $left));
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkController(array $manifest): void
    {
        $controllerFqcn = (string) $manifest['controller']['class'];
        $base = $this->layout($this->base, (string) $manifest['controller']['path'], $controllerFqcn);
        $action = $this->layout($this->head, (string) $manifest['targets']['action']['path'], (string) $manifest['targets']['action']['class']);
        $helperOrigin = (string) $manifest['targets']['helper']['origin'];
        $helper = $helperOrigin === 'none' ? null : $this->layout($this->head, (string) $manifest['targets']['helper']['path'], (string) $manifest['targets']['helper']['class']);
        $classes = [(string) $manifest['targets']['action']['class'] => $action];

        if ($helper !== null) {
            $classes[(string) $manifest['targets']['helper']['class']] = $helper;
        }

        $expected = [];
        $compared = 0;
        $problems = [];
        $staticChanges = [];

        foreach ($manifest['members'] ?? [] as $entry) {
            $key = (string) $entry['key'];
            $baseMember = $base->member($key) ?? throw new RuntimeException("base Controller has no {$key}");
            $holders = match ($entry['placement']) {
                'action' => [(string) $manifest['targets']['action']['class']],
                'helper' => [(string) $manifest['targets']['helper']['class']],
                default  => [(string) $manifest['targets']['action']['class'], (string) $manifest['targets']['helper']['class']],
            };

            foreach ($holders as $holder) {
                $expected[$holder][$key] = true;
                $headMember = ($classes[$holder] ?? null)?->member($key);

                if ($headMember === null) {
                    $problems[] = "{$key} is missing from " . Naming::shortName($holder);

                    continue;
                }

                $compared++;
                $problem = $this->compareMember($baseMember, $headMember, $controllerFqcn, $holder, $entry['widenTo'] ?? null, $entry['placement'] === 'both' ? null : $holders[0]);

                if ($problem !== null) {
                    $problems[] = "{$key} in " . Naming::shortName($holder) . ": {$problem}";
                }

                if ($baseMember->isStatic() !== $headMember->isStatic()) {
                    $staticChanges[] = "{$key} in " . Naming::shortName($holder);
                }
            }
        }

        $copy = $manifest['constructorCopy']['statements'] ?? null;

        if (\is_array($copy) && $helper !== null) {
            $helperClass = (string) $manifest['targets']['helper']['class'];
            $expected[$helperClass]['method:__construct'] = true;
            $baseCtor = $base->member('method:__construct')?->stmt;
            $headCtor = $helper->member('method:__construct');

            if (!$baseCtor instanceof Stmt\ClassMethod || $headCtor === null) {
                $problems[] = 'the Helper constructor copy is missing';
            } else {
                $compared++;
                $want = Canonical::expected(Canonical::withStatements($baseCtor, array_map('intval', $copy)), $controllerFqcn, $helperClass, $this->map);
                $have = Canonical::actual($headCtor->stmt);

                if ($want !== $have) {
                    $problems[] = 'Helper constructor copy: ' . Canonical::firstDifference($want, $have);
                }
            }
        }

        if ($helperOrigin === 'existing file; members are inserted' && $helper !== null) {
            $baseHelper = $this->layout($this->base, (string) $manifest['targets']['helper']['path'], (string) $manifest['targets']['helper']['class']);

            foreach ($baseHelper->members as $member) {
                if (!$member->isCode()) {
                    continue;
                }

                $expected[(string) $manifest['targets']['helper']['class']][$member->key] = true;
                $headMember = $helper->member($member->key);
                $compared++;

                if ($headMember === null || Canonical::actual($member->stmt) !== Canonical::actual($headMember->stmt)) {
                    $problems[] = "existing Helper member {$member->key} changed";
                }
            }
        }

        foreach ($classes as $fqcn => $layout) {
            foreach ($layout->members as $member) {
                if ($member->isCode() && !isset($expected[$fqcn][$member->key])) {
                    $problems[] = Naming::shortName($fqcn) . " declares {$member->key}, which the manifest does not place there";
                }
            }

            if ($helperOrigin === 'existing file; members are inserted' && $fqcn === (string) $manifest['targets']['helper']['class']) {
                continue;
            }

            $isAction = $fqcn === (string) $manifest['targets']['action']['class'];
            $problems = array_merge($problems, $this->compareDeclaration($base->class, $layout->class, $fqcn, $isAction ? $this->mappedParent($base->class) : null));
        }

        $label = 'AST equivalence (Controller)';
        $problems === [] ? $this->pass($label, "{$compared} member copies equal to base after renames") : $this->fail($label, implode("\n", $problems));
        $staticChanges === [] ? $this->pass('static-ness', 'no instance/static changes') : $this->fail('static-ness', 'changed: ' . implode(', ', $staticChanges));
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkServices(array $manifest): void
    {
        $problems = [];
        $compared = 0;

        foreach ($manifest['targets']['services'] ?? [] as $service) {
            $base = $this->layout($this->base, (string) $service['from'], (string) $service['fromClass']);
            $head = $this->layout($this->head, (string) $service['to'], (string) $service['toClass']);
            $baseKeys = [];

            foreach ($base->members as $member) {
                if (!$member->isCode()) {
                    continue;
                }

                $baseKeys[$member->key] = true;
                $headMember = $head->member($member->key);

                if ($headMember === null) {
                    $problems[] = "{$member->key} is missing from " . Naming::shortName((string) $service['toClass']);

                    continue;
                }

                $compared++;
                $problem = $this->compareMember($member, $headMember, (string) $service['fromClass'], (string) $service['toClass'], null, (string) $service['toClass']);

                if ($problem !== null) {
                    $problems[] = "{$member->key} in " . Naming::shortName((string) $service['toClass']) . ": {$problem}";
                }
            }

            foreach ($head->members as $member) {
                if ($member->isCode() && !isset($baseKeys[$member->key])) {
                    $problems[] = Naming::shortName((string) $service['toClass']) . " gained {$member->key}";
                }
            }

            $problems = array_merge($problems, $this->compareDeclaration($base->class, $head->class, (string) $service['toClass'], $this->mappedParent($base->class)));
        }

        $label = 'AST equivalence (Services)';
        $problems === [] ? $this->pass($label, "{$compared} members equal to base after renames") : $this->fail($label, implode("\n", $problems));
    }

    private function compareMember(Member $base, Member $head, string $ownOld, string $holder, ?string $widenTo, ?string $widenIn): ?string
    {
        $want = Canonical::expected(Canonical::withoutVisibility($base->stmt), $ownOld, $holder, $this->map);
        $have = Canonical::actual(Canonical::withoutVisibility($head->stmt));

        if ($want !== $have) {
            return Canonical::firstDifference($want, $have);
        }

        $baseVisibility = Canonical::visibility($base->stmt);
        $headVisibility = Canonical::visibility($head->stmt);

        if ($baseVisibility !== $headVisibility && !($widenTo === $headVisibility && $widenIn === $holder)) {
            return "visibility {$baseVisibility} became {$headVisibility} without a listed widening";
        }

        return null;
    }

    private function mappedParent(Stmt\ClassLike $class): ?string
    {
        if (!$class instanceof Stmt\Class_ || $class->extends === null) {
            return null;
        }

        $parent = (string) Names::resolved($class->extends);

        return $this->map->isRenamed($parent) ? $this->map->external($parent, null, 'extends') : $parent;
    }

    /**
     * @return list<string>
     */
    private function compareDeclaration(Stmt\ClassLike $base, Stmt\ClassLike $head, string $headFqcn, ?string $expectedParent): array
    {
        if (!$base instanceof Stmt\Class_ || !$head instanceof Stmt\Class_) {
            return [Naming::shortName($headFqcn) . ' is not a class'];
        }

        $problems = [];
        $modifiers = Modifiers::FINAL | Modifiers::ABSTRACT | Modifiers::READONLY;

        if (($base->flags & $modifiers) !== ($head->flags & $modifiers)) {
            $problems[] = Naming::shortName($headFqcn) . ' class modifiers differ from the base class';
        }

        $headParent = $head->extends === null ? null : (string) Names::resolved($head->extends);

        if ($expectedParent !== $headParent) {
            $problems[] = Naming::shortName($headFqcn) . ' extends ' . ($headParent ?? 'nothing') . ', expected ' . ($expectedParent ?? 'nothing');
        }

        return $problems;
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkComments(array $manifest): void
    {
        $folder = Naming::folderPath((string) $manifest['integration']);
        $baseComments = $this->comments($this->base, $this->phpFiles($this->base, $folder));
        $headComments = $this->comments($this->head, $this->phpFiles($this->head, $folder));
        $problems = self::multisetDiff($baseComments, $headComments, $folder);

        foreach ($this->editedOutside($manifest) as $path) {
            $problems = array_merge($problems, self::multisetDiff($this->comments($this->base, [$path]), $this->comments($this->head, [$path]), $path));
        }

        $problems === []
            ? $this->pass('comment tokens', \count($baseComments) . ' in the folder before and after')
            : $this->fail('comment tokens', implode("\n", $problems));
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkLint(array $manifest): void
    {
        $paths = array_merge($this->phpFiles($this->head, Naming::folderPath((string) $manifest['integration'])), $this->editedOutside($manifest));
        $errors = [];

        foreach ($paths as $path) {
            foreach ($this->lint->lintFile($path, $this->head->tree->root . '/' . $path) as $error) {
                $errors[] = $error;
            }
        }

        $versions = implode('/', array_map(static fn ($version) => "php{$version}", array_keys($this->lint->binaries())));
        $errors === [] ? $this->pass('lint', "{$versions} -l clean on " . \count($paths) . ' files') : $this->fail('lint', implode("\n", $errors));
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkBindings(array $manifest): void
    {
        $problems = [];
        $checked = 0;
        $controllerFqcn = (string) $manifest['controller']['class'];
        $base = $this->layout($this->base, (string) $manifest['controller']['path'], $controllerFqcn);
        $byFile = [];

        foreach ($manifest['routes'] ?? [] as $route) {
            $byFile[$route['file']] = true;
        }

        foreach (array_keys($byFile) as $file) {
            $baseSource = $this->base->source((string) $file);
            $headSource = $this->head->source((string) $file);

            if ($baseSource === null || $headSource === null) {
                $problems[] = "{$file} is missing";

                continue;
            }

            $baseRoutes = Bindings::routes($baseSource);
            $headRoutes = Bindings::routes($headSource);

            if (\count($baseRoutes) !== \count($headRoutes)) {
                $problems[] = "{$file}: " . \count($baseRoutes) . ' routes before, ' . \count($headRoutes) . ' after';

                continue;
            }

            foreach ($baseRoutes as $index => $before) {
                $after = $headRoutes[$index];

                if ($before['verb'] !== $after['verb'] || $before['route'] !== $after['route'] || $before['method'] !== $after['method']) {
                    $problems[] = "{$file}:{$after['line']} route {$before['route']} changed its name, verb or method";

                    continue;
                }

                if ($before['class'] !== $controllerFqcn) {
                    if ($before['class'] !== $after['class'] && !$this->map->isRenamed($before['class'])) {
                        $problems[] = "{$file}:{$after['line']} route {$before['route']} changed class";
                    }

                    continue;
                }

                $checked++;
                $expectedClass = $this->routeTarget($manifest, $before['route'], $before['method']);

                if ($after['class'] !== $expectedClass) {
                    $problems[] = "{$file}:{$after['line']} route {$before['route']} points at {$after['class']}, the manifest says {$expectedClass}";

                    continue;
                }

                $problems = array_merge($problems, $this->handlerProblem($base, $after['class'], $before['method'], "route {$before['route']}"));
            }
        }

        foreach ($manifest['hooks'] ?? [] as $hook) {
            $checked++;
            $problems = array_merge($problems, $this->handlerProblem($base, (string) $hook['target'], (string) $hook['method'], "hook {$hook['hook']}"));
        }

        $problems === [] ? $this->pass('routes/hooks', "{$checked} handlers exist with the same static-ness") : $this->fail('routes/hooks', implode("\n", $problems));
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function routeTarget(array $manifest, string $route, string $method): string
    {
        foreach ($manifest['routes'] ?? [] as $entry) {
            if ($entry['route'] === $route && $entry['method'] === $method) {
                return (string) $entry['target'];
            }
        }

        return '';
    }

    /**
     * @return list<string>
     */
    private function handlerProblem(ClassLayout $base, string $class, string $method, string $label): array
    {
        $split = Naming::splitActionClass($class);

        if ($split === null) {
            return ["{$label} points at {$class}, outside backend/Actions"];
        }

        $layout = $this->layout($this->head, Naming::path($split[0], $split[1]), $class);
        $key = 'method:' . strtolower($method);
        $before = $base->member($key);
        $after = $layout->member($key);

        if ($before === null) {
            return $after === null ? [] : ["{$label}: {$method} exists now but did not at base"];
        }

        if ($after === null) {
            return ["{$label}: " . Naming::shortName($class) . " has no {$method}"];
        }

        return $before->isStatic() === $after->isStatic() ? [] : ["{$label}: {$method} changed static-ness"];
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkPsr4(array $manifest): void
    {
        $problems = [];

        foreach ($this->phpFiles($this->head, Naming::folderPath((string) $manifest['integration'])) as $path) {
            $source = $this->head->source($path);

            if ($source === null) {
                $problems[] = "{$path} does not parse";

                continue;
            }

            foreach ($source->classLikes() as $class) {
                if ($class->name !== null && $class->name->toString() !== basename($path, '.php')) {
                    $problems[] = "{$path} declares {$class->name->toString()}";
                }
            }
        }

        $problems === [] ? $this->pass('psr-4', 'every class file is named after its class') : $this->fail('psr-4', implode("\n", $problems));
    }

    /**
     * @param array<string, mixed> $manifest
     *
     * @return list<string>
     */
    private function editedOutside(array $manifest): array
    {
        $folder = Naming::folderPath((string) $manifest['integration']) . '/';
        $paths = [];

        foreach ($manifest['fileOps'] ?? [] as $op) {
            if ($op['op'] === 'edit' && !str_starts_with((string) $op['path'], $folder)) {
                $paths[] = (string) $op['path'];
            }
        }

        return $paths;
    }

    /**
     * @return list<string>
     */
    private function phpFiles(Workspace $workspace, string $folder): array
    {
        return array_values(array_filter($workspace->tree->files($folder), static fn (string $path) => str_ends_with($path, '.php')));
    }

    /**
     * @param list<string> $paths
     *
     * @return array<string, int> comment text => count
     */
    private function comments(Workspace $workspace, array $paths): array
    {
        $counts = [];

        foreach ($paths as $path) {
            $source = $workspace->source($path);

            if ($source === null) {
                throw new RuntimeException("{$path} does not parse in the " . $workspace->tree->label());
            }

            foreach ($source->commentTokens() as $token) {
                $text = rtrim($token->text);
                $counts[$text] = ($counts[$text] ?? 0) + 1;
            }
        }

        ksort($counts, SORT_STRING);

        return $counts;
    }

    /**
     * @param array<string, int> $before
     * @param array<string, int> $after
     *
     * @return list<string>
     */
    private static function multisetDiff(array $before, array $after, string $where): array
    {
        $problems = [];

        foreach ($before + $after as $text => $unused) {
            $a = $before[$text] ?? 0;
            $b = $after[$text] ?? 0;

            if ($a !== $b) {
                $problems[] = "{$where}: comment " . json_encode(mb_strimwidth((string) $text, 0, 80, '...')) . " appears {$a} time(s) before and {$b} after";
            }
        }

        return $problems;
    }

    private function layout(Workspace $workspace, string $path, string $fqcn): ClassLayout
    {
        $source = $workspace->source($path) ?? throw new RuntimeException("{$path} is missing or does not parse in the " . $workspace->tree->label());
        $class = $source->findClass(Naming::shortName($fqcn)) ?? throw new RuntimeException("{$path} does not declare " . Naming::shortName($fqcn));

        if (Names::classOf($class) !== $fqcn) {
            throw new RuntimeException("{$path} declares " . Names::classOf($class) . ", expected {$fqcn}");
        }

        return ClassLayout::of($source, $class);
    }

    private function pass(string $check, string $detail): void
    {
        $this->results[] = ['ok' => true, 'check' => $check, 'detail' => $detail];
    }

    private function fail(string $check, string $detail): void
    {
        $this->results[] = ['ok' => false, 'check' => $check, 'detail' => $detail];
    }
}
