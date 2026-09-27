<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use PhpParser\Node;
use PhpParser\Node\Stmt\ClassLike;
use PhpParser\NodeFinder;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitor\NameResolver;
use PhpParser\Parser;
use PhpParser\ParserFactory;
use Throwable;

final class Source
{
    private Parser $parser;

    /**
     * @var array<string, ?array<Node>>
     */
    private array $files = [];

    /**
     * @var array<string, string> namespace prefix => directory
     */
    private array $psr4;

    public function __construct(Workspace $workspace)
    {
        $this->parser = (new ParserFactory())->createForHostVersion();
        $this->psr4 = [
            'BitApps\\IntegrationsPro\\' => $workspace->proDir . '/backend/',
            'BitApps\\Integrations\\'    => $workspace->freeDir . '/backend/',
        ];
    }

    /**
     * @return null|array<Node>
     */
    public function parse(string $file): ?array
    {
        if (\array_key_exists($file, $this->files)) {
            return $this->files[$file];
        }

        try {
            $code = is_readable($file) ? (string) file_get_contents($file) : null;
            $ast = $code === null ? null : $this->parser->parse($code);
            if ($ast !== null) {
                $ast = (new NodeTraverser(new NameResolver()))->traverse($ast);
            }
        } catch (Throwable $e) {
            $ast = null;
        }

        return $this->files[$file] = $ast;
    }

    public function fileOf(string $class): ?string
    {
        $class = ltrim($class, '\\');

        foreach ($this->psr4 as $prefix => $dir) {
            if (str_starts_with($class, $prefix)) {
                $file = $dir . str_replace('\\', '/', substr($class, \strlen($prefix))) . '.php';

                return is_file($file) ? $file : null;
            }
        }

        return null;
    }

    public function classNode(string $class): ?ClassLike
    {
        $file = $this->fileOf($class);
        $ast = $file === null ? null : $this->parse($file);

        if ($ast === null) {
            return null;
        }

        $class = ltrim($class, '\\');

        $found = (new NodeFinder())->findFirst($ast, static fn (Node $node) => $node instanceof ClassLike
            && isset($node->namespacedName)
            && $node->namespacedName->toString() === $class);

        return $found instanceof ClassLike ? $found : null;
    }
}
