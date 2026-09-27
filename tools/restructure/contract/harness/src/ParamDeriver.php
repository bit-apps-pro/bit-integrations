<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use PhpParser\Node;
use PhpParser\Node\Arg;
use PhpParser\Node\Expr;
use PhpParser\Node\Expr\Array_;
use PhpParser\Node\Expr\ArrayDimFetch;
use PhpParser\Node\Expr\Assign;
use PhpParser\Node\Expr\BinaryOp;
use PhpParser\Node\Expr\Cast;
use PhpParser\Node\Expr\FuncCall;
use PhpParser\Node\Expr\Match_;
use PhpParser\Node\Expr\MethodCall;
use PhpParser\Node\Expr\New_;
use PhpParser\Node\Expr\NullsafeMethodCall;
use PhpParser\Node\Expr\NullsafePropertyFetch;
use PhpParser\Node\Expr\PropertyFetch;
use PhpParser\Node\Expr\StaticCall;
use PhpParser\Node\Expr\Ternary;
use PhpParser\Node\Expr\Variable;
use PhpParser\Node\Identifier;
use PhpParser\Node\Name;
use PhpParser\Node\Scalar;
use PhpParser\Node\Stmt\ClassLike;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\Node\Stmt\Foreach_;
use PhpParser\Node\Stmt\Return_;
use PhpParser\Node\Stmt\Switch_;
use PhpParser\NodeFinder;

final class ParamDeriver
{
    private const LIST = '[]';

    private const MAX_DEPTH = 3;

    private const PASSTHROUGH = [
        'sanitize_text_field', 'sanitize_email', 'sanitize_key', 'wp_unslash', 'trim', 'strval', 'intval', 'absint',
        'rawurlencode', 'urlencode', 'esc_url_raw', 'esc_attr', 'esc_html', 'stripslashes', 'strtolower', 'strtoupper',
        'wp_kses_post', 'sanitize_textarea_field', 'floatval', 'boolval', 'array_values', 'array_filter', 'array_map',
    ];

    private const SUPERGLOBALS = ['_POST', '_GET', '_REQUEST'];

    private NodeFinder $finder;

    /**
     * @var array<string, mixed>
     */
    private array $tree = [];

    /**
     * @var array<string, true>
     */
    private array $superglobals = [];

    /**
     * @var list<string>
     */
    private array $notes = [];

    /**
     * @var array<string, true>
     */
    private array $visited = [];

    /**
     * @param array<string, mixed> $overrides leaf name => value
     */
    public function __construct(private Source $source, private array $overrides)
    {
        $this->finder = new NodeFinder();
    }

    /**
     * @return array{params: array<string, mixed>, superglobals: array<string, string>, notes: list<string>}
     */
    public function derive(string $class, string $method): array
    {
        $this->tree = [];
        $this->superglobals = [];
        $this->notes = [];
        $this->visited = [];

        $target = $this->method($class, $method);

        if ($target === null) {
            $this->notes[] = "handler {$class}::{$method} not found in source";
        } else {
            [$classNode, $methodNode] = $target;
            $param = $methodNode->params[0]->var ?? null;
            $bindings = $param instanceof Variable && \is_string($param->name) ? [$param->name => []] : [];
            $this->analyze($classNode, $methodNode, $bindings, 0);
        }

        $params = $this->materialize($this->tree, null);
        $superglobals = [];
        foreach (array_keys($this->superglobals) as $key) {
            $superglobals[$key] = $this->leaf($key, []);
        }
        ksort($superglobals);

        return [
            'params'       => \is_array($params) ? $params : [],
            'superglobals' => $superglobals,
            'notes'        => $this->notes,
        ];
    }

    /**
     * @return null|array{0: ClassLike, 1: ClassMethod}
     */
    private function method(string $class, string $method): ?array
    {
        for ($depth = 0; $depth < 4 && $class !== ''; $depth++) {
            $node = $this->source->classNode($class);

            if ($node === null) {
                return null;
            }

            $found = $node->getMethod($method);

            if ($found instanceof ClassMethod) {
                return [$node, $found];
            }

            $class = $node instanceof Node\Stmt\Class_ && $node->extends instanceof Name ? $node->extends->toString() : '';
        }

        return null;
    }

