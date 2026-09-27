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
    public const HEADER = "# folder\tmethod\tkind\tname\targs\tdefault_sha1";

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
        $rows = [];

        foreach ($parsed as $relative => $stmts) {
            $segments = explode('/', $relative);
            $folder = \count($segments) > 1 ? $segments[0] : '-';

            foreach (self::firesIn($stmts) as [$method, $kind, $args]) {
                $rows[] = implode("\t", [
                    $folder,
                    $method,
                    $kind,
                    self::oneLine(self::printArg($args[0] ?? null, $rootNamespace)),
                    (string) \count($args),
                    isset($args[1]) ? sha1(self::printArg($args[1], $rootNamespace)) : '-',
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
     * @return list<array{0: string, 1: string, 2: list<Arg>}>
     */
    private static function firesIn(array $stmts): array
    {
        $visitor = new class (self::FUNCTIONS, self::HOOKS_METHODS) extends NodeVisitorAbstract {
            /** @var list<array{0: string, 1: string, 2: list<Arg>}> */
            public array $fires = [];

            /** @var list<string> */
            private array $scope = [];

            public function __construct(private array $functions, private array $hooksMethods)
            {
            }

            public function enterNode(Node $node)
            {
                if ($node instanceof ClassMethod || $node instanceof Function_) {
                    $this->scope[] = $node->name->toString();

                    return null;
                }

                $kind = $this->kind($node);

                if ($kind !== null && !$node->isFirstClassCallable()) {
                    $this->fires[] = [$this->scope === [] ? '-' : $this->scope[\count($this->scope) - 1], $kind, $node->getArgs()];
                }

                return null;
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof ClassMethod || $node instanceof Function_) {
                    array_pop($this->scope);
                }

                return null;
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

        $visitor = new class ($rootNamespace) extends NodeVisitorAbstract {
            public function __construct(private string $rootNamespace)
            {
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof FullyQualified && str_starts_with($node->toString(), $this->rootNamespace . '\\')) {
                    return new Name(substr($node->toString(), \strlen($this->rootNamespace) + 1), $node->getAttributes());
                }

                return null;
            }
        };

        return (new NodeTraverser(new CloningVisitor(), $visitor))->traverse([$expr])[0];
    }

    private static function oneLine(string $code): string
    {
        return str_replace(["\r", "\n", "\t"], ['\\r', '\\n', '\\t'], $code);
    }
}
