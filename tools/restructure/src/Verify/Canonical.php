<?php

declare(strict_types=1);

namespace BitApps\Restructure\Verify;

use BitApps\Restructure\Analyze\Reference;
use BitApps\Restructure\Php\Names;
use PhpParser\Modifiers;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Name;
use PhpParser\Node\Scalar\MagicConst;
use PhpParser\Node\Scalar\String_;
use PhpParser\Node\Stmt;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitor\CloningVisitor;
use PhpParser\NodeVisitorAbstract;

final class Canonical
{
    private const VISIBILITY = Modifiers::PUBLIC | Modifiers::PROTECTED | Modifiers::PRIVATE;

    /**
     * The base member as it must read after the move: names resolved, then every class it names
     * mapped through the manifests (member-aware for split Controllers).
     *
     * @param string $ownOld       FQCN that declared the member at base
     * @param string $newEnclosing FQCN of the class this copy of the member lives in now
     */
    public static function expected(Node $member, string $ownOld, string $newEnclosing, UnitMap $map): string
    {
        $clone = self::cloneNode($member);
        $visitor = new class($ownOld, $newEnclosing, $map) extends NodeVisitorAbstract {
            public function __construct(private readonly string $ownOld, private readonly string $enclosing, private readonly UnitMap $map)
            {
            }

            public function leaveNode(Node $node)
            {
                return Canonical::rewriteBase($node, $this->ownOld, $this->enclosing, $this->map);
            }
        };
        (new NodeTraverser($visitor))->traverse([$clone]);

        return self::dump($clone);
    }

    public static function actual(Node $member): string
    {
        return self::dump(self::cloneNode($member));
    }

    /**
     * @internal
     */
    public static function rewriteBase(Node $node, string $ownOld, string $enclosing, UnitMap $map): ?Node
    {
        $split = $map->isSplit($ownOld);

        if (($node instanceof Expr\MethodCall || $node instanceof Expr\NullsafeMethodCall) && Names::isThis($node->var) && $node->name instanceof Node\Identifier && $split) {
            $holder = self::holder($map, $ownOld, 'method:' . $node->name->toLowerString(), $enclosing);

            return $holder === $enclosing ? null : new Expr\StaticCall(new Name\FullyQualified($holder), $node->name, $node->args);
        }

        if ($node instanceof Expr\StaticCall || $node instanceof Expr\StaticPropertyFetch || ($node instanceof Expr\ClassConstFetch && !self::isClassFetch($node))) {
            $member = self::memberKey($node);

            if ($member === null) {
                return null;
            }

            $node->class = self::mapClassPart($node->class, $member, $ownOld, $enclosing, $map, self::kindOf($node));

            return null;
        }

        if ($node instanceof Expr\New_ && ($node->class instanceof Name || Names::isThis($node->class))) {
            $node->class = self::mapClassPart($node->class, 'method:__construct', $ownOld, $enclosing, $map, Reference::NEW);

            return null;
        }

        if ($node instanceof Expr\Array_) {
            $callable = Names::callableArray($node);

            if ($callable === null) {
                return null;
            }

            $first = $node->items[0]->value;
            $method = 'method:' . strtolower($callable[1]);
            $holder = null;

            if (Names::isThis($first) || $first instanceof MagicConst\Class_) {
                $holder = $split ? self::holder($map, $ownOld, $method, $enclosing) : null;
                $holder = $holder === $enclosing ? null : $holder;
            } elseif ($first instanceof Expr\ClassConstFetch && self::isClassFetch($first) && $first->class instanceof Name) {
                $first->class = self::mapClassPart($first->class, $method, $ownOld, $enclosing, $map, Reference::CALLABLE);
            } elseif ($first instanceof String_) {
                $value = ltrim($first->value, '\\');

                if ($value === $ownOld && $split) {
                    $holder = self::holder($map, $ownOld, $method, $enclosing);
                } elseif ($map->isRenamed($value)) {
                    $holder = $map->external($value, $method, Reference::CALLABLE);
                }
            }

            if ($holder !== null) {
                $node->items[0]->value = new Expr\ClassConstFetch(new Name\FullyQualified($holder), new Node\Identifier('class'));
            }

            return null;
        }

        if ($node instanceof Expr\ClassConstFetch && self::isClassFetch($node) && $node->class instanceof Name && !Names::isCallableArrayClassPart($node)) {
            $node->class = self::mapClassPart($node->class, null, $ownOld, $enclosing, $map, Reference::CLASS_NAME);

            return null;
        }

        if ($node instanceof String_ && !Names::isCallableArrayClassPart($node)) {
            $value = ltrim($node->value, '\\');

            if ($value === $ownOld && $split) {
                return new Expr\ClassConstFetch(new Name\FullyQualified((string) $map->primary($ownOld)), new Node\Identifier('class'));
            }

            if ($value !== $ownOld && $map->isRenamed($value)) {
                return new Expr\ClassConstFetch(new Name\FullyQualified($map->external($value, null, Reference::STRING_FQCN)), new Node\Identifier('class'));
            }

            return null;
        }

        if ($node instanceof Name && !$node->isSpecialClassName() && self::isClassPosition($node) && !self::isHandledByParent($node)) {
            $fqcn = (string) Names::resolved($node);

            if ($fqcn === $ownOld) {
                return new Name\FullyQualified($split ? $enclosing : (string) $map->primary($ownOld));
            }

            return new Name\FullyQualified($map->isRenamed($fqcn) ? $map->external($fqcn, null, Reference::TYPE) : $fqcn);
        }

        return null;
    }

