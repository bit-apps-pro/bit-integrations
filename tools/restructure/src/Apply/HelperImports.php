<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use BitApps\Restructure\Php\Source;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Name;
use PhpParser\Node\Stmt;
use PhpParser\NodeFinder;
use PhpParser\Token;
use RuntimeException;

final class HelperImports
{
    /**
     * Controller imports the members inserted into an existing Helper need, so their names keep their meaning.
     *
     * @param list<array{name: string, alias: string, type: int}> $controllerImports
     * @param list<array{name: string, alias: string, type: int}> $helperImports
     * @param list<Node>                                          $nodes             Controller nodes copied into the Helper
     * @param array<string, true>                                 $rewritten         "start:end" of the names the splitter replaces
     * @param list<Token>                                         $comments          Controller comment tokens copied into the Helper
     *
     * @return list<array{name: string, alias: string, type: int}>
     */
    public static function extra(Source $helper, array $controllerImports, array $helperImports, array $nodes, array $rewritten, array $comments): array
    {
        $controller = self::byKey($controllerImports);
        $existing = self::byKey($helperImports);
        $bare = self::bareKeys($helper, $existing);
        $extra = [];
        $conflicts = [];

        foreach ((new NodeFinder())->findInstanceOf($nodes, Name::class) as $name) {
            $key = self::key($name);

            if ($key === null || isset($rewritten[$name->getStartFilePos() . ':' . ($name->getEndFilePos() + 1)])) {
                continue;
            }

            $want = $controller[$key]['name'] ?? null;
            $have = $existing[$key]['name'] ?? null;

            if ($want === null && $have === null) {
                continue;
            }

            if ($want !== null && $have !== null) {
                if (strcasecmp($want, $have) !== 0) {
                    $conflicts[$key] = "{$name} means {$want} in the Controller but {$have} in the Helper";
                }

                continue;
            }

            if ($want === null) {
                $conflicts[$key] = "{$name} is not imported by the Controller, but the Helper imports {$have} under that name";

                continue;
            }

            if (isset($bare[$key])) {
                $conflicts[$key] = "{$name} would need `use {$want};`, but the Helper already uses that name without an import";

                continue;
            }

            $extra[$key] = $controller[$key];
        }

        foreach ($comments as $token) {
            foreach ($controller as $key => $import) {
                if ($import['type'] !== Stmt\Use_::TYPE_NORMAL || isset($extra[$key]) || isset($existing[$key]) || isset($bare[$key])) {
                    continue;
                }

                if (preg_match('/(?<![[:alnum:]\$_])(?<!\\\)' . preg_quote($import['alias'], '/') . '(?![[:alnum:]_])/i', $token->text) === 1) {
                    $extra[$key] = $import;
                }
            }
        }

        if ($conflicts !== []) {
            ksort($conflicts, SORT_STRING);

            throw new RuntimeException("{$helper->path}: the inserted members cannot keep their names:\n  " . implode("\n  ", $conflicts));
        }

        ksort($extra, SORT_STRING);

        return array_values($extra);
    }

    /**
     * @param list<array{name: string, alias: string, type: int}> $imports
     *
     * @return array<string, array{name: string, alias: string, type: int}>
     */
    private static function byKey(array $imports): array
    {
        $keyed = [];

        foreach ($imports as $import) {
            $keyed[$import['type'] . ':' . strtolower($import['alias'])] = $import;
        }

        return $keyed;
    }

    /**
     * @param array<string, array{name: string, alias: string, type: int}> $imports
     *
     * @return array<string, true> keys the Helper uses without importing them
     */
    private static function bareKeys(Source $helper, array $imports): array
    {
        $bare = [];

        foreach ((new NodeFinder())->findInstanceOf($helper->stmts, Name::class) as $name) {
            $key = self::key($name);

            if ($key !== null && !isset($imports[$key])) {
                $bare[$key] = true;
            }
        }

        return $bare;
    }

    private static function key(Name $name): ?string
    {
        if ($name instanceof Name\FullyQualified || $name->isSpecialClassName()) {
            return null;
        }

        $parent = $name->getAttribute('parent');

        if ($parent instanceof Stmt\Namespace_ || $parent instanceof Node\UseItem || $parent instanceof Stmt\Use_ || $parent instanceof Stmt\GroupUse) {
            return null;
        }

        $type = Stmt\Use_::TYPE_NORMAL;

        if ($parent instanceof Expr\FuncCall && $parent->name === $name) {
            $type = Stmt\Use_::TYPE_FUNCTION;
        } elseif ($parent instanceof Expr\ConstFetch && $parent->name === $name) {
            if (\in_array($name->toLowerString(), ['true', 'false', 'null'], true)) {
                return null;
            }

            $type = Stmt\Use_::TYPE_CONSTANT;
        }

        return $type . ':' . strtolower($name->getFirst());
    }
}
