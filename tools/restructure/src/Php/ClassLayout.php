<?php

declare(strict_types=1);

namespace BitApps\Restructure\Php;

use PhpParser\Node\Stmt;

final class ClassLayout
{
    /**
     * @var list<Member>
     */
    public array $members = [];

    /**
     * @var list<string>
     */
    public array $problems = [];

    public int $openBrace = 0;

    public int $bodyStart = 0;

    public int $closeBrace = 0;

    private function __construct(public readonly Source $source, public readonly Stmt\ClassLike $class)
    {
    }

    public static function of(Source $source, Stmt\ClassLike $class): self
    {
        $layout = new self($source, $class);
        $layout->compute();

        return $layout;
    }

    public function member(string $key): ?Member
    {
        foreach ($this->members as $member) {
            if ($member->key === $key) {
                return $member;
            }
        }

        return null;
    }

    public function openingGap(): string
    {
        $first = $this->members[0] ?? null;

        return $first === null
            ? $this->source->text($this->bodyStart, $this->closeBrace)
            : $this->source->text($this->bodyStart, $first->start);
    }

    public function closingGap(): string
    {
        $last = $this->members[\count($this->members) - 1] ?? null;

        return $last === null ? '' : $this->source->text($last->end, $this->closeBrace);
    }

    public function gapBefore(Member $member): string
    {
        $previous = $this->members[$member->index - 1] ?? null;

        return $previous === null ? $this->openingGap() : $this->source->text($previous->end, $member->start);
    }

    private function compute(): void
    {
        $tokens = $this->source->tokens;
        $openIndex = $this->findOpenBrace();
        $closeIndex = $this->class->getEndTokenPos();

        if ($openIndex === null || ($tokens[$closeIndex]->text ?? '') !== '}') {
            $this->problems[] = 'class body braces not found';

            return;
        }

        $this->openBrace = $tokens[$openIndex]->pos;
        $this->closeBrace = $tokens[$closeIndex]->pos;
        [, $openTrailing] = $this->sameLineTrailing($openIndex, $closeIndex);
        $this->bodyStart = $openTrailing === [] ? $this->openBrace + 1 : $this->tokenEnd($openTrailing[\count($openTrailing) - 1]);

        $previousEnd = $openIndex;
        $claimed = array_flip($openTrailing);
        $stmts = $this->class->stmts;
        $pending = [];

        foreach ($stmts as $position => $stmt) {
            $isNop = $stmt instanceof Stmt\Nop;
            $firstCode = $isNop ? $closeIndex : $stmt->getStartTokenPos();
            $leading = [];

            for ($i = $previousEnd + 1; $i < $firstCode; $i++) {
                if ($this->isComment($i) && !isset($claimed[$i])) {
                    $leading[] = $i;
                }
            }

            if ($isNop) {
                if ($leading === []) {
                    continue;
                }

                $firstIndex = $leading[0];
                $lastIndex = $leading[\count($leading) - 1];
                $pending[] = [$stmt, $firstIndex, $lastIndex, []];
                $previousEnd = $lastIndex;

                continue;
            }

            $lastCode = $stmt->getEndTokenPos();
            [, $trailing] = $this->sameLineTrailing($lastCode, $this->nextCodeIndex($stmts, $position, $closeIndex));

            foreach ($trailing as $index) {
                $claimed[$index] = true;
            }

            $firstIndex = $leading[0] ?? $firstCode;
            $lastIndex = $trailing === [] ? $lastCode : $trailing[\count($trailing) - 1];
            $pending[] = [$stmt, $firstIndex, $lastIndex, $trailing];
            $previousEnd = $lastIndex;
        }

        foreach ($pending as $index => [$stmt, $firstIndex, $lastIndex]) {
            $startPos = $tokens[$firstIndex]->pos;
            $lineStart = $this->source->lineStartPos($startPos);

            if (!$this->source->onlyWhitespaceBetween($lineStart, $startPos)) {
                $this->problems[] = 'member shares a line with preceding code at line ' . $this->source->lineOf($startPos);
            }

            $end = $this->tokenEnd($lastIndex);
            $lineEnd = $this->source->lineEndPos($end);

            if ($lineEnd > $this->closeBrace) {
                $lineEnd = $this->closeBrace;
            }

            if (!$this->source->onlyWhitespaceBetween($end, $lineEnd)) {
                $this->problems[] = 'member shares a line with following code at line ' . $this->source->lineOf($end);
            }

            [$kind, $names] = $this->describe($stmt, $index);
            $this->members[] = new Member(
                Member::keyFor($kind, $names[0]),
                $kind,
                $names,
                $stmt,
                \count($this->members),
                $lineStart,
                $end,
                $this->source->lineOf($lineStart),
                $this->source->lineOf(max($lineStart, $end - 1)),
            );
        }

        $seen = [];

        foreach ($this->members as $member) {
            if (isset($seen[$member->key])) {
                $this->problems[] = "duplicate member {$member->key}";
            }

            $seen[$member->key] = true;
        }
    }

