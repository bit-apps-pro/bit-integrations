<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use BitApps\Restructure\Analyze\Naming;
use BitApps\Restructure\Analyze\Reference;
use BitApps\Restructure\Analyze\RenameMap;
use BitApps\Restructure\Php\Source;
use PhpParser\Node\Stmt;
use RuntimeException;

final class FileRewriter
{
    public function __construct(private readonly RenameMap $renames)
    {
    }

    /**
     * Rewrites the names in $source that point at renamed classes: code references, `use` lines and
     * class-name string literals. When $classRename is given, the class declared in the file is renamed too.
     *
     * @param list<Reference>                          $references  references located in $source
     * @param array{0: Stmt\ClassLike, 1: string}|null $classRename
     */
    public function rewrite(Source $source, array $references, ?array $classRename = null): string
    {
        $edits = new TextEdits();
        $block = ImportBlock::of($source);
        $namespace = (string) $source->namespaceName();

        if ($classRename !== null) {
            [$class, $newShort] = $classRename;

            if ($class->name === null) {
                throw new RuntimeException("{$source->path}: anonymous class cannot be renamed");
            }

            $edits->add($class->name->getStartFilePos(), $class->name->getEndFilePos() + 1, $newShort, 'class name');
        }

        $importLines = $this->importLines($block, $references, $source->path);

        foreach ($references as $reference) {
            if ($reference->isImport()) {
                continue;
            }

            $new = $this->renames->target($reference->target, $reference->member, $reference->kind);

            if ($new === null || $new === $reference->target) {
                continue;
            }

            $short = Naming::shortName($new);
            $replacement = match ($reference->style) {
                'string'    => $this->classNameFor($new, $namespace, $importLines ?? array_column($block->statements, 'text')) . '::class',
                'fq'        => '\\' . $new,
                'qualified' => substr($reference->written, 0, (int) strrpos($reference->written, '\\') + 1) . $short,
                default     => $this->explicitAlias($block, $reference->alias) ? null : $short,
            };

            if ($replacement !== null) {
                $edits->add($reference->start, $reference->end, $replacement, "rename {$reference->target}");
            }
        }

        if ($importLines !== null) {
            $edits->add((int) $block->start, (int) $block->end, $block->contiguous ? $block->render($importLines, $block->wasSorted()) : implode("\n", $importLines), 'imports');
        }

        return $edits->applyTo($source->code);
    }

    /**
     * @param list<Reference> $references
     *
     * @return list<string>|null the new import lines, or null when no import changes
     */
    private function importLines(ImportBlock $block, array $references, string $path): ?array
    {
        $imports = [];

        foreach ($references as $reference) {
            if ($reference->isImport()) {
                $imports[$reference->start][] = $reference;
            }
        }

        if ($imports === []) {
            return null;
        }

        $lines = [];
        $emitted = [];
        $aliases = [];

        foreach ($block->statements as $statement) {
            if ($statement['simple'] && !isset($imports[$statement['start']])) {
                $aliases[strtolower($statement['alias'])] = $statement['name'];
                $emitted[strtolower($statement['name'])] = true;
            }
        }

        foreach ($block->statements as $statement) {
            if (!isset($imports[$statement['start']])) {
                $lines[] = $statement['text'];

                continue;
            }

            if (!$statement['simple'] || \count($imports[$statement['start']]) !== 1) {
                throw new RuntimeException("{$path}:{$statement['text']} imports a renamed class in a grouped or multi-class use statement");
            }

            $import = $imports[$statement['start']][0];
            $targets = $this->renames->importTargets($import, $references);

            if ($statement['explicit']) {
                if (\count($targets) !== 1) {
                    throw new RuntimeException("{$path}: {$statement['text']} would need to import several classes under one alias");
                }

                $lines[] = ImportBlock::line($targets[0], $statement['alias']);

                continue;
            }

            foreach ($targets as $target) {
                $alias = strtolower(Naming::shortName($target));

                if (isset($aliases[$alias]) && strcasecmp($aliases[$alias], $target) !== 0) {
                    throw new RuntimeException("{$path}: importing {$target} would clash with the existing import of {$aliases[$alias]}");
                }

                if (isset($emitted[strtolower($target)])) {
                    continue;
                }

                $emitted[strtolower($target)] = true;
                $aliases[$alias] = $target;
                $lines[] = ImportBlock::line($target);
            }
        }

        return $lines;
    }

    private function explicitAlias(ImportBlock $block, ?string $alias): bool
    {
        if ($alias === null) {
            return false;
        }

        foreach ($block->statements as $statement) {
            if ($statement['explicit'] && strcasecmp($statement['alias'], $alias) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param list<string> $importLines
     */
    private function classNameFor(string $fqcn, string $namespace, array $importLines): string
    {
        if (Naming::namespaceName($fqcn) === $namespace) {
            return Naming::shortName($fqcn);
        }

        foreach ($importLines as $line) {
            if (preg_match('/^use\s+\\\\?' . preg_quote($fqcn, '/') . '(?:\s+as\s+(\w+))?\s*;$/i', trim($line), $match) === 1) {
                return $match[1] ?? Naming::shortName($fqcn);
            }
        }

        return '\\' . $fqcn;
    }
}