    /**
     * @param array<string, list<string>> $bindings variable name => param path
     */
    private function analyze(ClassLike $class, ClassMethod $method, array $bindings, int $depth): void
    {
        $key = ($class->namespacedName?->toString() ?? '') . '::' . $method->name->toString() . json_encode($bindings);

        if (isset($this->visited[$key]) || $depth > self::MAX_DEPTH) {
            return;
        }

        $this->visited[$key] = true;
        $stmts = $method->stmts ?? [];

        foreach ($this->finder->find($stmts, static fn (Node $n) => $n instanceof Assign || $n instanceof Foreach_) as $node) {
            if ($node instanceof Assign && $node->var instanceof Variable && \is_string($node->var->name)) {
                $path = $this->path($node->expr, $bindings, $class);
                if ($path !== null && !isset($bindings[$node->var->name])) {
                    $bindings[$node->var->name] = $path;
                }
            } elseif ($node instanceof Foreach_) {
                $path = $this->path($node->expr, $bindings, $class);
                if ($path !== null) {
                    $this->register($path, list: true);
                    if ($node->valueVar instanceof Variable && \is_string($node->valueVar->name)) {
                        $bindings[$node->valueVar->name] = [...$path, self::LIST];
                    }
                }
            }
        }

        foreach ($this->finder->find($stmts, static fn (Node $n) => $n instanceof Expr) as $node) {
            if ($node instanceof PropertyFetch || $node instanceof NullsafePropertyFetch || $node instanceof ArrayDimFetch) {
                if ($node instanceof ArrayDimFetch && $node->var instanceof Variable && \in_array($node->var->name, self::SUPERGLOBALS, true) && $node->dim instanceof Scalar\String_) {
                    if (!\in_array($node->dim->value, ['data', 'action', '_ajax_nonce'], true)) {
                        $this->superglobals[$node->dim->value] = true;
                    }

                    continue;
                }

                $path = $this->path($node, $bindings, $class);
                if ($path !== null && $path !== []) {
                    $this->register($path);
                }
            } elseif ($node instanceof BinaryOp\NotIdentical || $node instanceof BinaryOp\NotEqual) {
                $this->hintPair($node->left, $node->right, $bindings, $class);
                $this->hintPair($node->right, $node->left, $bindings, $class);
            } elseif ($node instanceof FuncCall && $node->name instanceof Name) {
                $this->funcCall($node, $bindings, $class);
            } elseif ($node instanceof Match_) {
                $path = $this->path($node->cond, $bindings, $class);
                foreach ($node->arms as $arm) {
                    foreach ($arm->conds ?? [] as $cond) {
                        if ($path !== null && ($literal = self::literal($cond)) !== null) {
                            $this->register($path, hint: $literal);
                        }
                    }
                }
            } elseif ($node instanceof StaticCall || $node instanceof MethodCall || $node instanceof NullsafeMethodCall) {
                $this->follow($node, $bindings, $class, $depth);
            }
        }

        foreach ($this->finder->findInstanceOf($stmts, Switch_::class) as $switch) {
            $path = $this->path($switch->cond, $bindings, $class);
            if ($path === null) {
                continue;
            }
            foreach ($switch->cases as $case) {
                if ($case->cond !== null && ($literal = self::literal($case->cond)) !== null) {
                    $this->register($path, hint: $literal);
                }
            }
        }
    }

