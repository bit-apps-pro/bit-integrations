<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Php\ClassLayout;
use BitApps\Restructure\Php\Member;
use BitApps\Restructure\Php\Names;
use BitApps\Restructure\Php\Source;
use PhpParser\Modifiers;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Stmt;
use PhpParser\NodeFinder;

final class Planner
{
    private const PINNED_ACTION = ['method:__construct', 'method:execute', 'property:authConfig'];

    public function __construct(private readonly PlanContext $context)
    {
    }

    /**
     * @param array<string, string> $overrides member key => action|helper|both, from a reviewed manifest
     */
    public function plan(string $folder, array $overrides = []): IntegrationPlan
    {
        $plan = new IntegrationPlan($folder, Naming::namespaceOf($folder));
        $plan->controllerPath = Naming::path($folder, Naming::controller($folder));
        $plan->controllerFqcn = Naming::fqcn($folder, Naming::controller($folder));
        $plan->actionPath = Naming::path($folder, Naming::action($folder));
        $plan->actionFqcn = Naming::fqcn($folder, Naming::action($folder));
        $plan->helperPath = Naming::path($folder, Naming::helper($folder));
        $plan->helperFqcn = Naming::fqcn($folder, Naming::helper($folder));
        $plan->unit = $this->context->unitOf($folder);

        if (!$this->loadController($plan)) {
            $this->hashes($plan);

            return $plan;
        }

        $this->loadServices($plan);
        $this->loadExistingHelper($plan);

        if ($this->context->workspace->tree->exists($plan->actionPath)) {
            $plan->refuse('target_exists', "{$plan->actionPath} already exists");
        }

        $plan->graph = MemberGraph::of($plan->layout, $plan->controllerFqcn);
        $this->collectBindings($plan);
        $this->place($plan, $overrides);
        $this->crossings($plan);
        $this->checkBindings($plan);
        $this->checkConstructor($plan);
        $this->checkNotes($plan);
        $this->chooseMoveTarget($plan);
        $this->buildRenames($plan);
        $this->collectReferences($plan);
        $this->flags($plan);
        $this->hashes($plan);

        return $plan;
    }

    private function loadController(IntegrationPlan $plan): bool
    {
        $workspace = $this->context->workspace;
        $source = $workspace->source($plan->controllerPath);

        if ($source === null) {
            $plan->refuse('parse', $workspace->parseError($plan->controllerPath) ?? "{$plan->controllerPath} is missing");

            return false;
        }

        $classes = $source->classLikes();
        $class = $source->findClass(Naming::controller($plan->folder));

        if ($class === null || \count($classes) !== 1 || Names::classOf($class) !== $plan->controllerFqcn) {
            $plan->refuse('controller_file_shape', "{$plan->controllerPath} must declare exactly one class, {$plan->controllerFqcn}");

            return false;
        }

        foreach ($source->topLevelStmts() as $stmt) {
            if (!$stmt instanceof Stmt\Use_ && !$stmt instanceof Stmt\GroupUse && !$stmt instanceof Stmt\If_ && !$stmt instanceof Stmt\Nop && !$stmt instanceof Stmt\Declare_ && $stmt !== $class) {
                $plan->refuse('controller_file_shape', 'unexpected top-level ' . $stmt->getType() . " at line {$stmt->getStartLine()}");
            }
        }

        $layout = ClassLayout::of($source, $class);
        $plan->layout = $layout;

        foreach ($layout->problems as $problem) {
            $plan->refuse('layout', $problem);
        }

        $plan->modifiers = self::modifiers($class->flags);
        $plan->parent = $class->extends === null ? null : Names::resolved($class->extends);

        foreach ($layout->members as $member) {
            if ($member->kind === 'trait') {
                $plan->refuse('trait_use', "the Controller uses a trait at line {$member->startLine}");
            } elseif ($member->kind === 'other' || $member->kind === 'case') {
                $plan->refuse('layout', "unsupported class member at line {$member->startLine}");
            }

            foreach (\array_slice($member->names, 1) as $name) {
                $plan->aliases[Member::keyFor($member->kind, $name)] = $member->key;
            }
        }

        $constructor = $layout->member('method:__construct');
        $plan->ctorExists = $constructor !== null;
        $plan->ctorRequired = $constructor?->requiredParameterCount() ?? 0;

        if ($layout->member('method:execute') === null && $plan->parent === null) {
            $plan->refuse('missing_execute', "{$plan->controllerFqcn} has no execute method");
        }

        return true;
    }

    private function loadServices(IntegrationPlan $plan): void
    {
        $workspace = $this->context->workspace;
        $targets = [];

        foreach ($workspace->folderPhpFiles($plan->folder) as $path) {
            if (\dirname($path) !== Naming::folderPath($plan->folder) || !Naming::isApiHelper(basename($path, '.php'))) {
                continue;
            }

            $class = basename($path, '.php');
            $toClass = Naming::serviceFor($plan->folder, $class);
            $toPath = Naming::path($plan->folder, $toClass);
            $source = $workspace->source($path);

            if ($source === null) {
                $plan->refuse('parse', $workspace->parseError($path) ?? "{$path} is missing");

                continue;
            }

            if ($source->findClass($class) === null || \count($source->classLikes()) !== 1) {
                $plan->refuse('service_file_shape', "{$path} must declare exactly one class, {$class}");
            }

            if ($workspace->tree->exists($toPath)) {
                $plan->refuse('target_exists', "{$toPath} already exists");
            }

            if (isset($targets[$toClass])) {
                $plan->refuse('target_exists', "{$targets[$toClass]} and {$path} would both become {$toClass}");
            }

            $targets[$toClass] = $path;
            $plan->services[] = ['from' => $path, 'to' => $toPath, 'fromClass' => Naming::fqcn($plan->folder, $class), 'toClass' => Naming::fqcn($plan->folder, $toClass)];
            $serviceClass = $source->findClass($class);

            if ($serviceClass !== null) {
                $plan->serviceMembers[$path] = array_values(array_map(static fn (Member $member) => [
                    'key'        => $member->key,
                    'kind'       => $member->kind,
                    'static'     => $member->isStatic(),
                    'visibility' => $member->visibility(),
                    'lines'      => [$member->startLine, $member->endLine],
                ], array_filter(ClassLayout::of($source, $serviceClass)->members, static fn (Member $member) => $member->isCode())));
            }
        }
    }

