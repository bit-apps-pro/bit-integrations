<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use PhpParser\Node;
use PhpParser\Node\Arg;
use PhpParser\Node\Expr;
use PhpParser\Node\Expr\Array_;
use PhpParser\Node\Expr\ClassConstFetch;
use PhpParser\Node\Expr\MethodCall;
use PhpParser\Node\Expr\StaticCall;
use PhpParser\Node\Identifier;
use PhpParser\Node\Name;
use PhpParser\Node\Scalar\String_;
use PhpParser\Node\Stmt\Expression;
use PhpParser\NodeFinder;

final class RouteCatalog
{
    private const ROUTE_CLASS = 'BitApps\\Integrations\\Core\\Util\\Route';

    private const VERBS = ['get' => 'GET', 'post' => 'POST', 'request' => null];

    public function __construct(private Workspace $workspace, private Source $source)
    {
    }

    /**
     * @return list<array<string, mixed>> routes in file order; unparseable registrations carry 'error'
     */
    public function routes(string $integration): array
    {
        $file = $this->workspace->actionsDir('free') . '/' . $integration . '/Routes.php';

        if (!is_file($file)) {
            return [];
        }

        $ast = $this->source->parse($file);

        if ($ast === null) {
            return [['integration' => $integration, 'error' => 'Routes.php does not parse']];
        }

        $routes = [];

        foreach ((new NodeFinder())->findInstanceOf($ast, Expression::class) as $statement) {
            $chain = $this->chain($statement->expr);

            if ($chain === null) {
                continue;
            }

            [$calls, $root] = $chain;
            $final = end($calls);
            $verb = strtolower($final['name']);

            if (!\array_key_exists($verb, self::VERBS)) {
                continue;
            }

            $args = $final['args'];
            $method = self::VERBS[$verb];

            if ($method === null) {
                $method = self::string($args[0] ?? null);
                $args = \array_slice($args, 1);
            }

            $hook = self::string($args[0] ?? null);
            $callable = $this->callable($args[1] ?? null);
            $line = $statement->getStartLine();

            if ($hook === null || $method === null || $callable === null) {
                $routes[] = ['integration' => $integration, 'line' => $line, 'error' => 'registration is not a literal hook with a [Class::class, method] callable'];

                continue;
            }

            $routes[] = [
                'integration' => $integration,
                'hook'        => $hook,
                'method'      => strtoupper($method),
                'class'       => $callable[0],
                'function'    => $callable[1],
                'flags'       => array_values(array_map(static fn ($call) => strtolower($call['name']), \array_slice($calls, 0, -1))),
            ];
        }

        return $routes;
    }

    /**
     * @return null|array{0: list<array{name: string, args: list<Expr>}>, 1: string}
     */
    private function chain(Expr $expr): ?array
    {
        $calls = [];

        while ($expr instanceof MethodCall) {
            if (!$expr->name instanceof Identifier) {
                return null;
            }
            array_unshift($calls, ['name' => $expr->name->toString(), 'args' => self::args($expr->args)]);
            $expr = $expr->var;
        }

        if (!$expr instanceof StaticCall || !$expr->class instanceof Name || !$expr->name instanceof Identifier) {
            return null;
        }

        if ($expr->class->toString() !== self::ROUTE_CLASS) {
            return null;
        }

        array_unshift($calls, ['name' => $expr->name->toString(), 'args' => self::args($expr->args)]);

        return [$calls, self::ROUTE_CLASS];
    }

    /**
     * @return list<Expr>
     */
    private static function args(array $args): array
    {
        return array_values(array_map(static fn ($arg) => $arg instanceof Arg ? $arg->value : null, $args));
    }

    private static function string(?Node $node): ?string
    {
        return $node instanceof String_ ? $node->value : null;
    }

    /**
     * @return null|array{0: string, 1: string}
     */
    private function callable(?Node $node): ?array
    {
        if (!$node instanceof Array_ || \count($node->items) !== 2) {
            return null;
        }

        [$classItem, $methodItem] = [$node->items[0]?->value, $node->items[1]?->value];
        $method = self::string($methodItem);

        if ($method === null) {
            return null;
        }

        if ($classItem instanceof ClassConstFetch && $classItem->class instanceof Name && $classItem->name instanceof Identifier && strtolower($classItem->name->toString()) === 'class') {
            return [$classItem->class->toString(), $method];
        }

        $class = self::string($classItem);

        return $class === null ? null : [ltrim($class, '\\'), $method];
    }
}
