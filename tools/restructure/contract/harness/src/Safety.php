<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

final class Safety
{
    /**
     * @var list<string>
     */
    private array $violations = [];

    /**
     * @var list<string>
     */
    private array $warnings = [];

    private int $processes = 0;

    private int $stubbedRequests = 0;

    private int $stubbedMails = 0;

    private int $blocked = 0;

    /**
     * @var array<string, int>
     */
    private array $autoIncrement = [];

    /**
     * @param array{exit_code: int, result: ?object, stderr: string, timed_out: bool} $run
     */
    public function absorb(string $label, array $run): void
    {
        $this->processes++;
        $result = $run['result'];

        if ($run['timed_out']) {
            $this->warnings[] = "{$label}: timed out and was killed; its open transaction died with the connection";
        }

        if (!\is_object($result)) {
            $this->warnings[] = "{$label}: no result (exit {$run['exit_code']}); nothing can have been committed because COMMIT is refused, but check stderr";

            return;
        }

        $safety = $result->safety ?? null;

        if (!\is_object($safety) || empty($safety->transaction)) {
            $this->violations[] = "{$label}: no transaction was opened";

            return;
        }

        if (($safety->rollback ?? '') !== 'ok') {
            $this->violations[] = "{$label}: rollback {$safety->rollback}";
        }

        if (!empty($safety->connection_changed)) {
            $this->violations[] = "{$label}: the database connection changed mid-run (writes after it were refused)";
        }

        foreach ((array) ($safety->escapes ?? []) as $escape) {
            $this->violations[] = "{$label}: outbound transport reached in phase {$escape->phase} via {$escape->hook} (refused)";
        }

        foreach ((array) ($safety->requests_by_phase ?? []) as $count) {
            $this->stubbedRequests += (int) $count;
        }

        foreach ((array) ($safety->mails_by_phase ?? []) as $count) {
            $this->stubbedMails += (int) $count;
        }

        foreach ((array) ($safety->blocked ?? []) as $blocked) {
            $this->blocked++;
            $this->warnings[] = "{$label}: refused {$blocked->kind} {$blocked->what} (phase {$blocked->phase})";
        }

        foreach ((array) ($safety->auto_increment ?? []) as $table => $info) {
            $this->autoIncrement[$table] = ($this->autoIncrement[$table] ?? 0) + 1;
            if ((int) $info->restored !== (int) $info->before) {
                $this->warnings[] = "{$label}: AUTO_INCREMENT of {$table} is {$info->restored}, was {$info->before}";
            }
        }
    }

    public function violation(string $message): void
    {
        $this->violations[] = $message;
    }

    public function warning(string $message): void
    {
        $this->warnings[] = $message;
    }

    public function ok(): bool
    {
        return $this->violations === [];
    }

    public function report(Log $log): void
    {
        ksort($this->autoIncrement);
        $restored = $this->autoIncrement === [] ? 'none' : implode(', ', array_map(static fn ($t, $n) => "{$t} x{$n}", array_keys($this->autoIncrement), $this->autoIncrement));

        $log->info(\sprintf(
            'safety: %d wp processes, %d requests stubbed, %d mails stubbed, %d statements refused, AUTO_INCREMENT restored: %s',
            $this->processes,
            $this->stubbedRequests,
            $this->stubbedMails,
            $this->blocked,
            $restored
        ));

        foreach (array_unique($this->warnings) as $warning) {
            $log->info('  warning: ' . $warning);
        }

        foreach ($this->violations as $violation) {
            $log->info('  VIOLATION: ' . $violation);
        }
    }
}
