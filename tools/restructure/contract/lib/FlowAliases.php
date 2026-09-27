<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use PhpParser\Node;
use PhpParser\Node\Expr\Assign;
use PhpParser\Node\Expr\Variable;
use PhpParser\Node\Scalar\String_;
use PhpParser\Node\Stmt\Break_;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\Node\Stmt\Expression;
use PhpParser\Node\Stmt\Switch_;
use PhpParser\NodeFinder;
use RuntimeException;

final class FlowAliases
{
    private const VARIABLE = 'integrationName';

    /**
     * @return list<array{0: string, 1: string}> switch cases in source order
     */
    public static function fromFile(string $flowFile): array
    {
        $finder = new NodeFinder();
        $execute = $finder->findFirst(
            ParserKit::parseFile($flowFile),
            static fn (Node $node) => $node instanceof ClassMethod && $node->name->toLowerString() === 'execute'
        );

        if (!$execute instanceof ClassMethod) {
            throw new RuntimeException('Flow::execute not found');
        }

        $switches = $finder->find(
            $execute->stmts ?? [],
            static fn (Node $node) => $node instanceof Switch_ && self::isAliasVariable($node->cond)
        );

        if (\count($switches) !== 1) {
            throw new RuntimeException(\sprintf('expected one switch on $%s in Flow::execute, found %d', self::VARIABLE, \count($switches)));
        }

        $aliases = [];
        $fallingThrough = [];

        foreach ($switches[0]->cases as $case) {
            $target = self::assignedTarget($case->stmts);

            if ($case->cond === null) {
                if ($target !== null && !self::isAliasVariable($target)) {
                    throw new RuntimeException('the default branch of the alias switch no longer keeps the name unchanged');
                }

                continue;
            }

            if (!$case->cond instanceof String_) {
                throw new RuntimeException('an alias case is not a string literal');
            }

            $fallingThrough[] = $case->cond->value;

            if ($target === null && $case->stmts === []) {
                continue;
            }

            if (!$target instanceof String_) {
                throw new RuntimeException("alias case '{$case->cond->value}' does not assign a string literal");
            }

            foreach ($fallingThrough as $caseValue) {
                $aliases[] = [$caseValue, $target->value];
            }

            $fallingThrough = [];
        }

        return $aliases;
    }

    /**
     * @param list<array{0: string, 1: string}> $aliases
     */
    public static function apply(string $name, array $aliases): string
    {
        foreach ($aliases as [$caseValue, $target]) {
            // Loose on purpose: switch compares with ==.
            if ($name == $caseValue) {
                return $target;
            }
        }

        return $name;
    }

    /**
     * @param Node\Stmt[] $stmts
     */
    private static function assignedTarget(array $stmts): ?Node\Expr
    {
        $target = null;

        foreach ($stmts as $stmt) {
            if ($stmt instanceof Break_) {
                continue;
            }

            if ($stmt instanceof Expression && $stmt->expr instanceof Assign && self::isAliasVariable($stmt->expr->var) && $target === null) {
                $target = $stmt->expr->expr;

                continue;
            }

            throw new RuntimeException('the alias switch contains a statement other than one assignment and break');
        }

        return $target;
    }

    private static function isAliasVariable(Node $node): bool
    {
        return $node instanceof Variable && $node->name === self::VARIABLE;
    }
}