    /**
     * @param array<string, list<string>> $bindings
     *
     * @return null|list<string>
     */
    private function path(?Node $expr, array $bindings, ClassLike $class): ?array
    {
        return match (true) {
            $expr instanceof Variable                                                                                              => \is_string($expr->name) && isset($bindings[$expr->name]) ? $bindings[$expr->name] : null,
            $expr instanceof PropertyFetch, $expr instanceof NullsafePropertyFetch                                                 => $this->propertyPath($expr, $bindings, $class),
            $expr instanceof ArrayDimFetch                                                                                         => $this->dimPath($expr, $bindings, $class),
            $expr instanceof Cast\Object_, $expr instanceof Cast\Array_, $expr instanceof Cast\String_, $expr instanceof Cast\Int_ => $this->path($expr->expr, $bindings, $class),
            $expr instanceof BinaryOp\Coalesce                                                                                     => $this->path($expr->left, $bindings, $class),
            $expr instanceof Ternary                                                                                               => $this->path($expr->if ?? $expr->cond, $bindings, $class),
            $expr instanceof FuncCall                                                                                              => $this->funcPath($expr, $bindings, $class),
            $expr instanceof StaticCall, $expr instanceof MethodCall                                                               => $this->returnPath($expr, $bindings, $class),
            default                                                                                                                => null,
        };
    }

    private function propertyPath(PropertyFetch|NullsafePropertyFetch $expr, array $bindings, ClassLike $class): ?array
    {
        $base = $this->path($expr->var, $bindings, $class);

        if ($base === null) {
            return null;
        }

        $name = $expr->name instanceof Identifier ? $expr->name->toString() : ($expr->name instanceof Scalar\String_ ? $expr->name->value : null);

        return $name === null ? null : [...$base, $name];
    }

    private function dimPath(ArrayDimFetch $expr, array $bindings, ClassLike $class): ?array
    {
        $base = $this->path($expr->var, $bindings, $class);

        if ($base === null) {
            return null;
        }

        if ($expr->dim instanceof Scalar\String_) {
            return [...$base, $expr->dim->value];
        }

        return [...$base, self::LIST];
    }

    private function funcPath(FuncCall $call, array $bindings, ClassLike $class): ?array
    {
        if (!$call->name instanceof Name || !\in_array(strtolower($call->name->toString()), self::PASSTHROUGH, true)) {
            return null;
        }

        $first = $call->args[0] ?? null;

        return $first instanceof Arg ? $this->path($first->value, $bindings, $class) : null;
    }

    private function returnPath(StaticCall|MethodCall $call, array $bindings, ClassLike $class): ?array
    {
        $target = $this->callee($call, $class);

        if ($target === null) {
            return null;
        }

        [, $method] = $target;

        foreach ($this->finder->findInstanceOf($method->stmts ?? [], Return_::class) as $return) {
            if (!$return->expr instanceof Variable) {
                continue;
            }
            foreach ($method->params as $index => $param) {
                if ($param->var instanceof Variable && $param->var->name === $return->expr->name) {
                    $arg = $call->args[$index] ?? null;

                    return $arg instanceof Arg ? $this->path($arg->value, $bindings, $class) : null;
                }
            }
        }

        return null;
    }

    /**
     * @return null|array{0: ClassLike, 1: ClassMethod}
     */
    private function callee(StaticCall|MethodCall|NullsafeMethodCall $call, ClassLike $class): ?array
    {
        if (!$call->name instanceof Identifier) {
            return null;
        }

        $own = $class->namespacedName?->toString() ?? '';
        $target = null;

        if ($call instanceof StaticCall && $call->class instanceof Name) {
            $name = $call->class->toString();
            $target = \in_array(strtolower($name), ['self', 'static', 'parent'], true) ? $own : $name;
        } elseif ($call instanceof MethodCall || $call instanceof NullsafeMethodCall) {
            if ($call->var instanceof Variable && $call->var->name === 'this') {
                $target = $own;
            } elseif ($call->var instanceof New_ && $call->var->class instanceof Name) {
                $target = $call->var->class->toString();
            }
        }

        if ($target === null || $target === '') {
            return null;
        }

        if ($target === $own) {
            $method = $class->getMethod($call->name->toString());

            return $method instanceof ClassMethod ? [$class, $method] : $this->method($own, $call->name->toString());
        }

        return $this->method($target, $call->name->toString());
    }

