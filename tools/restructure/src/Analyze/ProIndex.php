<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Php\Names;
use BitApps\Restructure\Repo\Tree;
use BitApps\Restructure\Repo\Workspace;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Name;
use PhpParser\Node\Scalar\String_;
use PhpParser\NodeFinder;

final class ProIndex
{
    public const GET_CLASS_KIND = 'bit_integrations_get_class';

    private const FREE_ROOT_NAMESPACE = 'BitApps\\Integrations\\';

    /**
     * @var array<string, string> lowercase folder => Hooks.php path
     */
    private array $hooks = [];

    /**
     * @var array<string, list<array<string, mixed>>> Free FQCN => Pro references
     */
    private array $references = [];

    /**
     * @var array<string, list<string>> lowercase folder => bound classes
     */
    private array $boundClasses = [];

    private function __construct(public readonly string $label)
    {
    }

    public static function scan(string $proRoot): self
    {
        $workspace = new Workspace(Tree::filesystem($proRoot));
        $index = new self(basename($workspace->tree->root));
        $finder = new NodeFinder();

        foreach ($workspace->tree->subdirectories(Workspace::ACTIONS_DIR) as $folder) {
            $path = Workspace::ACTIONS_DIR . "/{$folder}/Hooks.php";

            if ($workspace->tree->exists($path)) {
                $index->hooks[strtolower($folder)] = $path;
                $source = $workspace->source($path);
                $classes = [];

                if ($source !== null) {
                    foreach ($finder->findInstanceOf($source->stmts, Expr\ClassConstFetch::class) as $fetch) {
                        if ($fetch->class instanceof Name && $fetch->name instanceof Node\Identifier && $fetch->name->toLowerString() === 'class') {
                            $classes[(string) Names::resolved($fetch->class)] = true;
                        }
                    }
                }

                $classes = array_map('strval', array_keys($classes));
                sort($classes, SORT_STRING);
                $index->boundClasses[strtolower($folder)] = $classes;
            }
        }

        foreach ($workspace->tree->files('backend') as $path) {
            if (!str_ends_with($path, '.php')) {
                continue;
            }

            $code = (string) $workspace->tree->read($path);

            if (!str_contains($code, 'Actions\\') || (!str_contains($code, 'Integrations\\') && !str_contains($code, self::GET_CLASS_KIND))) {
                continue;
            }

            $source = $workspace->source($path);

            if ($source === null) {
                continue;
            }

            foreach ($finder->find($source->stmts, static fn (Node $node) => $node instanceof Name || $node instanceof String_) as $node) {
                if ($node instanceof String_) {
                    $value = ltrim($node->value, '\\');

                    if (preg_match('/^Actions\\\\[A-Za-z0-9_]+\\\\[A-Za-z0-9_]+$/', $value) === 1) {
                        $index->references[self::FREE_ROOT_NAMESPACE . $value][] = ['file' => $path, 'line' => $node->getStartLine(), 'kind' => self::GET_CLASS_KIND, 'text' => $source->nodeText($node)];
                    } elseif (str_starts_with($value, Workspace::ACTIONS_NAMESPACE . '\\')) {
                        $index->references[$value][] = ['file' => $path, 'line' => $node->getStartLine(), 'kind' => 'string', 'text' => $source->nodeText($node)];
                    }

                    continue;
                }

                $fqcn = Names::resolved($node);

                if ($fqcn !== null && str_starts_with($fqcn, Workspace::ACTIONS_NAMESPACE . '\\')) {
                    $index->references[$fqcn][] = ['file' => $path, 'line' => $node->getStartLine(), 'kind' => 'name', 'text' => $source->nodeText($node)];
                }
            }
        }

        ksort($index->references, SORT_STRING);

        return $index;
    }

    public function hooksFile(string $folder): ?string
    {
        return $this->hooks[strtolower($folder)] ?? null;
    }

    /**
     * @return list<string>
     */
    public function boundClasses(string $folder): array
    {
        return $this->boundClasses[strtolower($folder)] ?? [];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function referencesTo(string $fqcn): array
    {
        return $this->references[$fqcn] ?? [];
    }
}