    private function loadExistingHelper(IntegrationPlan $plan): void
    {
        $workspace = $this->context->workspace;

        if (!$workspace->tree->exists($plan->helperPath)) {
            return;
        }

        $plan->helperExists = true;
        $source = $workspace->source($plan->helperPath);
        $class = $source?->findClass(Naming::helper($plan->folder));

        if ($source === null || $class === null) {
            $plan->refuse('existing_helper', "{$plan->helperPath} exists but does not declare " . Naming::helper($plan->folder));

            return;
        }

        $plan->existingHelper = ClassLayout::of($source, $class);

        foreach ($plan->existingHelper->problems as $problem) {
            $plan->refuse('existing_helper', "{$plan->helperPath}: {$problem}");
        }
    }

    private function collectBindings(IntegrationPlan $plan): void
    {
        $workspace = $this->context->workspace;
        $files = [];

        foreach ($this->context->index->to($plan->controllerFqcn) as $reference) {
            if ($reference->inClass !== $plan->controllerFqcn && \in_array(basename($reference->file), ['Routes.php', 'Hooks.php'], true)) {
                $files[$reference->file] = true;
            }
        }

        ksort($files, SORT_STRING);

        foreach (array_keys($files) as $file) {
            $source = $workspace->source((string) $file);

            if ($source === null) {
                continue;
            }

            if (basename((string) $file) === 'Routes.php') {
                foreach (Bindings::routes($source) as $route) {
                    if ($route['class'] === $plan->controllerFqcn) {
                        $plan->routes[] = ['file' => $file] + $route + ['key' => 'method:' . strtolower($route['method'])];
                    }
                }
            } else {
                foreach (Bindings::hookCallbacks($source) as $hook) {
                    if ($hook['class'] === $plan->controllerFqcn) {
                        $plan->hooks[] = ['file' => $file] + $hook + ['key' => 'method:' . strtolower($hook['method'])];
                    }
                }
            }
        }
    }

    /**
     * @param array<string, string> $overrides
     */
    private function place(IntegrationPlan $plan, array $overrides): void
    {
        $members = $this->members($plan);
        $adjacency = [];

        foreach ($plan->graph->edges as $edge) {
            $to = $plan->resolveKey($edge->to);

            if (isset($members[$to]) && \in_array($edge->form, [Edge::CALL, Edge::CALLABLE, Edge::CALLABLE_STRING, Edge::NEW], true)) {
                $adjacency[$edge->from][$to] = true;
            }
        }

        $pinnedAction = array_values(array_filter(self::PINNED_ACTION, static fn (string $key) => isset($members[$key])));
        $roots = ['route' => [], 'hook' => [], 'external' => []];

        foreach ($plan->routes as $route) {
            $roots['route'][$route['key']] = true;
        }

        foreach ($plan->hooks as $hook) {
            $roots['hook'][$hook['key']] = true;
        }

        foreach ($this->externalMemberReferences($plan) as $key) {
            $roots['external'][$key] = true;
        }

        $pinnedHelper = [];

        foreach ([$roots['route'], $roots['hook']] as $set) {
            foreach (array_keys($set) as $key) {
                if (isset($members[$key]) && !\in_array($key, $pinnedAction, true)) {
                    $pinnedHelper[$key] = true;
                }
            }
        }

        $reach = [];
        $helperReach = [];

        foreach ($roots as $kind => $set) {
            $starts = array_values(array_filter(array_map('strval', array_keys($set)), static fn (string $key) => isset($members[$key]) && str_starts_with($key, 'method:') && !\in_array($key, $pinnedAction, true)));

            foreach (self::closure($starts, $adjacency, array_fill_keys($pinnedAction, true)) as $key) {
                $reach[$key][$kind] = true;

                if (!\in_array($key, $pinnedAction, true)) {
                    $helperReach[$key] = true;
                }
            }
        }

        $actionReach = [];

        foreach (['execute' => 'method:execute', 'constructor' => 'method:__construct'] as $kind => $root) {
            if (!isset($members[$root])) {
                continue;
            }

            foreach (self::closure([$root], $adjacency, $helperReach + $pinnedHelper) as $key) {
                $reach[$key][$kind] = true;
                $actionReach[$key] = true;
            }
        }

        foreach ($members as $key => $member) {
            $plan->reach[$key] = array_map('strval', array_keys($reach[$key] ?? []));
            sort($plan->reach[$key], SORT_STRING);
        }

        foreach ($members as $key => $member) {
            if ($member->kind !== 'method') {
                continue;
            }

            if (\in_array($key, $pinnedAction, true)) {
                $this->assign($plan, $key, IntegrationPlan::ACTION, $key === 'method:execute' ? 'execute' : 'constructor');
            } elseif (isset($pinnedHelper[$key])) {
                $this->assign($plan, $key, IntegrationPlan::HELPER, isset($roots['route'][$key]) ? 'route handler' : 'hook callback');
            } elseif (isset($helperReach[$key])) {
                $this->assign($plan, $key, IntegrationPlan::HELPER, isset($actionReach[$key]) ? 'reached from execute and from routes/hooks/other classes' : 'reached from routes/hooks/other classes');
            } elseif (isset($actionReach[$key])) {
                $this->assign($plan, $key, IntegrationPlan::ACTION, 'reached only from execute or the constructor');
            } else {
                $this->assign($plan, $key, IntegrationPlan::HELPER, 'unreachable');
            }
        }

        $this->placeData($plan, $members);
        $this->applyOverrides($plan, $overrides, $members, $pinnedAction, $pinnedHelper);
    }