    private function follow(StaticCall|MethodCall|NullsafeMethodCall $call, array $bindings, ClassLike $class, int $depth): void
    {
        $inner = [];

        foreach ($call->args as $index => $arg) {
            if ($arg instanceof Arg && ($path = $this->path($arg->value, $bindings, $class)) !== null) {
                $inner[$index] = $path;
            }
        }

        if ($inner === []) {
            return;
        }

        $target = $this->callee($call, $class);

        if ($target === null) {
            return;
        }

        [$targetClass, $targetMethod] = $target;
        $calleeBindings = [];

        foreach ($inner as $index => $path) {
            $param = $targetMethod->params[$index]->var ?? null;
            if ($param instanceof Variable && \is_string($param->name)) {
                $calleeBindings[$param->name] = $path;
            }
        }

        if ($calleeBindings !== []) {
            $this->analyze($targetClass, $targetMethod, $calleeBindings, $depth + 1);
        }
    }

    private function funcCall(FuncCall $call, array $bindings, ClassLike $class): void
    {
        $name = strtolower($call->name->toString());
        $args = array_values(array_map(static fn ($a) => $a instanceof Arg ? $a->value : null, $call->args));

        if ($name === 'property_exists' && ($path = $this->path($args[0] ?? null, $bindings, $class)) !== null && ($args[1] ?? null) instanceof Scalar\String_) {
            $this->register([...$path, $args[1]->value]);
        } elseif ($name === 'in_array' && ($path = $this->path($args[0] ?? null, $bindings, $class)) !== null && ($args[1] ?? null) instanceof Array_) {
            foreach ($args[1]->items as $item) {
                if ($item !== null && ($literal = self::literal($item->value)) !== null) {
                    $this->register($path, hint: $literal);

                    break;
                }
            }
        }
    }

    private function hintPair(Expr $side, Expr $other, array $bindings, ClassLike $class): void
    {
        $literal = self::literal($other);

        if ($literal === null) {
            return;
        }

        $path = $this->path($side, $bindings, $class);

        if ($path !== null && $path !== []) {
            $this->register($path, hint: $literal);
        }
    }

    private static function literal(?Node $node): string|int|float|null
    {
        return match (true) {
            $node instanceof Scalar\String_                              => $node->value === '' ? null : $node->value,
            $node instanceof Scalar\Int_, $node instanceof Scalar\Float_ => $node->value,
            default                                                      => null,
        };
    }

    /**
     * @param list<string> $path
     */
    private function register(array $path, bool $list = false, string|int|float|null $hint = null): void
    {
        if ($path === []) {
            return;
        }

        $node = &$this->tree;
        foreach ($path as $segment) {
            $node['children'][$segment] ??= [];
            $node = &$node['children'][$segment];
        }

        if ($list) {
            $node['list'] = true;
        }

        if ($hint !== null && !isset($node['hint'])) {
            $node['hint'] = $hint;
        }

        unset($node);
    }

    private function materialize(array $node, ?string $name): mixed
    {
        $children = $node['children'] ?? [];

        if (isset($children[self::LIST]) && \count($children) === 1) {
            return [$this->materialize($children[self::LIST], $name)];
        }

        unset($children[self::LIST]);

        if ($children === []) {
            if (!empty($node['list'])) {
                return [$this->leaf($name ?? 'item', $node)];
            }

            return $name === null ? [] : $this->leaf($name, $node);
        }

        ksort($children, SORT_STRING);
        $object = [];
        foreach ($children as $child => $childNode) {
            $object[(string) $child] = $this->materialize($childNode, (string) $child);
        }

        return $object;
    }

    private function leaf(string $name, array $node): string|int|float
    {
        if (isset($node['hint'])) {
            return $node['hint'];
        }

        if (\array_key_exists($name, $this->overrides)) {
            return $this->overrides[$name];
        }

        $lower = strtolower($name);

        return match (true) {
            str_contains($lower, 'email')                                                => 'smoke@example.com',
            (bool) preg_match('~(^|_)ids?$|[a-z]Ids?$~', $name)                          => '101',
            (bool) preg_match('~url|endpoint|domain|website~', $lower)                   => 'https://example.com',
            str_contains($lower, 'date')                                                 => '2024-01-15',
            (bool) preg_match('~(^|_)(page|limit|per_page|count|offset|size)$~', $lower) => '1',
            default                                                                      => 'smoke_' . $name,
        };
    }
}
