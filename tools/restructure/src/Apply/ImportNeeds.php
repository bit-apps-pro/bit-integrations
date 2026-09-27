<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use BitApps\Restructure\Analyze\Naming;
use PhpParser\Error;
use PhpParser\Node;
use PhpParser\Node\Expr;
use PhpParser\Node\Name;
use PhpParser\Node\Stmt;
use PhpParser\NodeFinder;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitor\ParentConnectingVisitor;
use PhpParser\ParserFactory;
use PhpParser\PhpVersion;
use RuntimeException;

final class ImportNeeds
{
    /**
     * Works out which imports a file needs from the names its code (and, like php-cs-fixer's
     * no_unused_imports, its comments) mention.
     *
     * @param string                                              $code       the file without its import block
     * @param list<array{name: string, alias: string, type: int}> $original   imports the source file had
     * @param array<string, string>                               $introduced lowercase first name segment the tool wrote => FQCN it means
     * @param array<string, true>                                 $renamed    FQCNs that no longer exist after the move
     *
     * @return array<string, array{name: string, alias: string, type: int}> keyed by lowercase type:alias
     */
    public static function compute(string $code, string $namespace, array $original, array $introduced, array $renamed): array
    {
        try {
            $parser = (new ParserFactory())->createForVersion(PhpVersion::fromString('7.4'));
            $stmts = $parser->parse($code) ?? [];
            $tokens = $parser->getTokens();
        } catch (Error $e) {
            throw new RuntimeException('The rebuilt file does not parse: ' . $e->getMessage() . "\n" . self::excerpt($code, $e));
        }

        (new NodeTraverser(new ParentConnectingVisitor()))->traverse($stmts);
        $byAlias = [];

        foreach ($original as $import) {
            $byAlias[$import['type'] . ':' . strtolower($import['alias'])] = $import;
        }

        $needs = [];

        foreach ((new NodeFinder())->findInstanceOf($stmts, Name::class) as $name) {
            if ($name instanceof Name\FullyQualified || $name->isSpecialClassName()) {
                continue;
            }

            $parent = $name->getAttribute('parent');

            if ($parent instanceof Stmt\Namespace_ || $parent instanceof Node\UseItem || $parent instanceof Stmt\Use_ || $parent instanceof Stmt\GroupUse) {
                continue;
            }

            $type = Stmt\Use_::TYPE_NORMAL;

            if ($parent instanceof Expr\FuncCall && $parent->name === $name) {
                $type = Stmt\Use_::TYPE_FUNCTION;
            } elseif ($parent instanceof Expr\ConstFetch && $parent->name === $name) {
                if (\in_array($name->toLowerString(), ['true', 'false', 'null'], true)) {
                    continue;
                }

                $type = Stmt\Use_::TYPE_CONSTANT;
            }

            $first = $name->getFirst();
            $lower = strtolower($first);

            if ($type === Stmt\Use_::TYPE_NORMAL && isset($introduced[$lower])) {
                $fqcn = $introduced[$lower];

                if (\count($name->getParts()) === 1 && Naming::namespaceName($fqcn) === $namespace && strcasecmp(Naming::shortName($fqcn), $first) === 0) {
                    continue;
                }

                $needs["{$type}:{$lower}"] = ['name' => $fqcn, 'alias' => $first, 'type' => $type];

                continue;
            }

            $import = $byAlias["{$type}:{$lower}"] ?? null;

            if ($import !== null && !isset($renamed[$import['name']])) {
                $needs["{$type}:{$lower}"] = $import;
            }
        }

        foreach ($tokens as $token) {
            if ($token->id !== T_COMMENT && $token->id !== T_DOC_COMMENT) {
                continue;
            }

            foreach ($original as $import) {
                $key = $import['type'] . ':' . strtolower($import['alias']);

                if (isset($needs[$key]) || isset($renamed[$import['name']]) || $import['type'] !== Stmt\Use_::TYPE_NORMAL) {
                    continue;
                }

                if (preg_match('/(?<![[:alnum:]\$_])(?<!\\\)' . preg_quote($import['alias'], '/') . '(?![[:alnum:]_])/i', $token->text) === 1) {
                    $needs[$key] = $import;
                }
            }
        }

        ksort($needs, SORT_STRING);

        return $needs;
    }

    public static function excerpt(string $code, Error $error): string
    {
        $line = $error->getStartLine();

        if ($line < 1) {
            return '';
        }

        $lines = explode("\n", $code);
        $from = max(0, $line - 4);

        return implode("\n", array_map(static fn (int $offset, string $text) => ($from + $offset + 1) . ': ' . $text, array_keys(\array_slice($lines, $from, 7)), \array_slice($lines, $from, 7)));
    }
}