    /**
     * @param array<string, Member> $members
     */
    private function placeData(IntegrationPlan $plan, array $members): void
    {
        $users = [];
        $writes = [];

        foreach ($plan->graph->edges as $edge) {
            $to = $plan->resolveKey($edge->to);

            if (!isset($members[$to]) || ($edge->form !== Edge::PROPERTY && $edge->form !== Edge::CONSTANT)) {
                continue;
            }

            $users[$to][$edge->from] = true;

            if ($edge->write) {
                $writes[$to][] = $edge;
            }
        }

        $external = array_fill_keys($this->externalMemberReferences($plan), true);
        $pending = [];

        foreach ($members as $key => $member) {
            if ($member->kind === 'property' || $member->kind === 'const') {
                if ($key === 'property:authConfig') {
                    $this->assign($plan, $key, IntegrationPlan::ACTION, '$authConfig stays with the Action');
                } else {
                    $pending[$key] = $member;
                }
            }
        }

        $simpleCtorWrites = $this->simpleConstructorWrites($plan);

        for ($round = 0, $limit = \count($pending) + 1; $round < $limit && $pending !== []; $round++) {
            $progress = false;

            foreach ($pending as $key => $member) {
                $sides = [];
                $ready = true;

                foreach (array_keys($users[$key] ?? []) as $user) {
                    if ($user === $key) {
                        continue;
                    }

                    $side = $plan->placement[$user] ?? null;

                    if ($side === null) {
                        $ready = false;

                        break;
                    }

                    if ($side === IntegrationPlan::BOTH) {
                        $sides[IntegrationPlan::ACTION] = true;
                        $sides[IntegrationPlan::HELPER] = true;
                    } else {
                        $sides[$side] = true;
                    }
                }

                if (!$ready) {
                    continue;
                }

                if (isset($external[$key])) {
                    $sides[IntegrationPlan::HELPER] = true;
                }

                $this->decideData($plan, $key, $member, $sides, $writes[$key] ?? [], $simpleCtorWrites);
                unset($pending[$key]);
                $progress = true;
            }

            if (!$progress) {
                break;
            }
        }

        foreach ($pending as $key => $member) {
            $this->assign($plan, $key, IntegrationPlan::HELPER, 'used in a cycle of constants or properties');
        }

        if ($plan->ctorCopyProperties !== []) {
            $indexes = [];

            foreach ($plan->ctorCopyProperties as $property) {
                foreach ($simpleCtorWrites[$property] ?? [] as $index) {
                    $indexes[$index] = true;
                }
            }

            $indexes = array_map('intval', array_keys($indexes));
            sort($indexes);
            $plan->ctorCopy = $indexes;
        }
    }

    /**
     * @param array<string, true>           $sides
     * @param list<Edge>                    $writes
     * @param array<string, list<int>>|null $simpleCtorWrites property name => ctor statement indexes that assign it
     */
    private function decideData(IntegrationPlan $plan, string $key, Member $member, array $sides, array $writes, ?array $simpleCtorWrites): void
    {
        if ($sides === []) {
            $this->assign($plan, $key, IntegrationPlan::HELPER, 'unused');

            return;
        }

        if (\count($sides) === 1) {
            $side = (string) array_key_first($sides);
            $this->assign($plan, $key, $side, $side === IntegrationPlan::ACTION ? 'used only by Action members' : 'used only by Helper members');

            return;
        }

        if ($member->kind === 'const') {
            $this->assign($plan, $key, IntegrationPlan::BOTH, 'constant used by both sides; copied');

            return;
        }

        if ($member->isStatic()) {
            if ($writes === []) {
                $this->assign($plan, $key, IntegrationPlan::BOTH, 'static property never written; copied');

                return;
            }

            $this->assign($plan, $key, IntegrationPlan::HELPER, 'static property written and used by both sides; kept once, in the Helper');

            if ($member->visibility() !== 'public') {
                $plan->widen[$key] = 'public';
            }

            return;
        }

        if ($writes === []) {
            $this->assign($plan, $key, IntegrationPlan::BOTH, 'instance property never written after its default; copied');

            return;
        }

        $name = $member->name();
        $onlyCtor = array_filter($writes, static fn (Edge $edge) => $edge->from !== 'method:__construct') === [];
        $ctor = $plan->layout?->member('method:__construct');
        $ctorParams = $ctor?->stmt instanceof Stmt\ClassMethod ? \count($ctor->stmt->params) : 0;
        $simple = $simpleCtorWrites !== null && isset($simpleCtorWrites[$name]) && \count($simpleCtorWrites[$name]) === \count($writes);

        if ($onlyCtor && $ctorParams === 0 && $simple) {
            $this->assign($plan, $key, IntegrationPlan::BOTH, 'set only by the no-argument constructor; copied with that constructor line');
            $plan->ctorCopyProperties[] = $name;

            return;
        }

        $this->assign($plan, $key, IntegrationPlan::ACTION, 'instance state shared by both sides');

        if ($onlyCtor && $ctorParams > 0) {
            $plan->refuse('helper_ctor_required_params', "\${$name} is set by a constructor that takes arguments and is also read by Helper members; the Helper would need that constructor");
        } else {
            $plan->refuse('shared_instance_state', "instance property \${$name} is written outside a no-argument constructor and used by both the Action and the Helper");
        }
    }

