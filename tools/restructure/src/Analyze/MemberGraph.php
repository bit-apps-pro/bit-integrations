<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Php\ClassLayout;
use BitApps\Restructure\Php\Member;
use BitApps\Restructure\Php\Names;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Name;
use PhpParser\Node\Scalar\MagicConst;
use PhpParser\Node\Scalar\String_;
use PhpParser\Node\Stmt;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitorAbstract;

final class MemberGraph
{
    /**
     * @var list<Edge>
     */
    public array $edges = [];

    /**
     * Things the move cannot see through, keyed by kind: dynamic, classNameValue, thisEscapes,
     * instanceofSelf, parentReference, classNameString.
     *
     * @var list<array{kind: string, member: string, line: int, text: string}>
     */
    public array $notes = [];

    private function __construct(public readonly ClassLayout $layout, public readonly string $fqcn)
    {
    }

    public static function of(ClassLayout $layout, string $fqcn): self
    {
        $graph = new self($layout, $fqcn);

        foreach ($layout->members as $member) {
            if ($member->isCode()) {
                $graph->collect($member);
            }
        }

        return $graph;
    }

    /**
     * @return list<Edge>
     */
    public function from(string $key): array
    {
        return array_values(array_filter($this->edges, static fn (Edge $edge) => $edge->from === $key));
    }

    /**
     * @return list<Edge>
     */
    public function to(string $key): array
    {
        return array_values(array_filter($this->edges, static fn (Edge $edge) => $edge->to === $key));
    }

    /**
     * @return list<array{kind: string, member: string, line: int, text: string}>
     */
    public function notes(string $kind): array
    {
        return array_values(array_filter($this->notes, static fn (array $note) => $note['kind'] === $kind));
    }

    /**
     * @internal
     */
    public function addEdge(Edge $edge): void
    {
        $this->edges[] = $edge;
    }

    /**
     * @internal
     */
    public function addNote(string $kind, string $member, Node $node): void
    {
        $text = preg_replace('/\s+/', ' ', $this->layout->source->nodeText($node)) ?? '';
        $this->notes[] = ['kind' => $kind, 'member' => $member, 'line' => $node->getStartLine(), 'text' => mb_strimwidth($text, 0, 160, '...')];
    }

    /**
     * @internal
     */
    public function ownVia(Node $class): ?string
    {
        if (Names::isThis($class)) {
            return 'this-static';
        }

        if (!$class instanceof Name) {
            return null;
        }

        $special = Names::special($class);

        if ($special === 'self' || $special === 'static') {
            return $special;
        }

        if ($special === 'parent') {
            return null;
        }

        return strcasecmp((string) Names::resolved($class), $this->fqcn) === 0 ? 'class' : null;
    }

