<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use RuntimeException;

final class TextEdits
{
    /**
     * @var list<array{int, int, string, string}> start, end, replacement, reason
     */
    private array $edits = [];

    public function add(int $start, int $end, string $replacement, string $reason): void
    {
        foreach ($this->edits as [$otherStart, $otherEnd, $otherReplacement, $otherReason]) {
            if ($otherStart === $start && $otherEnd === $end) {
                if ($otherReplacement !== $replacement) {
                    throw new RuntimeException("Conflicting rewrites at offset {$start}: '{$otherReplacement}' ({$otherReason}) and '{$replacement}' ({$reason})");
                }

                return;
            }
        }

        $this->edits[] = [$start, $end, $replacement, $reason];
    }

    public function isEmpty(): bool
    {
        return $this->edits === [];
    }

    /**
     * Applies the edits that fall inside [$from, $to) of $code and returns that slice.
     */
    public function applyTo(string $code, int $from = 0, ?int $to = null): string
    {
        $to ??= \strlen($code);
        $inside = array_values(array_filter($this->edits, static fn (array $edit) => $edit[0] >= $from && $edit[1] <= $to));
        usort($inside, static fn (array $a, array $b) => $a[0] <=> $b[0]);
        $out = '';
        $cursor = $from;

        foreach ($inside as [$start, $end, $replacement, $reason]) {
            if ($start < $cursor) {
                throw new RuntimeException("Overlapping rewrites at offset {$start} ({$reason})");
            }

            $out .= substr($code, $cursor, $start - $cursor) . $replacement;
            $cursor = $end;
        }

        return $out . substr($code, $cursor, $to - $cursor);
    }

    /**
     * @return list<array{int, int, string, string}>
     */
    public function all(): array
    {
        return $this->edits;
    }

    public function covers(int $start, int $end): ?string
    {
        foreach ($this->edits as [$editStart, $editEnd, $replacement]) {
            if ($editStart === $start && $editEnd === $end) {
                return $replacement;
            }
        }

        return null;
    }
}
