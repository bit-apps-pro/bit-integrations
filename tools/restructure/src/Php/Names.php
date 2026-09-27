<?php

declare(strict_types=1);

namespace BitApps\Restructure\Php;

use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Name;
use PhpParser\Node\Scalar\String_;
use PhpParser\Node\Stmt;

final class Names
{
    public static function special(Node $name): ?string
    {
        return $name instanceof Name && $name->isSpecialClassName() ? strtolower($name->toString()) : null;
    }

    public static function resolved(Name $name): ?string
    {
        if ($name->isSpecialClassName()) {
            return null;
        }

        $resolved = $name->getAttribute('resolvedName');

        return $resolved instanceof Name ? $resolved->toString() : ltrim($name->toString(), '\\');
    }

    public static function classOf(Stmt\ClassLike $class): ?string
    {
        return $class->namespacedName?->toString();
    }

    public static function isThis(?Node $node): bool
    {
        return $node instanceof Expr\Variable && $node->name === 'this';
    }

    /**
     * @return array{0: Node, 1: string}|null the class part and the method name of a two-item callable array
     */
    public static function callableArray(Expr\Array_ $array): ?array
    {
        if (\count($array->items) !== 2) {
            return null;
        }

        [$first, $second] = $array->items;

        if ($first === null || $second === null || $first->key !== null || $second->key !== null || $first->unpack || $second->unpack || $first->byRef || $second->byRef) {
            return null;
        }

        if (!$second->value instanceof String_) {
            return null;
        }

        return [$first->value, $second->value->value];
    }

    public static function isCallableArrayClassPart(Node $node): bool
    {
        $item = $node->getAttribute('parent');

        if (!$item instanceof Node\ArrayItem || $item->value !== $node) {
            return false;
        }

        $array = $item->getAttribute('parent');

        return $array instanceof Expr\Array_ && ($array->items[0] ?? null) === $item && self::callableArray($array) !== null;
    }

    public static function callableMethodFor(Node $classPart): ?string
    {
        $item = $classPart->getAttribute('parent');
        $array = $item instanceof Node ? $item->getAttribute('parent') : null;

        if (!$array instanceof Expr\Array_ || ($array->items[0] ?? null) !== $item) {
            return null;
        }

        $callable = self::callableArray($array);

        return $callable === null ? null : $callable[1];
    }

    public static function isValidIdentifier(string $name): bool
    {
        return preg_match('/^[A-Za-z_\x80-\xff][A-Za-z0-9_\x80-\xff]*$/', $name) === 1;
    }
}