    /**
     * @internal
     */
    public function visit(string $key, Node $node): void
    {
        if ($node instanceof Expr\StaticCall || $node instanceof Expr\StaticPropertyFetch || $node instanceof Expr\ClassConstFetch) {
            $this->visitStaticAccess($key, $node);

            return;
        }

        if (($node instanceof Expr\MethodCall || $node instanceof Expr\NullsafeMethodCall) && Names::isThis($node->var)) {
            if ($node->name instanceof Node\Identifier) {
                $this->addEdge(new Edge($key, 'method:' . $node->name->toLowerString(), Edge::CALL, 'this', $node->getStartLine(), $node->var->getStartFilePos(), $node->name->getStartFilePos()));
            } else {
                $this->addNote('dynamic', $key, $node);
            }

            return;
        }

        if (($node instanceof Expr\PropertyFetch || $node instanceof Expr\NullsafePropertyFetch) && Names::isThis($node->var)) {
            if ($node->name instanceof Node\Identifier) {
                $this->addEdge(new Edge($key, 'property:' . $node->name->toString(), Edge::PROPERTY, 'this', $node->getStartLine(), $node->var->getStartFilePos(), $node->name->getStartFilePos(), self::isWrite($node)));
            } else {
                $this->addNote('dynamic', $key, $node);
            }

            return;
        }

        if ($node instanceof MagicConst\Class_) {
            $method = Names::isCallableArrayClassPart($node) ? Names::callableMethodFor($node) : null;

            if ($method !== null) {
                $this->addEdge(new Edge($key, 'method:' . strtolower($method), Edge::CALLABLE, 'magic-class', $node->getStartLine(), $node->getStartFilePos(), $node->getEndFilePos() + 1));
            } else {
                $this->addNote('classNameValue', $key, $node);
            }

            return;
        }

        if ($node instanceof Expr\Array_) {
            $this->visitArray($key, $node);

            return;
        }

        if ($node instanceof String_) {
            $this->visitString($key, $node);

            return;
        }

        if ($node instanceof Expr\New_ && $node->class instanceof Name && $this->ownVia($node->class) !== null) {
            $this->addEdge(new Edge($key, 'method:__construct', Edge::NEW, (string) $this->ownVia($node->class), $node->getStartLine(), $node->class->getStartFilePos(), $node->class->getEndFilePos() + 1));

            return;
        }

        if ($node instanceof Expr\Instanceof_ && $node->class instanceof Name && $this->ownVia($node->class) !== null) {
            $this->addNote('instanceofSelf', $key, $node);

            return;
        }

        if ($node instanceof Expr\FuncCall && $node->name instanceof Name) {
            $function = strtolower($node->name->getLast());

            if ($function === 'get_called_class' || ($function === 'get_class' && ($node->args === [] || ($node->args[0] instanceof Node\Arg && Names::isThis($node->args[0]->value))))) {
                $this->addNote('classNameValue', $key, $node);
            }

            return;
        }

        if ($node instanceof Expr\Variable && Names::isThis($node)) {
            $this->visitThis($key, $node);
        }
    }

    private function collect(Member $member): void
    {
        $graph = $this;
        $key = $member->key;
        $visitor = new class($graph, $key) extends NodeVisitorAbstract {
            public function __construct(private readonly MemberGraph $graph, private readonly string $key)
            {
            }

            public function enterNode(Node $node)
            {
                $this->graph->visit($this->key, $node);
            }
        };

        (new NodeTraverser($visitor))->traverse([$member->stmt]);
    }

    private function visitStaticAccess(string $key, Expr\StaticCall|Expr\StaticPropertyFetch|Expr\ClassConstFetch $node): void
    {
        if ($node->class instanceof Name && Names::special($node->class) === 'parent') {
            $this->addNote('parentReference', $key, $node);

            return;
        }

        $via = $this->ownVia($node->class);

        if ($via === null) {
            return;
        }

        $start = $node->class->getStartFilePos();
        $end = $node->class->getEndFilePos() + 1;

        if ($node instanceof Expr\StaticCall) {
            if ($node->name instanceof Node\Identifier) {
                $this->addEdge(new Edge($key, 'method:' . $node->name->toLowerString(), Edge::CALL, $via, $node->getStartLine(), $start, $end));
            } else {
                $this->addNote('dynamic', $key, $node);
            }

            return;
        }

        if ($node instanceof Expr\StaticPropertyFetch) {
            if ($node->name instanceof Node\VarLikeIdentifier) {
                $this->addEdge(new Edge($key, 'property:' . $node->name->toString(), Edge::PROPERTY, $via, $node->getStartLine(), $start, $end, self::isWrite($node)));
            } else {
                $this->addNote('dynamic', $key, $node);
            }

            return;
        }

        if (!$node->name instanceof Node\Identifier) {
            $this->addNote('dynamic', $key, $node);

            return;
        }

        if ($node->name->toLowerString() !== 'class') {
            $this->addEdge(new Edge($key, 'const:' . $node->name->toString(), Edge::CONSTANT, $via, $node->getStartLine(), $start, $end));

            return;
        }

        $method = Names::isCallableArrayClassPart($node) ? Names::callableMethodFor($node) : null;

        if ($method !== null) {
            $this->addEdge(new Edge($key, 'method:' . strtolower($method), Edge::CALLABLE, $via, $node->getStartLine(), $start, $end));
        } else {
            $this->addNote('classNameValue', $key, $node);
        }
    }

