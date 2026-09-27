<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use stdClass;

final class Outcome
{
    /**
     * @param array{exit_code: int, result: ?object, stderr: string, timed_out: bool} $run
     */
    public static function route(array $run): array
    {
        $result = self::usable($run);

        if (\is_string($result)) {
            return ['error' => $result];
        }

        return [
            'compare' => [
                'exit'        => $result->exit,
                'status'      => $result->status,
                'registered'  => $result->collected->registered ?? null,
                'output'      => $result->output,
                'requests'    => $result->requests,
                'hooks'       => $result->hooks,
                'mails'       => $result->mails,
                'flow_writes' => $result->collected->flow_writes ?? [],
            ],
            'info' => $result->info,
        ];
    }

    /**
     * @param array{exit_code: int, result: ?object, stderr: string, timed_out: bool} $run
     */
    public static function flow(array $run): array
    {
        $result = self::usable($run);

        if (\is_string($result)) {
            return ['error' => $result];
        }

        $collected = $result->collected ?? new stdClass();

        return [
            'compare' => [
                'exit'                  => $result->exit,
                'output'                => $result->output,
                'requests'              => $result->requests,
                'hooks'                 => $result->hooks,
                'mails'                 => $result->mails,
                'flow_writes'           => $collected->flow_writes ?? [],
                'log_rows'              => $collected->log_rows ?? [],
                'existing_logs_changed' => $collected->existing_logs_changed ?? null,
                't1'                    => $collected->t1 ?? null,
            ],
            'input' => $collected->input ?? null,
            'info'  => $result->info,
        ];
    }

    public static function compare(Session $session, string $label, mixed $baseline, mixed $current): void
    {
        $baseline = json_decode(json_encode($baseline));
        $current = json_decode(json_encode($current));

        if (!\is_object($baseline) || !\is_object($current) || isset($baseline->error) || isset($current->error)) {
            if (!Canon::same($baseline, $current)) {
                $session->fail("{$label}: baseline " . json_encode($baseline->error ?? $baseline) . ' now ' . json_encode($current->error ?? $current));
            }

            return;
        }

        if (!Canon::same($baseline->compare ?? null, $current->compare ?? null)) {
            $session->fail("{$label}: behaviour differs\n    " . implode("\n    ", Canon::diff($baseline->compare ?? null, $current->compare ?? null, 'compare')));
        }

        if (!Canon::same($baseline->info ?? null, $current->info ?? null)) {
            $session->log->info("  note {$label}: diagnostics differ (not compared)\n    " . implode("\n    ", Canon::diff($baseline->info ?? null, $current->info ?? null, 'info', 8)));
        }
    }

    public static function label(mixed $run): string
    {
        if (\is_string($run)) {
            return 'skipped';
        }

        if (isset($run['error'])) {
            return 'error';
        }

        $compare = $run['compare'];
        $exit = $compare['exit']->kind ?? '?';
        $status = $compare['status'] ?? null;

        return $exit . ($status !== null ? "({$status})" : '') . ' req=' . \count((array) $compare['requests']) . ' hooks=' . \count((array) $compare['hooks']);
    }

    private static function usable(array $run): object|string
    {
        $result = $run['result'];

        if (!\is_object($result)) {
            return "no result from wp-cli (exit {$run['exit_code']}" . ($run['timed_out'] ? ', timed out' : '') . ')';
        }

        if (isset($result->payload->setup_error)) {
            return 'setup: ' . $result->payload->setup_error;
        }

        if (empty($result->measured)) {
            return "the entry point was never reached (exit {$run['exit_code']})";
        }

        return $result;
    }
}
