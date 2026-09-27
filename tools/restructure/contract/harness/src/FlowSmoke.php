<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use stdClass;

final class FlowSmoke
{
    private object $context;

    private FlowTypes $types;

    public function __construct(private Session $session)
    {
    }

    public function run(): int
    {
        $session = $this->session;
        $types = $this->types = new FlowTypes($session->source, $session->workspace);
        $this->context = $session->discover();
        $session->fingerprintBefore();

        $only = $session->options->list('flow');

        foreach ($session->integrations as $integration) {
            $stored = array_values(array_filter(
                (array) $this->context->flows,
                static fn ($flow) => $types->resolve($flow->type) === $integration && ($only === [] || \in_array((string) $flow->id, $only, true))
            ));

            $this->integration($integration, $stored, $only === [] ? $session->fixtures->flows($integration) : []);
        }

        $session->fingerprintAfter();

        return $session->finish('flow smoke');
    }

    /**
     * @param list<object>                        $stored
     * @param array<string, array<string, mixed>> $fixtures
     */
    private function integration(string $integration, array $stored, array $fixtures): void
    {
        $session = $this->session;
        $store = $session->store;
        $names = [];

        if ($session->options->list('flow') === []) {
            $store->clear($integration, 'flow');
        }

        if ($stored === [] && $fixtures === []) {
            $session->log->info("{$integration}: no stored flow and no fixture flow");
        }

        foreach ($stored as $flow) {
            $name = "{$integration}__flow-{$flow->id}";
            $names[] = $name;
            $this->one($integration, $name, ['source' => 'db', 'id' => (int) $flow->id, 'type' => $flow->type, 'status' => (int) $flow->status, 'connection_id' => $flow->connection_id], ['flow_id' => (int) $flow->id]);
        }

        foreach ($fixtures as $fixtureName => $fixture) {
            $name = "{$integration}__fixture-{$fixtureName}";
            $names[] = $name;
            $resolved = $this->types->resolve($fixture['flow_details']['type'] ?? null);

            if ($resolved !== $integration) {
                $session->fail("{$name}: the fixture type resolves to " . json_encode($resolved) . ", not {$integration}");

                continue;
            }

            $this->one(
                $integration,
                $name,
                ['source' => 'fixture', 'fixture' => $fixtureName, 'type' => $fixture['flow_details']['type'] ?? null, 'connection_id' => $fixture['flow_details']['connection_id'] ?? null],
                ['fixture' => $fixture, 'field_data' => $fixture['field_data'] ?? null]
            );
        }

        if ($store->mode() === 'compare' && $session->options->list('flow') === []) {
            foreach (array_diff($store->baselineNames($integration, 'flow'), $names) as $missing) {
                $session->fail("{$missing}: in the baseline but the flow is gone");
            }
        }
    }

    private function one(string $integration, string $name, array $flow, array $source): void
    {
        $session = $this->session;
        $baseline = $session->store->baseline($name);
        $expired = $session->options->flag('force-expiry');
        $pinnedLog = null;

        if (\is_object($baseline) && isset($baseline->input->field_source)) {
            $recorded = (string) $baseline->input->field_source;

            if (preg_match('~^log#(\d+)$~', $recorded, $m)) {
                $pinnedLog = (int) $m[1];
            } elseif ($recorded === 'field_map') {
                $pinnedLog = 0;
            }
        }

        $runs = [];
        $input = null;

        foreach ($session->proStates as $state) {
            foreach ($expired ? [false, true] : [false] as $forceExpiry) {
                $key = "pro-{$state}" . ($forceExpiry ? '+expired' : '');
                $job = $session->job('flow', $integration) + $this->jobSource($source, $pinnedLog);
                $job['force_expiry'] = $forceExpiry;
                $label = "{$name}-{$key}";
                $run = $session->runner->run($label, $job, $state === 'on');
                $session->safety->absorb($label, $run);
                $outcome = Outcome::flow($run);

                if (isset($outcome['input'])) {
                    if ($input !== null && !Canon::same($input, $outcome['input'])) {
                        $session->fail("{$name} {$key}: the input changed between Pro states");
                    }
                    $input ??= $outcome['input'];
                    unset($outcome['input']);
                }

                if ($forceExpiry && isset($outcome['compare']) && !($outcome['compare']['t1']->pass ?? false)) {
                    $session->fail("{$name} {$key}: T1 forced-expiry write-back did not happen: " . json_encode($outcome['compare']['t1']));
                }

                $runs[$key] = $outcome;
            }
        }

        $record = [
            'schema'      => Session::SCHEMA,
            'kind'        => 'flow',
            'integration' => $integration,
            'flow'        => $flow,
            'input'       => $input ?? new stdClass(),
            'runs'        => $runs,
        ];

        $session->store->write($name, $record);

        if ($session->store->mode() === 'compare') {
            $this->compare($name, $record, $baseline);
        }

        $parts = [];
        foreach ($runs as $key => $run) {
            $parts[] = "{$key}=" . self::label($run);
        }
        $session->log->info("{$name}: " . implode(' ', $parts) . (isset($input->field_source) ? " (fields from {$input->field_source})" : ''));
    }

    private function jobSource(array $source, ?int $pinnedLog): array
    {
        if (isset($source['fixture'])) {
            return ['fixture' => $source['fixture'], 'field_data' => $source['field_data'] ?? null];
        }

        $job = ['flow_id' => $source['flow_id']];

        if ($pinnedLog !== null) {
            $job['field_log_id'] = $pinnedLog;
        }

        return $job;
    }

    private function compare(string $name, array $record, mixed $baseline): void
    {
        if (!\is_object($baseline)) {
            $this->session->fail("{$name}: no baseline record");

            return;
        }

        if (!Canon::same($baseline->input ?? null, $record['input'])) {
            $this->session->fail("{$name}: the flow or its field data changed since the baseline, so the runs are not comparable\n    " . implode("\n    ", Canon::diff($baseline->input ?? null, $record['input'], 'input')));

            return;
        }

        foreach ($record['runs'] as $key => $current) {
            $old = $baseline->runs->{$key} ?? null;

            if ($old === null) {
                $this->session->fail("{$name} {$key}: not in the baseline");

                continue;
            }

            Outcome::compare($this->session, "{$name} {$key}", $old, $current);
        }
    }

    private static function label(array $run): string
    {
        if (isset($run['error'])) {
            return 'error';
        }

        $compare = $run['compare'];

        return ($compare['exit']->kind ?? '?')
            . ' req=' . \count((array) $compare['requests'])
            . ' hooks=' . \count((array) $compare['hooks'])
            . ' logs=' . \count((array) $compare['log_rows'])
            . ' flow_writes=' . \count((array) $compare['flow_writes'])
            . ($compare['t1'] !== null ? ' t1=' . (($compare['t1']->pass ?? false) ? 'pass' : 'FAIL') : '');
    }
}