    /**
     * @param list<Stmt> $stmts
     */
    private function nextCodeIndex(array $stmts, int $position, int $fallback): int
    {
        for ($i = $position + 1, $count = \count($stmts); $i < $count; $i++) {
            if (!$stmts[$i] instanceof Stmt\Nop) {
                return $stmts[$i]->getStartTokenPos();
            }
        }

        return $fallback;
    }

    /**
     * @return array{string, list<string>}
     */
    private function describe(Stmt $stmt, int $index): array
    {
        return match (true) {
            $stmt instanceof Stmt\ClassMethod => ['method', [$stmt->name->toString()]],
            $stmt instanceof Stmt\Property    => ['property', array_map(static fn ($prop) => $prop->name->toString(), $stmt->props)],
            $stmt instanceof Stmt\ClassConst  => ['const', array_map(static fn ($const) => $const->name->toString(), $stmt->consts)],
            $stmt instanceof Stmt\TraitUse    => ['trait', ["#{$index}"]],
            $stmt instanceof Stmt\EnumCase    => ['case', [$stmt->name->toString()]],
            $stmt instanceof Stmt\Nop         => ['nop', ["#{$index}"]],
            default                           => ['other', ["#{$index}"]],
        };
    }

    private function findOpenBrace(): ?int
    {
        $tokens = $this->source->tokens;
        $start = $this->class->name !== null ? $this->source->tokenIndexAt($this->class->name->getStartFilePos()) : $this->class->getStartTokenPos();

        for ($i = $start ?? $this->class->getStartTokenPos(), $end = $this->class->getEndTokenPos(); $i <= $end; $i++) {
            if ($tokens[$i]->text === '{') {
                return $i;
            }
        }

        return null;
    }

    /**
     * @return array{int, list<int>} [index of the first newline-bearing whitespace token, comment token indexes before it]
     */
    private function sameLineTrailing(int $fromIndex, int $limitIndex): array
    {
        $tokens = $this->source->tokens;
        $trailing = [];

        for ($i = $fromIndex + 1; $i < $limitIndex; $i++) {
            $token = $tokens[$i];

            if ($token->id === T_WHITESPACE) {
                if (str_contains($token->text, "\n")) {
                    return [$i, $trailing];
                }

                continue;
            }

            if ($this->isComment($i)) {
                $trailing[] = $i;

                if (str_ends_with($token->text, "\n")) {
                    return [$i, $trailing];
                }

                continue;
            }

            break;
        }

        return [$limitIndex, $trailing];
    }

    private function isComment(int $index): bool
    {
        $id = $this->source->tokens[$index]->id;

        return $id === T_COMMENT || $id === T_DOC_COMMENT;
    }

    private function tokenEnd(int $index): int
    {
        $token = $this->source->tokens[$index];

        return $token->pos + \strlen(rtrim($token->text, "\n"));
    }
}
