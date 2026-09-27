<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Php\Names;
use BitApps\Restructure\Php\Source;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Name;
use PhpParser\Node\Scalar\String_;
use PhpParser\NodeFinder;

final class Bindings
{
    private const HOOK_FUNCTIONS = ['do_action', 'do_action_ref_array', 'do_action_deprecated', 'apply_filters', 'apply_filters_ref_array', 'apply_filters_deprecated'];

    /**
     * `Route::<verb>('name', [X::class, 'method'])` calls, in file order.
     *
     * @return list<array{line: int, verb: string, route: string, class: string, method: string}>
     */
    public static function routes(Source $source): array
    {
        $routes = [];

        foreach ((new NodeFinder())->findInstanceOf($source->stmts, Expr\StaticCall::class) as $call) {
            if (!$call->class instanceof Name || $call->class->getLast() !== 'Route' || !$call->name instanceof Node\Identifier) {
                continue;
            }

            $args = $call->getArgs();
            $name = $args[0]->value ?? null;
            $callable = $args[1]->value ?? null;

            if (!$callable instanceof Expr\Array_) {
                continue;
            }

            $pair = Names::callableArray($callable);

            if ($pair === null) {
                continue;
            }

            $class = self::classOfCallablePart($pair[0]);

            if ($class === null) {
                continue;
            }

            $routes[] = [
                'line'   => $call->getStartLine(),
                'verb'   => $call->name->toLowerString(),
                'route'  => $name instanceof String_ ? $name->value : $source->nodeText($name ?? $call),
                'class'  => $class,
                'method' => $pair[1],
            ];
        }

        return $routes;
    }

    /**
     * Callbacks bound with Hooks::add/filter, add_action or add_filter, in file order.
     *
     * @return list<array{line: int, hook: string, class: string, method: string}>
     */
    public static function hookCallbacks(Source $source): array
    {
        $bindings = [];

        foreach ((new NodeFinder())->find($source->stmts, static fn (Node $node) => $node instanceof Expr\StaticCall || $node instanceof Expr\FuncCall) as $call) {
            if (!$call instanceof Expr\StaticCall && !$call instanceof Expr\FuncCall) {
                continue;
            }

            $isHooksClass = $call instanceof Expr\StaticCall && $call->class instanceof Name && $call->class->getLast() === 'Hooks'
                && $call->name instanceof Node\Identifier && \in_array($call->name->toLowerString(), ['add', 'filter', 'action'], true);
            $isFunction = $call instanceof Expr\FuncCall && $call->name instanceof Name && \in_array(strtolower($call->name->getLast()), ['add_action', 'add_filter'], true);

            if (!$isHooksClass && !$isFunction) {
                continue;
            }

            $args = $call->getArgs();
            $callable = $args[1]->value ?? null;
            $pair = $callable instanceof Expr\Array_ ? Names::callableArray($callable) : null;
            $class = $pair === null ? null : self::classOfCallablePart($pair[0]);

            if ($class === null) {
                continue;
            }

            $bindings[] = [
                'line'   => $call->getStartLine(),
                'hook'   => preg_replace('/\s+/', ' ', $source->nodeText($args[0]->value)) ?? '',
                'class'  => $class,
                'method' => $pair[1],
            ];
        }

        return $bindings;
    }

    /**
     * Hook fire points inside $nodes: do_action/apply_filters and Hooks::apply/run.
     *
     * @param list<Node> $nodes
     *
     * @return list<array{line: int, kind: string, hook: string}>
     */
    public static function firePoints(Source $source, array $nodes): array
    {
        $fires = [];

        foreach ((new NodeFinder())->find($nodes, static fn (Node $node) => $node instanceof Expr\FuncCall || $node instanceof Expr\StaticCall) as $call) {
            if (!$call instanceof Expr\StaticCall && !$call instanceof Expr\FuncCall) {
                continue;
            }

            $kind = null;

            if ($call instanceof Expr\FuncCall && $call->name instanceof Name && \count($call->name->getParts()) === 1 && \in_array($call->name->toLowerString(), self::HOOK_FUNCTIONS, true)) {
                $kind = $call->name->toLowerString();
            } elseif ($call instanceof Expr\StaticCall && $call->class instanceof Name && $call->class->getLast() === 'Hooks' && $call->name instanceof Node\Identifier && \in_array($call->name->toLowerString(), ['apply', 'run'], true)) {
                $kind = 'Hooks::' . $call->name->toLowerString();
            }

            if ($kind === null || $call->isFirstClassCallable()) {
                continue;
            }

            $first = $call->getArgs()[0] ?? null;
            $fires[] = ['line' => $call->getStartLine(), 'kind' => $kind, 'hook' => $first === null ? '' : (preg_replace('/\s+/', ' ', $source->nodeText($first->value)) ?? '')];
        }

        usort($fires, static fn (array $a, array $b) => [$a['line'], $a['kind'], $a['hook']] <=> [$b['line'], $b['kind'], $b['hook']]);

        return $fires;
    }

    /**
     * Evidence that the code writes refreshed tokens back to the flow.
     *
     * @param list<Node> $nodes
     *
     * @return list<array{line: int, what: string}>
     */
    public static function tokenWriteBack(Source $source, array $nodes): array
    {
        $finder = new NodeFinder();
        $evidence = [];
        $flowController = 'BitApps\\Integrations\\Flow\\FlowController';
        $usesFlowController = false;

        foreach ($finder->findInstanceOf($nodes, Name::class) as $name) {
            if (Names::resolved($name) === $flowController) {
                $usesFlowController = true;

                break;
            }
        }

        foreach ($finder->find($nodes, static fn (Node $node) => $node instanceof Expr\MethodCall || $node instanceof Expr\StaticCall || $node instanceof Expr\NullsafeMethodCall) as $call) {
            if (!($call instanceof Expr\MethodCall || $call instanceof Expr\StaticCall || $call instanceof Expr\NullsafeMethodCall) || !$call->name instanceof Node\Identifier) {
                continue;
            }

            $method = $call->name->toLowerString();

            if (str_ends_with($method, 'saverefreshedtoken') || str_ends_with($method, 'saverefreshedtokens')) {
                $evidence[] = ['line' => $call->getStartLine(), 'what' => $call->name->toString() . '()'];
            } elseif ($usesFlowController && $method === 'update' && !$call instanceof Expr\StaticCall) {
                $evidence[] = ['line' => $call->getStartLine(), 'what' => 'FlowController update()'];
            }
        }

        usort($evidence, static fn (array $a, array $b) => [$a['line'], $a['what']] <=> [$b['line'], $b['what']]);

        return $evidence;
    }

    private static function classOfCallablePart(Node $part): ?string
    {
        if ($part instanceof Expr\ClassConstFetch && $part->class instanceof Name && $part->name instanceof Node\Identifier && $part->name->toLowerString() === 'class') {
            return Names::resolved($part->class);
        }

        if ($part instanceof String_) {
            return ltrim($part->value, '\\');
        }

        return null;
    }
}