    /**
     * Visibility bits removed from the flags of a class member, so widening is checked separately.
     */
    public static function withoutVisibility(Node $member): Node
    {
        $clone = self::cloneNode($member);

        if ($clone instanceof Stmt\ClassMethod || $clone instanceof Stmt\Property || $clone instanceof Stmt\ClassConst) {
            $clone->flags &= ~self::VISIBILITY;
        }

        return $clone;
    }

    /**
     * @param list<int> $keep
     */
    public static function withStatements(Stmt\ClassMethod $method, array $keep): Stmt\ClassMethod
    {
        $clone = self::cloneNode($method);
        \assert($clone instanceof Stmt\ClassMethod);
        $clone->stmts = array_values(array_filter($clone->stmts ?? [], static fn ($stmt, $index) => \in_array($index, $keep, true), ARRAY_FILTER_USE_BOTH));

        return $clone;
    }

    public static function visibility(Node $member): string
    {
        $flags = $member instanceof Stmt\ClassMethod || $member instanceof Stmt\Property || $member instanceof Stmt\ClassConst ? $member->flags : 0;

        return match (true) {
            (bool) ($flags & Modifiers::PRIVATE)   => 'private',
            (bool) ($flags & Modifiers::PROTECTED) => 'protected',
            default                                => 'public',
        };
    }

    public static function dump(Node $node): string
    {
        return json_encode(self::toArray($node), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR) ?: '';
    }

    /**
     * @return string human-readable first difference between two dumps
     */
    public static function firstDifference(string $expected, string $actual): string
    {
        $length = min(\strlen($expected), \strlen($actual));
        $at = 0;

        while ($at < $length && $expected[$at] === $actual[$at]) {
            $at++;
        }

        $from = max(0, $at - 60);

        return 'expected ...' . substr($expected, $from, 140) . '... but found ...' . substr($actual, $from, 140) . '...';
    }

    private static function holder(UnitMap $map, string $ownOld, string $member, string $enclosing): string
    {
        $holders = $map->holders($ownOld, $member);

        if ($holders === [] || \in_array($enclosing, $holders, true)) {
            return $enclosing;
        }

        return $holders[0];
    }