    /**
     * @return array<string, list<int>>|null property => indexes of top-level constructor statements of the form
     *                                       `$this->p = <expression without variables or class members>;`
     */
    private function simpleConstructorWrites(IntegrationPlan $plan): ?array
    {
        $ctor = $plan->layout?->member('method:__construct');

        if ($ctor === null || !$ctor->stmt instanceof Stmt\ClassMethod) {
            return null;
        }

        $finder = new NodeFinder();
        $writes = [];

        foreach ($ctor->stmt->stmts ?? [] as $index => $stmt) {
            if (!$stmt instanceof Stmt\Expression || !$stmt->expr instanceof Expr\Assign) {
                continue;
            }

            $target = $stmt->expr->var;

            if (!$target instanceof Expr\PropertyFetch || !Names::isThis($target->var) || !$target->name instanceof Node\Identifier) {
                continue;
            }

            $impure = $finder->findFirst([$stmt->expr->expr], static fn (Node $node) => $node instanceof Expr\Variable
                || $node instanceof Expr\StaticCall || $node instanceof Expr\ClassConstFetch || $node instanceof Expr\StaticPropertyFetch
                || $node instanceof Expr\MethodCall || $node instanceof Expr\New_ || $node instanceof Expr\Closure || $node instanceof Expr\ArrowFunction);

            if ($impure !== null || $stmt->getComments() !== [] || self::containsComment($plan->layout->source, $stmt)) {
                continue;
            }

            $writes[$target->name->toString()][] = $index;
        }

        return $writes;
    }

