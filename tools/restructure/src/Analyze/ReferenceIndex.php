<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Php\Names;
use BitApps\Restructure\Php\Source;
use BitApps\Restructure\Repo\Workspace;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Name;
use PhpParser\Node\Scalar\String_;
use PhpParser\Node\Stmt;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitorAbstract;

final class ReferenceIndex
{
    /**
     * @var array<string, list<Reference>> target FQCN => references
     */
    private array $byTarget = [];

    /**
     * @var array<string, list<string>>
     */
    private array $parseErrors = [];

    /**
     * @param array<string, true> $targets FQCNs worth indexing
     */
    private function __construct(private readonly array $targets)
    {
    }

    /**
     * @param array<string, true> $targets
     * @param list<string>|null   $paths   files to scan; defaults to the whole scan scope
     */
    public static function build(Workspace $workspace, array $targets, ?array $paths = null): self
    {
        $index = new self($targets);
        $needles = [];

        foreach (array_keys($targets) as $fqcn) {
            $needles[Naming::shortName($fqcn)] = true;
        }

        foreach ($paths ?? $workspace->tree->scanScope() as $path) {
            $code = $workspace->tree->read($path);

            if ($code === null || !self::mentionsAny($code, $needles)) {
                continue;
            }

            $source = $workspace->source($path);

            if ($source === null) {
                $index->parseErrors[$path] = [(string) $workspace->parseError($path)];

                continue;
            }

            $index->scan($source);
        }

        foreach ($index->byTarget as &$references) {
            usort($references, static fn (Reference $a, Reference $b) => [$a->file, $a->start, $a->kind] <=> [$b->file, $b->start, $b->kind]);
        }

        unset($references);
        ksort($index->byTarget, SORT_STRING);

        return $index;
    }

    /**
     * @return list<Reference>
     */
    public function to(string $fqcn): array
    {
        return $this->byTarget[$fqcn] ?? [];
    }

    /**
     * @return array<string, list<string>>
     */
    public function parseErrors(): array
    {
        return $this->parseErrors;
    }

    /**
     * @return list<string>
     */
    public function filesReferencing(string $fqcn): array
    {
        $files = [];

        foreach ($this->to($fqcn) as $reference) {
            $files[$reference->file] = true;
        }

        $files = array_map('strval', array_keys($files));
        sort($files, SORT_STRING);

        return $files;
    }

    /**
     * @internal called by the traversal visitor
     */
    public function recordName(Source $source, Name $name, ?string $inClass, ?string $inMember): void
    {
        $fqcn = Names::resolved($name);

        if ($fqcn === null || !isset($this->targets[$fqcn])) {
            return;
        }

        [$kind, $member] = self::context($name);
        $style = $name instanceof Name\FullyQualified ? 'fq' : (\count($name->getParts()) > 1 ? 'qualified' : 'unqualified');
        $alias = null;

        if ($style !== 'fq') {
            $first = $name->getFirst();

            foreach ($source->imports() as $import) {
                if ($import['type'] === Stmt\Use_::TYPE_NORMAL && strcasecmp($import['alias'], $first) === 0) {
                    $alias = $import['alias'];

                    break;
                }
            }
        }

        $this->add(new Reference(
            $source->path,
            $name->getStartLine(),
            $kind,
            $fqcn,
            $member,
            $name->getStartFilePos(),
            $name->getEndFilePos() + 1,
            $source->nodeText($name),
            $style,
            $alias,
            $inClass,
            $inMember,
        ));
    }

    /**
     * @internal called by the traversal visitor
     */
    public function recordString(Source $source, String_ $string, ?string $inClass, ?string $inMember): void
    {
        $value = ltrim($string->value, '\\');

        if (isset($this->targets[$value])) {
            $method = Names::isCallableArrayClassPart($string) ? Names::callableMethodFor($string) : null;
            $this->add(new Reference(
                $source->path,
                $string->getStartLine(),
                $method === null ? Reference::STRING_FQCN : Reference::CALLABLE,
                $value,
                $method === null ? null : 'method:' . strtolower($method),
                $string->getStartFilePos(),
                $string->getEndFilePos() + 1,
                $source->nodeText($string),
                'string',
                null,
                $inClass,
                $inMember,
            ));

            return;
        }

        if (preg_match('/^\\\\?([A-Za-z0-9_\\\\]+)::([A-Za-z_][A-Za-z0-9_]*)$/', $string->value, $match) && isset($this->targets[$match[1]])) {
            $this->add(new Reference(
                $source->path,
                $string->getStartLine(),
                Reference::STRING_CALLABLE,
                $match[1],
                'method:' . strtolower($match[2]),
                $string->getStartFilePos(),
                $string->getEndFilePos() + 1,
                $source->nodeText($string),
                'string',
                null,
                $inClass,
                $inMember,
            ));
        }
    }

    /**
     * @param array<string, true> $needles
     */
    private static function mentionsAny(string $code, array $needles): bool
    {
        foreach (array_keys($needles) as $needle) {
            if (stripos($code, (string) $needle) !== false) {
                return true;
            }
        }

        return false;
    }

    private function add(Reference $reference): void
    {
        $this->byTarget[$reference->target][] = $reference;
    }

