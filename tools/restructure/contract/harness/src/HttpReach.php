<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use FilesystemIterator;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Identifier;
use PhpParser\Node\Name;
use PhpParser\Node\Stmt\Class_;
use PhpParser\Node\Stmt\ClassMethod;
use PhpParser\NodeFinder;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

/**
 * Whether a route handler can reach an outgoing HTTP call, following method calls by name through
 * the classes of its own action folder and its parents. Over-approximates: a shared method name
 * counts as a call to every method of that name in the folder.
 */
final class HttpReach
{
    private const FUNCTIONS = [
        'wp_remote_get', 'wp_remote_post', 'wp_remote_head', 'wp_remote_request',
        'wp_safe_remote_get', 'wp_safe_remote_post', 'wp_safe_remote_head', 'wp_safe_remote_request',
        'download_url', 'curl_exec',
    ];

    private const CLASSES = ['httphelper', 'apiclient', 'requests', 'wp_http'];

    private const MAX_METHODS = 400;

    private NodeFinder $finder;

    /**
     * @var array<string, array<string, list<ClassMethod>>> folder => lower method name => methods
     */
    private array $index = [];

    public function __construct(private Source $source)
    {
        $this->finder = new NodeFinder();
    }

    public function reaches(string $class, string $method): bool
    {
        $file = $this->source->fileOf($class);

        if ($file === null) {
            return false;
        }

        $methods = $this->methods(\dirname($file), $class);
        $queue = $methods[strtolower($method)] ?? [];
        $seen = [];

        while ($queue !== [] && \count($seen) < self::MAX_METHODS) {
            $node = array_shift($queue);
            $id = spl_object_id($node);

            if (isset($seen[$id])) {
                continue;
            }

            $seen[$id] = true;

            foreach ($this->finder->find($node->stmts ?? [], static fn (Node $n) => $n instanceof Expr\FuncCall || $n instanceof Expr\StaticCall || $n instanceof Expr\New_ || $n instanceof Expr\MethodCall || $n instanceof Expr\NullsafeMethodCall) as $call) {
                if ($call instanceof Expr\FuncCall) {
                    if ($call->name instanceof Name && \in_array(strtolower($call->name->getLast()), self::FUNCTIONS, true)) {
                        return true;
                    }

                    continue;
                }

                if (($call instanceof Expr\StaticCall || $call instanceof Expr\New_) && $call->class instanceof Name && \in_array(strtolower($call->class->getLast()), self::CLASSES, true)) {
                    return true;
                }

                if (!$call instanceof Expr\New_ && $call->name instanceof Identifier) {
                    foreach ($methods[$call->name->toLowerString()] ?? [] as $callee) {
                        $queue[] = $callee;
                    }
                }
            }
        }

        return false;
    }

    /**
     * @return array<string, list<ClassMethod>>
     */
    private function methods(string $dir, string $class): array
    {
        $key = $dir . "\0" . $class;

        if (isset($this->index[$key])) {
            return $this->index[$key];
        }

        $files = [];

        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)) as $entry) {
            if ($entry->isFile() && $entry->getExtension() === 'php') {
                $files[] = $entry->getPathname();
            }
        }

        for ($depth = 0, $current = $class; $depth < 4 && $current !== ''; $depth++) {
            $node = $this->source->classNode($current);
            $parentFile = $this->source->fileOf($current);

            if ($parentFile !== null) {
                $files[] = $parentFile;
            }

            $current = $node instanceof Class_ && $node->extends instanceof Name ? $node->extends->toString() : '';
        }

        $files = array_values(array_unique($files));
        sort($files, SORT_STRING);
        $methods = [];

        foreach ($files as $path) {
            foreach ($this->finder->findInstanceOf($this->source->parse($path) ?? [], ClassMethod::class) as $method) {
                $methods[$method->name->toLowerString()][] = $method;
            }
        }

        return $this->index[$key] = $methods;
    }
}
