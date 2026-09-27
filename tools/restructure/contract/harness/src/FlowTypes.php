<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use PhpParser\Node;
use PhpParser\Node\Expr\Assign;
use PhpParser\Node\Expr\Variable;
use PhpParser\Node\Scalar\String_;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\Node\Stmt\Expression;
use PhpParser\Node\Stmt\Switch_;
use PhpParser\NodeFinder;
use RuntimeException;

/**
 * Maps a stored flow `type` to the action folder name the way Flow::execute does:
 * normalize, then the alias switch read from Flow.php itself.
 */
final class FlowTypes
{
    /**
     * @var array<string, string>
     */
    private array $aliases = [];

    public function __construct(Source $source, Workspace $workspace)
    {
        $ast = $source->parse($workspace->freeDir . '/backend/Flow/Flow.php') ?? throw new RuntimeException('Flow.php does not parse');
        $finder = new NodeFinder();
        $execute = $finder->findFirst($ast, static fn (Node $n) => $n instanceof ClassMethod && $n->name->toLowerString() === 'execute');

        if (!$execute instanceof ClassMethod) {
            throw new RuntimeException('Flow::execute not found');
        }

        $switch = $finder->findFirst($execute->stmts ?? [], static fn (Node $n) => $n instanceof Switch_ && $n->cond instanceof Variable && $n->cond->name === 'integrationName');

        if (!$switch instanceof Switch_) {
            throw new RuntimeException('the alias switch in Flow::execute was not found');
        }

        $pending = [];
        foreach ($switch->cases as $case) {
            if ($case->cond instanceof String_) {
                $pending[] = $case->cond->value;
            }

            foreach ($case->stmts as $stmt) {
                if ($stmt instanceof Expression && $stmt->expr instanceof Assign && $stmt->expr->expr instanceof String_) {
                    foreach ($pending as $alias) {
                        $this->aliases[$alias] = $stmt->expr->expr->value;
                    }
                    $pending = [];
                }
            }

            if ($case->stmts !== []) {
                $pending = [];
            }
        }
    }

    public function resolve(?string $type): ?string
    {
        if ($type === null || $type === '') {
            return null;
        }

        $name = ucfirst(str_replace(' ', '', $type));

        return $this->aliases[$name] ?? $name;
    }
}