    private function scan(Source $source): void
    {
        $this->scanImports($source);

        $index = $this;
        $visitor = new class($index, $source) extends NodeVisitorAbstract {
            /**
             * @var list<string|null>
             */
            private array $classes = [];

            /**
             * @var list<string|null>
             */
            private array $members = [];

            public function __construct(private readonly ReferenceIndex $index, private readonly Source $source)
            {
            }

            public function enterNode(Node $node)
            {
                if ($node instanceof Stmt\ClassLike) {
                    $this->classes[] = Names::classOf($node);
                } elseif ($node instanceof Stmt\ClassMethod) {
                    $this->members[] = 'method:' . $node->name->toLowerString();
                } elseif ($node instanceof Stmt\Property) {
                    $this->members[] = 'property:' . $node->props[0]->name->toString();
                } elseif ($node instanceof Stmt\ClassConst) {
                    $this->members[] = 'const:' . $node->consts[0]->name->toString();
                } elseif ($node instanceof Stmt\Use_ || $node instanceof Stmt\GroupUse) {
                    return NodeTraverser::DONT_TRAVERSE_CHILDREN;
                }

                if ($node instanceof Name) {
                    $this->index->recordName($this->source, $node, $this->currentClass(), $this->currentMember());
                } elseif ($node instanceof String_) {
                    $this->index->recordString($this->source, $node, $this->currentClass(), $this->currentMember());
                }

            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof Stmt\ClassLike) {
                    array_pop($this->classes);
                } elseif ($node instanceof Stmt\ClassMethod || $node instanceof Stmt\Property || $node instanceof Stmt\ClassConst) {
                    array_pop($this->members);
                }

            }

            private function currentClass(): ?string
            {
                return $this->classes === [] ? null : $this->classes[\count($this->classes) - 1];
            }

            private function currentMember(): ?string
            {
                return $this->members === [] ? null : $this->members[\count($this->members) - 1];
            }
        };

        (new NodeTraverser($visitor))->traverse($source->stmts);
    }

    private function scanImports(Source $source): void
    {
        foreach ($source->stmts as $top) {
            $stmts = $top instanceof Stmt\Namespace_ ? $top->stmts : [$top];

            foreach ($stmts as $stmt) {
                if ($stmt instanceof Stmt\Use_) {
                    foreach ($stmt->uses as $item) {
                        $type = $stmt->type === Stmt\Use_::TYPE_UNKNOWN ? $item->type : $stmt->type;
                        $fqcn = $item->name->toString();

                        if ($type !== Stmt\Use_::TYPE_NORMAL || !isset($this->targets[$fqcn])) {
                            continue;
                        }

                        $this->add(new Reference(
                            $source->path,
                            $stmt->getStartLine(),
                            Reference::IMPORT,
                            $fqcn,
                            null,
                            $stmt->getStartFilePos(),
                            $stmt->getEndFilePos() + 1,
                            $source->nodeText($stmt),
                            'import',
                            $item->getAlias()->toString(),
                            null,
                            null,
                            $item->alias !== null,
                            \count($stmt->uses) > 1,
                        ));
                    }
                } elseif ($stmt instanceof Stmt\GroupUse) {
                    foreach ($stmt->uses as $item) {
                        $fqcn = Name::concat($stmt->prefix, $item->name)?->toString() ?? '';

                        if (!isset($this->targets[$fqcn])) {
                            continue;
                        }

                        $this->add(new Reference(
                            $source->path,
                            $stmt->getStartLine(),
                            Reference::IMPORT,
                            $fqcn,
                            null,
                            $stmt->getStartFilePos(),
                            $stmt->getEndFilePos() + 1,
                            $source->nodeText($stmt),
                            'import',
                            $item->getAlias()->toString(),
                            null,
                            null,
                            $item->alias !== null,
                            true,
                        ));
                    }
                }
            }
        }
    }

    /**
     * @return array{0: string, 1: string|null}
     */
    private static function context(Name $name): array
    {
        $parent = $name->getAttribute('parent');

        if ($parent instanceof Expr\StaticCall && $parent->class === $name) {
            return [Reference::STATIC_CALL, $parent->name instanceof Node\Identifier ? 'method:' . $parent->name->toLowerString() : null];
        }

        if ($parent instanceof Expr\ClassConstFetch && $parent->class === $name) {
            if (!$parent->name instanceof Node\Identifier) {
                return [Reference::NAME, null];
            }

            if ($parent->name->toLowerString() === 'class') {
                $method = Names::isCallableArrayClassPart($parent) ? Names::callableMethodFor($parent) : null;

                return $method === null ? [Reference::CLASS_NAME, null] : [Reference::CALLABLE, 'method:' . strtolower($method)];
            }

            return [Reference::CONST, 'const:' . $parent->name->toString()];
        }

        if ($parent instanceof Expr\StaticPropertyFetch && $parent->class === $name) {
            return [Reference::STATIC_PROP, $parent->name instanceof Node\VarLikeIdentifier ? 'property:' . $parent->name->toString() : null];
        }

        if ($parent instanceof Expr\New_ && $parent->class === $name) {
            return [Reference::NEW, 'method:__construct'];
        }

        if ($parent instanceof Expr\Instanceof_) {
            return [Reference::INSTANCEOF, null];
        }

        if ($parent instanceof Stmt\Catch_) {
            return [Reference::CATCH, null];
        }

        if ($parent instanceof Stmt\Class_) {
            return [$parent->extends === $name ? Reference::EXTENDS : Reference::IMPLEMENTS, null];
        }

        if ($parent instanceof Stmt\Interface_) {
            return [Reference::EXTENDS, null];
        }

        $node = $name;

        while ($parent instanceof Node\NullableType || $parent instanceof Node\UnionType || $parent instanceof Node\IntersectionType) {
            $node = $parent;
            $parent = $parent->getAttribute('parent');
        }

        if ($parent instanceof Node\Param || $parent instanceof Stmt\Property || $parent instanceof Node\FunctionLike) {
            return [Reference::TYPE, null];
        }

        return [Reference::NAME, null];
    }
}