    private function visitArray(string $key, Expr\Array_ $array): void
    {
        if (\count($array->items) !== 2) {
            return;
        }

        $first = $array->items[0]->value;
        $refersToSelf = Names::isThis($first)
            || $first instanceof MagicConst\Class_
            || ($first instanceof Expr\ClassConstFetch && $first->name instanceof Node\Identifier && $first->name->toLowerString() === 'class' && $this->ownVia($first->class) !== null)
            || ($first instanceof String_ && strcasecmp(ltrim($first->value, '\\'), $this->fqcn) === 0);

        if (!$refersToSelf) {
            return;
        }

        $callable = Names::callableArray($array);

        if ($callable === null) {
            $this->addNote('dynamic', $key, $array);

            return;
        }

        if (Names::isThis($first)) {
            $this->addEdge(new Edge($key, 'method:' . strtolower($callable[1]), Edge::CALLABLE, 'this', $array->getStartLine(), $first->getStartFilePos(), $first->getEndFilePos() + 1));
        }
    }

    private function visitString(string $key, String_ $string): void
    {
        $value = $string->value;

        if (strcasecmp(ltrim($value, '\\'), $this->fqcn) === 0) {
            $method = Names::isCallableArrayClassPart($string) ? Names::callableMethodFor($string) : null;

            if ($method !== null) {
                $this->addEdge(new Edge($key, 'method:' . strtolower($method), Edge::CALLABLE, 'fqcn-string', $string->getStartLine(), $string->getStartFilePos(), $string->getEndFilePos() + 1));
            } else {
                $this->addNote('classNameString', $key, $string);
            }

            return;
        }

        if (!preg_match('/^\\\\?([A-Za-z0-9_\\\\]+)::([A-Za-z_][A-Za-z0-9_]*)$/', $value, $match)) {
            return;
        }

        $class = strtolower($match[1]);
        $via = match (true) {
            $class === 'self', $class === 'static'   => $class,
            strcasecmp($match[1], $this->fqcn) === 0 => 'class',
            default                                  => null,
        };

        if ($via !== null) {
            $this->addEdge(new Edge($key, 'method:' . strtolower($match[2]), Edge::CALLABLE_STRING, $via, $string->getStartLine(), $string->getStartFilePos(), $string->getEndFilePos() + 1));
        }
    }

    private function visitThis(string $key, Expr\Variable $node): void
    {
        $parent = $node->getAttribute('parent');

        if (
            (($parent instanceof Expr\MethodCall || $parent instanceof Expr\NullsafeMethodCall || $parent instanceof Expr\PropertyFetch || $parent instanceof Expr\NullsafePropertyFetch) && $parent->var === $node)
            || (($parent instanceof Expr\StaticCall || $parent instanceof Expr\StaticPropertyFetch || $parent instanceof Expr\ClassConstFetch) && $parent->class === $node)
            || (Names::isCallableArrayClassPart($node))
        ) {
            return;
        }

        $this->addNote('thisEscapes', $key, $parent instanceof Node ? $parent : $node);
    }

    private static function isWrite(Node $node): bool
    {
        $child = $node;
        $parent = $node->getAttribute('parent');

        while ($parent instanceof Expr\ArrayDimFetch && $parent->var === $child) {
            $child = $parent;
            $parent = $parent->getAttribute('parent');
        }

        if (($parent instanceof Expr\Assign || $parent instanceof Expr\AssignOp || $parent instanceof Expr\AssignRef) && $parent->var === $child) {
            return true;
        }

        if ($parent instanceof Expr\AssignRef && $parent->expr === $child) {
            return true;
        }

        if ($parent instanceof Expr\PreInc || $parent instanceof Expr\PreDec || $parent instanceof Expr\PostInc || $parent instanceof Expr\PostDec || $parent instanceof Stmt\Unset_) {
            return true;
        }

        if ($parent instanceof Node\ArrayItem) {
            $list = $parent->getAttribute('parent');
            $assign = $list instanceof Node ? $list->getAttribute('parent') : null;

            return $list instanceof Expr\List_ || ($list instanceof Expr\Array_ && $assign instanceof Expr\Assign && $assign->var === $list);
        }

        return $parent instanceof Stmt\Foreach_ && ($parent->valueVar === $child || $parent->keyVar === $child);
    }
}
