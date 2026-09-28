<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use FilesystemIterator;
use PhpParser\Node;
use PhpParser\Node\Arg;
use PhpParser\Node\Expr;
use PhpParser\Node\Expr\FuncCall;
use PhpParser\Node\Expr\StaticCall;
use PhpParser\Node\Identifier;
use PhpParser\Node\Name;
use PhpParser\Node\Name\FullyQualified;
use PhpParser\Node\Stmt\Class_;
use PhpParser\Node\Stmt\ClassLike;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\Node\Stmt\Function_;
use PhpParser\Node\Stmt\Namespace_;
use PhpParser\NodeFinder;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitor\CloningVisitor;
use PhpParser\NodeVisitorAbstract;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class FirePoints
{
    public const HEADER = "# folder\tmethod\tkind\tname\targs\tdefault_sha1\targs_sha1\tname_value";

    private const INLINE_LIMIT = 160;

    private const FUNCTIONS = [
        'do_action',
        'do_action_ref_array',
        'do_action_deprecated',
        'apply_filters',
        'apply_filters_ref_array',
        'apply_filters_deprecated',
    ];

    private const HOOKS_METHODS = ['apply', 'run'];

    /**
     * @return list<string> sorted TSV rows
     */
    public static function scan(string $root): array
    {
        $parsed = [];

        foreach (self::phpFiles($root) as $relative) {
            $parsed[$relative] = ParserKit::parseFile($root . DIRECTORY_SEPARATOR . $relative);
        }

        $rootNamespace = self::rootNamespace($parsed);
        $classes = self::classTable($parsed);
        $rows = [];

        foreach ($parsed as $relative => $stmts) {
            $segments = explode('/', $relative);
            $folder = \count($segments) > 1 ? $segments[0] : '-';

            foreach (self::firesIn($stmts) as [$method, $kind, $args, $class]) {
                $printed = array_map(static fn (Arg $arg) => self::printArg($arg, $rootNamespace), $args);
                $rows[] = implode("\t", [
                    $folder,
                    $method,
                    $kind,
                    self::oneLine($printed[0] ?? '-'),
                    (string) \count($args),
                    isset($printed[1]) ? sha1($printed[1]) : '-',
                    \count($printed) > 1 ? sha1(implode("\n", \array_slice($printed, 1))) : '-',
                    isset($args[0]) ? self::nameValue($args[0], $class, $classes, $rootNamespace) : '-',
                ]);
            }
        }

        sort($rows, SORT_STRING);

        return $rows;
    }

    /**
     * @return list<string> paths relative to $root, with forward slashes, sorted
     */
    private static function phpFiles(string $root): array
    {
        $files = [];
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'php') {
                $files[] = str_replace(DIRECTORY_SEPARATOR, '/', substr($file->getPathname(), \strlen(rtrim($root, '/\\')) + 1));
            }
        }

        sort($files, SORT_STRING);

        return $files;
    }

    /**
     * @param array<string, Node[]> $parsed
     */
    private static function rootNamespace(array $parsed): string
    {
        $votes = [];
        $finder = new NodeFinder();

        foreach ($parsed as $stmts) {
            foreach ($finder->findInstanceOf($stmts, Namespace_::class) as $namespace) {
                if ($namespace->name === null) {
                    continue;
                }

                $parts = $namespace->name->getParts();
                $actions = array_search('Actions', $parts, true);

                if ($actions !== false && $actions > 0) {
                    $root = implode('\\', \array_slice($parts, 0, $actions));
                    $votes[$root] = ($votes[$root] ?? 0) + 1;
                }
            }
        }

        if ($votes === []) {
            return '';
        }

        uksort($votes, static fn ($a, $b) => [$votes[$b], $a] <=> [$votes[$a], $b]);

        return (string) array_key_first($votes);
    }

    /**
     * @param Node[] $stmts
     *
     * @return list<array{0: string, 1: string, 2: list<Arg>, 3: ?string}>
     */
    private static function firesIn(array $stmts): array
    {
        $visitor = new class(self::FUNCTIONS, self::HOOKS_METHODS) extends NodeVisitorAbstract {
            /**
             * @var list<array{0: string, 1: string, 2: list<Arg>, 3: ?string}>
             */
            public array $fires = [];

            /**
             * @var list<string>
             */
            private array $scope = [];

            /**
             * @var list<?string>
             */
            private array $classes = [];

            public function __construct(private array $functions, private array $hooksMethods)
            {
            }

            public function enterNode(Node $node)
            {
                if ($node instanceof ClassLike) {
                    $this->classes[] = $node->namespacedName?->toString();

                    return;
                }

                if ($node instanceof ClassMethod || $node instanceof Function_) {
                    $this->scope[] = $node->name->toString();

                    return;
                }

                $kind = $this->kind($node);

                if ($kind !== null && !$node->isFirstClassCallable()) {
                    $class = $this->classes === [] ? null : $this->classes[\count($this->classes) - 1];
                    $this->fires[] = [$this->scope === [] ? '-' : $this->scope[\count($this->scope) - 1], $kind, $node->getArgs(), $class];
                }
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof ClassMethod || $node instanceof Function_) {
                    array_pop($this->scope);
                }

                if ($node instanceof ClassLike) {
                    array_pop($this->classes);
                }
            }

            private function kind(Node $node): ?string
            {
                if ($node instanceof FuncCall && $node->name instanceof Name && \count($node->name->getParts()) === 1) {
                    $function = $node->name->toLowerString();

                    return \in_array($function, $this->functions, true) ? $function : null;
                }

                if (
                    $node instanceof StaticCall
                    && $node->class instanceof Name
                    && $node->class->getLast() === 'Hooks'
                    && $node->name instanceof Identifier
                    && \in_array($node->name->toLowerString(), $this->hooksMethods, true)
                ) {
                    return 'Hooks::' . $node->name->toLowerString();
                }

                return null;
            }
        };

        (new NodeTraverser($visitor))->traverse($stmts);

        return $visitor->fires;
    }

    /**
     * @param array<string, Node[]> $parsed
     *
     * @return array<string, array{parent: ?string, consts: array<string, Expr>, statics: array<string, ?Expr>}>
     */
    private static function classTable(array $parsed): array
    {
        $classes = [];
        $finder = new NodeFinder();

        foreach ($parsed as $stmts) {
            foreach ($finder->findInstanceOf($stmts, ClassLike::class) as $class) {
                $name = $class->namespacedName?->toString();

                if ($name === null) {
                    continue;
                }

                $entry = ['parent' => $class instanceof Class_ && $class->extends !== null ? $class->extends->toString() : null, 'consts' => [], 'statics' => []];

                foreach ($class->getConstants() as $group) {
                    foreach ($group->consts as $const) {
                        $entry['consts'][$const->name->toString()] = $const->value;
                    }
                }

                foreach ($class->getProperties() as $group) {
                    if ($group->isStatic()) {
                        foreach ($group->props as $property) {
                            $entry['statics'][$property->name->toString()] = $property->default;
                        }
                    }
                }

                $classes[$name] = $entry;
            }
        }

        return $classes;
    }

    /**
     * The hook name with class constants and static properties of the scanned classes replaced by
     * their declared values, so a changed value or a different `self::` shows up.
     *
     * @param array<string, array{parent: ?string, consts: array<string, Expr>, statics: array<string, ?Expr>}> $classes
     */
    private static function nameValue(Arg $arg, ?string $scopeClass, array $classes, string $rootNamespace): string
    {
        $replaced = false;
        $visitor = new class($scopeClass, $classes, $replaced) extends NodeVisitorAbstract {
            public function __construct(private ?string $scopeClass, private array $classes, private bool &$replaced)
            {
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof Expr\ClassConstFetch && $node->name instanceof Identifier && $node->name->toLowerString() !== 'class') {
                    $value = $this->lookup($node->class, 'consts', $node->name->toString());
                } elseif ($node instanceof Expr\StaticPropertyFetch && $node->name instanceof Node\VarLikeIdentifier) {
                    $value = $this->lookup($node->class, 'statics', $node->name->toString());
                } else {
                    return null;
                }

                if ($value === null) {
                    return null;
                }

                $this->replaced = true;

                return (new NodeTraverser(new CloningVisitor(), $this))->traverse([$value])[0];
            }

            private function lookup(Node $class, string $table, string $member): ?Expr
            {
                if (!$class instanceof Name) {
                    return null;
                }

                $owner = \in_array($class->toLowerString(), ['self', 'static'], true) ? $this->scopeClass : $class->toString();

                for ($depth = 0; $owner !== null && $depth < 8; $depth++) {
                    $entry = $this->classes[$owner] ?? null;

                    if ($entry === null) {
                        return null;
                    }

                    if (\array_key_exists($member, $entry[$table])) {
                        return $entry[$table][$member];
                    }

                    $owner = $entry['parent'];
                }

                return null;
            }
        };

        $value = (new NodeTraverser(new CloningVisitor(), $visitor))->traverse([$arg->value])[0];

        if (!$replaced) {
            return '-';
        }

        $printed = self::oneLine(ParserKit::printer()->prettyPrintExpr(self::relativeNames($value, $rootNamespace)));

        return \strlen($printed) > self::INLINE_LIMIT ? 'sha1:' . sha1($printed) : $printed;
    }

    private static function printArg(?Arg $arg, string $rootNamespace): string
    {
        if ($arg === null) {
            return '-';
        }

        $prefix = ($arg->name !== null ? $arg->name->toString() . ': ' : '') . ($arg->unpack ? '...' : '') . ($arg->byRef ? '&' : '');

        return $prefix . ParserKit::printer()->prettyPrintExpr(self::relativeNames($arg->value, $rootNamespace));
    }

    private static function relativeNames(Expr $expr, string $rootNamespace): Expr
    {
        if ($rootNamespace === '') {
            return $expr;
        }

        $visitor = new class($rootNamespace) extends NodeVisitorAbstract {
            public function __construct(private string $rootNamespace)
            {
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof FullyQualified && str_starts_with($node->toString(), $this->rootNamespace . '\\')) {
                    return new Name(ClassRenames::canonical(substr($node->toString(), \strlen($this->rootNamespace) + 1)), $node->getAttributes());
                }
            }
        };

        return (new NodeTraverser(new CloningVisitor(), $visitor))->traverse([$expr])[0];
    }

    private static function oneLine(string $code): string
    {
        return str_replace(["\r", "\n", "\t"], ['\\r', '\\n', '\\t'], $code);
    }
}
