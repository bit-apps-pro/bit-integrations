<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use BitApps\Restructure\Php\Source;
use PhpParser\Node\Stmt;

final class ImportBlock
{
    /**
     * @var list<array{start: int, end: int, text: string, type: int, name: string, alias: string, explicit: bool, simple: bool}>
     */
    public array $statements = [];

    /**
     * @var list<string> text between consecutive statements
     */
    public array $separators = [];

    public ?int $start = null;

    public ?int $end = null;

    public bool $contiguous = true;

    public ?int $namespaceEnd = null;

    private function __construct(public readonly Source $source)
    {
    }

    public static function of(Source $source): self
    {
        $block = new self($source);

        foreach ($source->stmts as $top) {
            if ($top instanceof Stmt\Namespace_ && $top->name !== null) {
                $semicolon = strpos($source->code, ';', $top->name->getEndFilePos());
                $block->namespaceEnd = $semicolon === false ? null : $semicolon + 1;
            }
        }

        foreach ($source->topLevelStmts() as $stmt) {
            if (!$stmt instanceof Stmt\Use_ && !$stmt instanceof Stmt\GroupUse) {
                continue;
            }

            $start = $stmt->getStartFilePos();
            $end = $stmt->getEndFilePos() + 1;
            $simple = $stmt instanceof Stmt\Use_ && \count($stmt->uses) === 1;
            $item = $stmt->uses[0];
            $type = $stmt instanceof Stmt\Use_ && $stmt->type !== Stmt\Use_::TYPE_UNKNOWN ? $stmt->type : $item->type;

            if ($block->statements !== []) {
                $separator = $source->text((int) $block->end, $start);
                $block->separators[] = $separator;

                if (trim($separator) !== '') {
                    $block->contiguous = false;
                }
            }

            $block->statements[] = [
                'start'    => $start,
                'end'      => $end,
                'text'     => $source->text($start, $end),
                'type'     => $type,
                'name'     => $simple ? $item->name->toString() : '',
                'alias'    => $simple ? $item->getAlias()->toString() : '',
                'explicit' => $simple && $item->alias !== null,
                'simple'   => $simple,
            ];
            $block->start ??= $start;
            $block->end = $end;
        }

        return $block;
    }

    public static function line(string $fqcn, ?string $alias = null, int $type = Stmt\Use_::TYPE_NORMAL): string
    {
        $keyword = match ($type) {
            Stmt\Use_::TYPE_FUNCTION => 'use function ',
            Stmt\Use_::TYPE_CONSTANT => 'use const ',
            default                  => 'use ',
        };
        $short = substr((string) strrchr('\\' . $fqcn, '\\'), 1);

        return $keyword . $fqcn . ($alias !== null && strcasecmp($alias, $short) !== 0 ? " as {$alias}" : '') . ';';
    }

    /**
     * php-cs-fixer ordered_imports (alpha, case-insensitive, all import types together).
     */
    public static function compare(string $a, string $b): int
    {
        return strcasecmp(self::sortKey($a), self::sortKey($b));
    }

    /**
     * @param list<string> $lines
     */
    public static function isSorted(array $lines): bool
    {
        for ($i = 1, $count = \count($lines); $i < $count; $i++) {
            if (self::compare($lines[$i - 1], $lines[$i]) > 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param list<string> $lines
     *
     * @return list<string>
     */
    public static function sorted(array $lines): array
    {
        $indexed = [];

        foreach ($lines as $position => $line) {
            $indexed[] = [$line, $position];
        }

        usort($indexed, static fn (array $a, array $b) => self::compare($a[0], $b[0]) ?: $a[1] <=> $b[1]);

        return array_column($indexed, 0);
    }

    public function isEmpty(): bool
    {
        return $this->statements === [];
    }

    public function wasSorted(): bool
    {
        return self::isSorted(array_column($this->statements, 'text'));
    }

    /**
     * The text that replaces [start, end) when the block holds $lines instead.
     *
     * @param list<string> $lines
     */
    public function render(array $lines, bool $sort): string
    {
        if ($sort) {
            $lines = self::sorted($lines);
        }

        $out = '';

        foreach ($lines as $position => $line) {
            if ($position > 0) {
                $separator = $this->separators[$position - 1] ?? "\n";
                $out .= trim($separator) === '' ? $separator : "\n";
            }

            $out .= $line;
        }

        return $out;
    }

    private static function sortKey(string $line): string
    {
        $body = trim(preg_replace('/^use\s+(?:function\s+|const\s+)?/i', '', rtrim(trim($line), ';')) ?? '');

        return str_replace(['\\', '{'], [' ', ''], ltrim($body, '\\'));
    }
}