    private static function containsComment(Source $source, Node $node): bool
    {
        $first = $source->tokenIndexAt($node->getStartFilePos());

        if ($first === null) {
            return true;
        }

        for ($i = $first, $last = $node->getEndTokenPos(); $i <= $last; $i++) {
            if (\in_array($source->tokens[$i]->id, [T_COMMENT, T_DOC_COMMENT], true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array<string, string> $overrides
     * @param array<string, Member> $members
     * @param list<string>          $pinnedAction
     * @param array<string, true>   $pinnedHelper
     */
    private function applyOverrides(IntegrationPlan $plan, array $overrides, array $members, array $pinnedAction, array $pinnedHelper): void
    {
        foreach ($overrides as $key => $side) {
            if (!isset($members[$key])) {
                $plan->refuse('manifest', "the manifest places {$key}, which the Controller does not declare");

                continue;
            }

            if (!\in_array($side, [IntegrationPlan::ACTION, IntegrationPlan::HELPER, IntegrationPlan::BOTH], true)) {
                $plan->refuse('manifest', "the manifest places {$key} on '{$side}'");

                continue;
            }

            if (($plan->placement[$key] ?? null) === $side) {
                continue;
            }

            if (\in_array($key, $pinnedAction, true) || isset($pinnedHelper[$key])) {
                $plan->refuse('manifest', "{$key} cannot move: it is an entry point");

                continue;
            }

            if ($side === IntegrationPlan::BOTH && $members[$key]->kind === 'method') {
                $plan->refuse('manifest', "{$key}: methods are never copied");

                continue;
            }

            $plan->placement[$key] = $side;
            $plan->reasons[$key] = 'placed by the reviewed manifest';
        }
    }

    private function crossings(IntegrationPlan $plan): void
    {
        $members = $this->members($plan);
        $unresolved = [];

        foreach ($plan->graph->edges as $edge) {
            $to = $plan->resolveKey($edge->to);

            if (!isset($members[$to])) {
                $unresolved[] = ['member' => $edge->from, 'line' => $edge->line, 'target' => $edge->to, 'via' => $edge->label()];

                continue;
            }

            $fromSide = $plan->placement[$edge->from] ?? null;
            $toSide = $plan->placement[$to] ?? null;

            if ($fromSide === null || $toSide === null || $toSide === IntegrationPlan::BOTH || $fromSide === $toSide) {
                continue;
            }

            if ($fromSide === IntegrationPlan::BOTH) {
                $plan->refuse('copied_member_reference', "{$edge->from} is copied to both classes but uses {$to}, which only the " . ucfirst($toSide) . ' has');

                continue;
            }

            $holder = Naming::shortName($plan->sideClass($toSide));
            $target = $members[$to];
            $static = $target->isStatic();
            $where = "{$edge->from} line {$edge->line} ({$edge->label()} {$to})";
            $replacement = null;

            switch ($edge->form) {
                case Edge::CALL:
                    if ($edge->via === 'this') {
                        $replacement = $static ? $holder . '::' : null;
                    } elseif ($static) {
                        $replacement = $holder;
                    }

                    if ($replacement === null) {
                        $plan->refuse('instance_static_change', "{$where}: {$to} is an instance method on the other side of the split; reaching it would change static-ness or need an instance");
                    }

                    break;

                case Edge::PROPERTY:
                    $replacement = $edge->via === 'this' ? null : $holder;

                    if ($replacement === null) {
                        $plan->refuse('instance_static_change', "{$where}: instance property {$to} lives on the other side of the split");
                    }

                    break;

                case Edge::CONSTANT:
                    $replacement = $holder;

                    break;

                case Edge::CALLABLE:
                    $replacement = match ($edge->via) {
                        'magic-class', 'fqcn-string' => $holder . '::class',
                        'this'                       => $static ? $holder . '::class' : null,
                        default                      => $holder,
                    };

                    if ($replacement === null) {
                        $plan->refuse('instance_static_change', "{$where}: [\$this, ...] names an instance method on the other side of the split");
                    }

                    break;

                case Edge::CALLABLE_STRING:
                    $plan->refuse('string_callable_crosses_split', "{$where}: a string callable would have to change");

                    break;

                case Edge::NEW:
                    $replacement = $holder;

                    break;
            }

            if ($replacement === null) {
                continue;
            }

            if (\in_array($edge->via, ['static', 'this', 'this-static'], true) && $this->hasSubclasses($plan)) {
                $plan->refuse('late_static_binding', "{$where}: subclasses of the Controller can override {$to}, and naming " . Naming::shortName($plan->sideClass($toSide)) . ' would bypass them');

                continue;
            }

            $plan->crossings[] = ['edge' => $edge, 'holder' => $plan->sideClass($toSide), 'replacement' => $replacement];

            if ($target->visibility() !== 'public' && !isset($plan->widen[$to])) {
                $plan->widen[$to] = 'public';
            }
        }

        $plan->flag('unresolvedMemberReferences', $unresolved);

        if ($unresolved !== [] && $plan->parent !== null && isset($this->context->candidates[$plan->parent])) {
            $plan->refuse('inherited_member_reference', "{$plan->controllerFqcn} reaches members it inherits from {$plan->parent}, which is split by its own move");
        }
        $undeclared = [];

        foreach ($unresolved as $edge) {
            if (str_starts_with($edge['target'], 'property:')) {
                $side = $plan->placement[$edge['member']] ?? null;

                if ($side !== null) {
                    $undeclared[$edge['target']][$side === IntegrationPlan::BOTH ? IntegrationPlan::ACTION : $side] = true;
                }
            }
        }

        foreach ($undeclared as $property => $sides) {
            if (\count($sides) > 1) {
                $plan->refuse('undeclared_property_shared', "undeclared (dynamic) {$property} is used by both Action and Helper members");
            }
        }
    }

    private function checkBindings(IntegrationPlan $plan): void
    {
        $missing = [];
        $existingHelperCtor = $plan->existingHelper?->member('method:__construct');
        $existingRequired = $existingHelperCtor?->requiredParameterCount() ?? 0;

        foreach (array_merge($plan->routes, $plan->hooks) as $binding) {
            $member = $plan->layout?->member($binding['key']);
            $label = isset($binding['route']) ? "route {$binding['route']}" : "hook {$binding['hook']}";

            if ($member === null) {
                $missing[] = ['file' => $binding['file'], 'line' => $binding['line'], 'binding' => $label, 'method' => $binding['method']];

                continue;
            }

            if ($member->isStatic()) {
                continue;
            }

            if ($plan->ctorRequired > 0) {
                $plan->refuse('route_needs_ctor_args', "{$label} calls instance method {$binding['method']} but the Controller constructor needs {$plan->ctorRequired} argument(s); the Helper would start answering a route that fails today");
            }

            if ($plan->helperExists && $existingRequired > 0) {
                $plan->refuse('helper_ctor_required_params', "{$label} needs an instance of the existing Helper, whose constructor takes arguments");
            }
        }

        $plan->flag('bindingsToMissingMethods', $missing);
    }

    private function checkConstructor(IntegrationPlan $plan): void
    {
        $ctor = $plan->layout?->member('method:__construct');

        if ($ctor === null || !$ctor->stmt instanceof Stmt\ClassMethod) {
            return;
        }

        $instanceEntry = false;

        foreach (array_merge($plan->routes, $plan->hooks) as $binding) {
            $member = $plan->layout->member($binding['key']);

            if ($member !== null && !$member->isStatic()) {
                $instanceEntry = true;

                break;
            }
        }

        if (!$instanceEntry) {
            return;
        }

        $copied = array_flip($plan->ctorCopy ?? []);

        foreach ($ctor->stmt->stmts ?? [] as $index => $stmt) {
            if (!isset($copied[$index]) && !self::isPlainPropertyWrite($stmt)) {
                $plan->refuse('helper_ctor_side_effects', "constructor line {$stmt->getStartLine()} does more than set a property; the Helper that answers the instance routes would be built without it");
            }
        }
    }

    private static function isPlainPropertyWrite(Stmt $stmt): bool
    {
        if (!$stmt instanceof Stmt\Expression || !$stmt->expr instanceof Expr\Assign) {
            return false;
        }

        $target = $stmt->expr->var;

        if (!$target instanceof Expr\PropertyFetch || !Names::isThis($target->var) || !$target->name instanceof Node\Identifier) {
            return false;
        }

        return (new NodeFinder())->findFirst([$stmt->expr->expr], static fn (Node $node) => $node instanceof Expr\CallLike
            || $node instanceof Expr\Include_ || $node instanceof Expr\Eval_ || $node instanceof Expr\Exit_ || $node instanceof Expr\ShellExec
            || $node instanceof Expr\Print_ || $node instanceof Expr\Assign || $node instanceof Expr\AssignOp || $node instanceof Expr\AssignRef
            || $node instanceof Expr\PreInc || $node instanceof Expr\PreDec || $node instanceof Expr\PostInc || $node instanceof Expr\PostDec
            || $node instanceof Expr\Yield_ || $node instanceof Expr\YieldFrom || $node instanceof Expr\Throw_) === null;
    }

    private function hasSubclasses(IntegrationPlan $plan): bool
    {
        foreach ($this->context->index->to($plan->controllerFqcn) as $reference) {
            if ($reference->kind === Reference::EXTENDS) {
                return true;
            }
        }

        return false;
    }

    private function checkNotes(IntegrationPlan $plan): void
    {
        $split = $plan->hasHelperMembers();

        foreach ($plan->graph->notes('dynamic') as $note) {
            if ($split) {
                $plan->refuse('dynamic_member_access', "{$note['member']} line {$note['line']}: `{$note['text']}` reaches a member by a computed name, so the call graph cannot place its target");
            }
        }

        if ($plan->parent !== null && $split) {
            $plan->refuse('split_subclass', "{$plan->controllerFqcn} extends {$plan->parent}; the Helper would lose inherited members");
        }

        if ($split && $plan->layout?->class instanceof Stmt\Class_ && $plan->layout->class->implements !== []) {
            $plan->refuse('split_interface', "{$plan->controllerFqcn} implements an interface whose methods the split could separate from it");
        }

        foreach ($plan->graph->notes('parentReference') as $note) {
            if (($plan->placement[$note['member']] ?? null) === IntegrationPlan::HELPER) {
                $plan->refuse('split_subclass', "{$note['member']} line {$note['line']} uses parent:: and would move to the Helper");
            }
        }
    }

    private function chooseMoveTarget(IntegrationPlan $plan): void
    {
        if ($plan->helperExists || !$plan->hasHelperMembers()) {
            $plan->moveTarget = IntegrationPlan::ACTION;

            return;
        }

        $members = $this->members($plan);
        $lines = [IntegrationPlan::ACTION => 0, IntegrationPlan::HELPER => 0];

        foreach ($plan->placement as $key => $side) {
            $count = $members[$key]->lineCount();

            if ($side !== IntegrationPlan::HELPER) {
                $lines[IntegrationPlan::ACTION] += $count;
            }

            if ($side !== IntegrationPlan::ACTION) {
                $lines[IntegrationPlan::HELPER] += $count;
            }
        }

        if ($plan->ctorCopy !== null) {
            $lines[IntegrationPlan::HELPER] += \count($plan->ctorCopy) + 4;
        }

        $plan->moveTarget = $lines[IntegrationPlan::HELPER] > $lines[IntegrationPlan::ACTION] ? IntegrationPlan::HELPER : IntegrationPlan::ACTION;
        $plan->flag('linesPerTarget', $lines);
    }

    private function buildRenames(IntegrationPlan $plan): void
    {
        foreach ($plan->services as $service) {
            $plan->renames->renameWhole($service['fromClass'], $service['toClass']);
        }

        $holders = $plan->holders();
        $external = [];

        foreach ($holders as $key => $classes) {
            $external[$key] = \count($classes) === 1 ? $classes[0] : $plan->helperFqcn;
        }

        $external['method:__construct'] = $plan->actionFqcn;
        $plan->renames->split($plan->controllerFqcn, $plan->actionFqcn, $holders, $external);
    }

    private function collectReferences(IntegrationPlan $plan): void
    {
        $moved = [$plan->controllerPath => true];

        foreach ($plan->services as $service) {
            $moved[$service['from']] = true;
        }

        $classes = array_merge([$plan->controllerFqcn], array_column($plan->services, 'fromClass'));
        $edited = [];
        $strings = [];
        $nonPublic = [];
        $bare = [];
        $undeclared = [];
        $members = $this->members($plan);

        foreach ($classes as $fqcn) {
            foreach ($this->context->index->to($fqcn) as $reference) {
                if ($fqcn === $plan->controllerFqcn && $reference->inClass === $plan->controllerFqcn) {
                    continue;
                }

                $plan->references[] = $reference;

                if (!isset($moved[$reference->file])) {
                    $edited[$reference->file] = true;
                }

                if ($fqcn === $plan->controllerFqcn && $reference->member !== null && $reference->member !== 'method:__construct' && !isset($members[$plan->resolveKey($reference->member)])) {
                    if ($plan->parent !== null) {
                        $plan->refuse('inherited_member_reference', "{$reference->file}:{$reference->line} reaches {$reference->member} through {$plan->controllerFqcn}, which only inherits it");
                    } else {
                        $undeclared[] = $reference->describe();
                    }
                }

                if ($reference->file === $plan->helperPath && $plan->helperExists) {
                    $plan->refuse('existing_helper', "{$plan->helperPath} references {$fqcn}; inserting into it and renaming inside it would both edit the file");
                }

                if ($reference->kind === Reference::STRING_CALLABLE) {
                    $plan->refuse('string_callable_reference', "{$reference->file}:{$reference->line} names {$reference->written}; string callables are never rewritten");
                }

                if ($reference->kind === Reference::STRING_FQCN || ($reference->kind === Reference::CALLABLE && $reference->style === 'string')) {
                    $strings[] = $reference->describe() + ['rewriteTo' => $plan->renames->target($fqcn, $reference->member, $reference->kind) . '::class'];
                }

                if ($reference->isImport() && $reference->multiImport) {
                    $plan->refuse('group_use_import', "{$reference->file}:{$reference->line} imports {$fqcn} in a grouped or multi-class use statement");
                }

                if ($fqcn === $plan->controllerFqcn && $reference->member !== null && isset($members[$plan->resolveKey($reference->member)])) {
                    $member = $members[$plan->resolveKey($reference->member)];

                    if ($member->visibility() !== 'public' && $reference->member !== 'method:__construct') {
                        $nonPublic[] = $reference->describe() + ['visibility' => $member->visibility()];
                    }
                }

                if ($fqcn === $plan->controllerFqcn && $plan->hasHelperMembers() && \in_array($reference->kind, [Reference::CLASS_NAME, Reference::TYPE, Reference::INSTANCEOF, Reference::NAME, Reference::STRING_FQCN, Reference::CATCH], true)) {
                    $bare[] = $reference->describe() + ['rewriteTo' => $plan->actionFqcn];
                }
            }
        }

        usort($plan->references, static fn (Reference $a, Reference $b) => [$a->file, $a->start, $a->kind] <=> [$b->file, $b->start, $b->kind]);
        $this->checkImportAliases($plan);
        $edited = array_map('strval', array_keys($edited));
        sort($edited, SORT_STRING);
        $plan->editedFiles = $edited;
        $plan->flag('classNameStrings', $strings);
        $plan->flag('referencesToNonPublicMembers', $nonPublic);
        $plan->flag('bareClassReferences', $bare);
        $plan->flag('referencesToUndeclaredMembers', $undeclared);
    }

    private function checkImportAliases(IntegrationPlan $plan): void
    {
        $byImport = [];

        foreach ($plan->references as $reference) {
            if ($reference->isImport() && $plan->renames->isSplit($reference->target)) {
                $byImport[$reference->file . "\0" . strtolower((string) $reference->alias)] = $reference;
            }
        }

        foreach ($byImport as $import) {
            if (!$import->explicitAlias) {
                continue;
            }

            $targets = [];

            foreach ($plan->references as $reference) {
                if ($reference->file === $import->file && !$reference->isImport() && $reference->target === $import->target && $reference->style === 'unqualified' && strcasecmp((string) $reference->alias, (string) $import->alias) === 0) {
                    $targets[(string) $plan->renames->target($reference->target, $reference->member, $reference->kind)] = true;
                }
            }

            if (\count($targets) > 1) {
                $plan->refuse('import_alias_split', "{$import->file}:{$import->line} imports {$import->target} as {$import->alias} and uses it for members that now live in different classes");
            }
        }
    }

    private function flags(IntegrationPlan $plan): void
    {
        $layout = $plan->layout;
        $source = $layout->source;
        $classNode = $layout->class;
        $serviceNodes = [];

        foreach ($plan->services as $service) {
            $serviceSource = $this->context->workspace->source($service['from']);

            if ($serviceSource !== null) {
                $tokenEvidence = Bindings::tokenWriteBack($serviceSource, $serviceSource->stmts);

                foreach ($tokenEvidence as $evidence) {
                    $serviceNodes[] = ['file' => $service['from']] + $evidence;
                }
            }
        }

        $t1 = array_merge(
            array_map(static fn (array $evidence) => ['file' => $plan->controllerPath] + $evidence, Bindings::tokenWriteBack($source, [$classNode])),
            $serviceNodes
        );
        $proHooks = $this->context->pro?->hooksFile($plan->folder);
        $callables = [];
        $statics = [];
        $rewritten = [];

        foreach ($plan->crossings as $crossing) {
            $rewritten[spl_object_id($crossing['edge'])] = $crossing['replacement'];
        }

        foreach ($plan->graph->edges as $edge) {
            if ($edge->isCallableForm()) {
                $callables[] = $edge->describe() + ['crosses' => isset($rewritten[spl_object_id($edge)])];
            }

            if ($edge->via === 'static') {
                $statics[] = $edge->describe() + ['rewrittenTo' => $rewritten[spl_object_id($edge)] ?? null];
            }
        }

        foreach ($plan->references as $reference) {
            if ($reference->kind === Reference::CALLABLE && $reference->target === $plan->controllerFqcn && !\in_array(basename($reference->file), ['Routes.php', 'Hooks.php'], true)) {
                $callables[] = $reference->describe();
            }
        }

        $fires = [];

        foreach ($layout->members as $member) {
            if ($member->isCode()) {
                foreach (Bindings::firePoints($source, [$member->stmt]) as $fire) {
                    $fires[] = ['member' => $member->key, 'placement' => $plan->placement[$member->key] ?? null] + $fire;
                }
            }
        }

        $widenings = [];
        $members = $this->members($plan);

        foreach ($plan->widen as $key => $visibility) {
            $widenings[] = ['member' => $key, 'from' => $members[$key]->visibility(), 'to' => $visibility, 'in' => Naming::shortName($plan->sideClass($plan->placement[$key] === IntegrationPlan::ACTION ? IntegrationPlan::ACTION : IntegrationPlan::HELPER))];
        }

        usort($widenings, static fn (array $a, array $b) => strcmp($a['member'], $b['member']));
        $unreachable = [];
        $shared = [];

        foreach ($plan->placement as $key => $side) {
            if (\in_array($plan->reasons[$key] ?? '', ['unreachable', 'unused'], true)) {
                $unreachable[] = $key;
            }

            if ($side === IntegrationPlan::BOTH || str_contains($plan->reasons[$key] ?? '', 'both sides')) {
                $shared[] = ['member' => $key, 'placement' => $side, 'resolution' => $plan->reasons[$key]];
            }
        }

        $proReferences = [];
        $getClass = [];

        if ($this->context->pro !== null) {
            foreach (array_merge([$plan->controllerFqcn], array_column($plan->services, 'fromClass')) as $fqcn) {
                foreach ($this->context->pro->referencesTo($fqcn) as $reference) {
                    if ($reference['kind'] === ProIndex::GET_CLASS_KIND) {
                        $getClass[] = $reference + ['class' => $fqcn];
                    } else {
                        $proReferences[] = $reference + ['class' => $fqcn];
                    }
                }
            }
        }

        $plan->flag('T1', $t1);
        $plan->flag('T2', $proHooks === null ? null : ['hooks' => $proHooks, 'boundClasses' => $this->context->pro?->boundClasses($plan->folder) ?? []]);
        $plan->flag('T3', $layout->member('property:authConfig') !== null);
        $plan->flag('T4', $callables);
        $plan->flag('T5', $statics);
        $plan->flag('T6', $fires);
        $plan->flag('visibilityWidenings', $widenings);
        $plan->flag('unreachable', $unreachable);
        $plan->flag('sharedMembers', $shared);
        $plan->flag('classNameValues', $plan->graph->notes('classNameValue'));
        $plan->flag('ownClassNameStrings', $plan->graph->notes('classNameString'));
        $plan->flag('thisEscapes', $plan->graph->notes('thisEscapes'));
        $plan->flag('instanceofSelf', $plan->graph->notes('instanceofSelf'));
        $plan->flag('getClassStrings', $getClass);
        $plan->flag('proReferences', $proReferences);
        $plan->flag('coupledWith', array_values(array_filter($plan->unit, static fn (string $folder) => $folder !== $plan->folder)));
        $plan->flag('newAcrossSplit', array_values(array_map(
            static fn (array $crossing) => $crossing['edge']->describe(),
            array_filter($plan->crossings, static fn (array $crossing) => $crossing['edge']->form === Edge::NEW)
        )));
        $plan->flag('docblockMentions', $this->docblockMentions($plan));

        $plan->tests = array_values(array_filter([
            $t1 !== [] ? 'T1' : null,
            $proHooks !== null ? 'T2' : null,
            $layout->member('property:authConfig') !== null ? 'T3' : null,
            $callables !== [] ? 'T4' : null,
            $statics !== [] ? 'T5' : null,
            $fires !== [] ? 'T6' : null,
        ]));
    }

    /**
     * @return list<array{file: string, line: int, name: string}>
     */
    private function docblockMentions(IntegrationPlan $plan): array
    {
        $names = [Naming::shortName($plan->controllerFqcn)];

        foreach ($plan->services as $service) {
            $names[] = Naming::shortName($service['fromClass']);
        }

        $files = array_merge([$plan->controllerPath], array_column($plan->services, 'from'), $plan->editedFiles);
        $mentions = [];

        foreach ($files as $file) {
            $source = $this->context->workspace->source($file);

            foreach ($source?->commentTokens() ?? [] as $token) {
                foreach ($names as $name) {
                    if (preg_match('/(?<![A-Za-z0-9_$\\\\])' . preg_quote($name, '/') . '(?![A-Za-z0-9_])/', $token->text) === 1) {
                        $mentions[] = ['file' => $file, 'line' => $token->line, 'name' => $name];
                    }
                }
            }
        }

        return $mentions;
    }

    private function hashes(IntegrationPlan $plan): void
    {
        $paths = [$plan->controllerPath];

        foreach ($plan->services as $service) {
            $paths[] = $service['from'];
        }

        if ($plan->helperExists) {
            $paths[] = $plan->helperPath;
        }

        foreach ($plan->editedFiles as $file) {
            $paths[] = $file;
        }

        $paths = array_values(array_unique($paths));
        sort($paths, SORT_STRING);

        foreach ($paths as $path) {
            $content = $this->context->workspace->tree->read($path);
            $plan->hashes[$path] = $content === null ? 'missing' : sha1($content);
        }
    }

    /**
     * @return list<string>
     */
    private function externalMemberReferences(IntegrationPlan $plan): array
    {
        $keys = [];

        foreach ($this->context->index->to($plan->controllerFqcn) as $reference) {
            if ($reference->inClass === $plan->controllerFqcn || $reference->member === null || $reference->kind === Reference::NEW) {
                continue;
            }

            if (\in_array(basename($reference->file), ['Routes.php', 'Hooks.php'], true) && $reference->kind === Reference::CALLABLE) {
                continue;
            }

            $keys[$plan->resolveKey($reference->member)] = true;
        }

        $keys = array_map('strval', array_keys($keys));
        sort($keys, SORT_STRING);

        return $keys;
    }

    /**
     * @return array<string, Member>
     */
    private function members(IntegrationPlan $plan): array
    {
        $members = [];

        foreach ($plan->layout?->members ?? [] as $member) {
            if ($member->isCode()) {
                $members[$member->key] = $member;
            }
        }

        return $members;
    }

    private function assign(IntegrationPlan $plan, string $key, string $side, string $reason): void
    {
        $plan->placement[$key] = $side;
        $plan->reasons[$key] = $reason;
    }

    /**
     * @param list<string>                       $roots
     * @param array<string, array<string, true>> $adjacency
     * @param array<string, true>                $stop      members that are reported but not expanded (unless they are roots)
     *
     * @return list<string>
     */
    private static function closure(array $roots, array $adjacency, array $stop): array
    {
        $seen = [];
        $queue = $roots;

        while ($queue !== []) {
            $key = array_shift($queue);

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;

            if (isset($stop[$key]) && !\in_array($key, $roots, true)) {
                continue;
            }

            foreach (array_keys($adjacency[$key] ?? []) as $next) {
                if (!isset($seen[$next])) {
                    $queue[] = (string) $next;
                }
            }
        }

        return array_map('strval', array_keys($seen));
    }

    /**
     * @return list<string>
     */
    private static function modifiers(int $flags): array
    {
        $modifiers = [];

        if ($flags & Modifiers::ABSTRACT) {
            $modifiers[] = 'abstract';
        }

        if ($flags & Modifiers::FINAL) {
            $modifiers[] = 'final';
        }

        if ($flags & Modifiers::READONLY) {
            $modifiers[] = 'readonly';
        }

        return $modifiers;
    }
}