    private static function mapClassPart(Node $class, ?string $member, string $ownOld, string $enclosing, UnitMap $map, string $kind): Node
    {
        $split = $map->isSplit($ownOld);

        if (Names::isThis($class) || ($class instanceof Name && \in_array(Names::special($class), ['self', 'static'], true))) {
            if (!$split || $member === null) {
                return $class;
            }

            $holder = self::holder($map, $ownOld, $member, $enclosing);

            return $holder === $enclosing ? $class : new Name\FullyQualified($holder);
        }

        if (!$class instanceof Name || $class->isSpecialClassName()) {
            return $class;
        }

        $fqcn = (string) Names::resolved($class);

        if ($fqcn === $ownOld) {
            if (!$split) {
                return new Name\FullyQualified((string) $map->primary($ownOld));
            }

            return new Name\FullyQualified($member === null ? $enclosing : self::holder($map, $ownOld, $member, $enclosing));
        }

        return new Name\FullyQualified($map->isRenamed($fqcn) ? $map->external($fqcn, $member, $kind) : $fqcn);
    }

    private static function memberKey(Node $node): ?string
    {
        return match (true) {
            $node instanceof Expr\StaticCall && $node->name instanceof Node\Identifier                 => 'method:' . $node->name->toLowerString(),
            $node instanceof Expr\StaticPropertyFetch && $node->name instanceof Node\VarLikeIdentifier => 'property:' . $node->name->toString(),
            $node instanceof Expr\ClassConstFetch && $node->name instanceof Node\Identifier            => 'const:' . $node->name->toString(),
            default                                                                                    => null,
        };
    }

    private static function kindOf(Node $node): string
    {
        return match (true) {
            $node instanceof Expr\StaticCall          => Reference::STATIC_CALL,
            $node instanceof Expr\StaticPropertyFetch => Reference::STATIC_PROP,
            default                                   => Reference::CONST,
        };
    }

    private static function isClassFetch(Expr\ClassConstFetch $node): bool
    {
        return $node->name instanceof Node\Identifier && $node->name->toLowerString() === 'class';
    }

    private static function isHandledByParent(Name $name): bool
    {
        $parent = $name->getAttribute('parent');

        return ($parent instanceof Expr\StaticCall || $parent instanceof Expr\StaticPropertyFetch || $parent instanceof Expr\ClassConstFetch || $parent instanceof Expr\New_)
            && $parent->class === $name;
    }

    private static function isClassPosition(Name $name): bool
    {
        $parent = $name->getAttribute('parent');

        if ($parent instanceof Expr\FuncCall && $parent->name === $name) {
            return false;
        }

        return !($parent instanceof Expr\ConstFetch && $parent->name === $name) && !$parent instanceof Stmt\Namespace_;
    }

    private static function cloneNode(Node $node): Node
    {
        $parents = new class() extends NodeVisitorAbstract {
            /**
             * @var list<Node>
             */
            private array $stack = [];

            public function enterNode(Node $node)
            {
                if ($this->stack !== []) {
                    $node->setAttribute('parent', $this->stack[\count($this->stack) - 1]);
                }

                $this->stack[] = $node;
            }

            public function leaveNode(Node $node)
            {
                array_pop($this->stack);
            }
        };
        [$clone] = (new NodeTraverser(new CloningVisitor()))->traverse([$node]);
        (new NodeTraverser($parents))->traverse([$clone]);

        return $clone;
    }

    /**
     * @return mixed
     */
    private static function toArray(mixed $value)
    {
        if (\is_array($value)) {
            return array_map([self::class, 'toArray'], $value);
        }

        if (!$value instanceof Node) {
            return $value;
        }

        if ($value instanceof Name) {
            if ($value->isSpecialClassName()) {
                return ['Name' => strtolower($value->toString())];
            }

            $resolved = $value instanceof Name\FullyQualified ? $value->toString() : Names::resolved($value);
            $position = self::isClassPosition($value) ? 'class' : 'symbol';

            return ['Name' => $position === 'class' ? '\\' . ltrim((string) $resolved, '\\') : $value->toString()];
        }

        $out = ['@' => $value->getType()];

        foreach ($value->getSubNodeNames() as $name) {
            $out[$name] = self::toArray($value->{$name});
        }

        return $out;
    }
}
