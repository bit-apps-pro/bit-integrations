<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use InvalidArgumentException;
use RuntimeException;

final class Session
{
    public const SCHEMA = 1;

    public readonly Workspace $workspace;

    public readonly Log $log;

    public readonly WpRunner $runner;

    public readonly Store $store;

    public readonly Safety $safety;

    public readonly Source $source;

    public readonly Fixtures $fixtures;

    /**
     * @var list<string>
     */
    public readonly array $integrations;

    /**
     * @var list<string> 'on' | 'off'
     */
    public readonly array $proStates;

    /**
     * @var list<string>
     */
    private array $failures = [];

    private ?array $before = null;

    private string $tablePrefix = '';

    public function __construct(public readonly Options $options)
    {
        $this->log = new Log($options->flag('verbose'));
        $this->workspace = new Workspace($options);
        $this->runner = new WpRunner($this->workspace, $options, $this->log);
        $this->store = new Store($options);
        $this->safety = new Safety();
        $this->source = new Source($this->workspace);
        $this->fixtures = new Fixtures($this->workspace);
        $this->integrations = $this->resolveIntegrations();
        $this->proStates = $this->resolveProStates();
    }

    /**
     * @param list<string> $authCandidates keyed by a caller-chosen key
     */
    public function discover(array $authCandidates = []): object
    {
        $run = $this->runner->run('discover', ['kind' => 'discover', 'auth_candidates' => (object) $authCandidates]);
        $this->safety->absorb('discover', $run);
        $payload = $run['result']->payload ?? null;

        if (!\is_object($payload) || isset($payload->error)) {
            throw new RuntimeException("discovery failed (exit {$run['exit_code']}): " . trim(substr($run['stderr'], -2000)));
        }

        $this->tablePrefix = (string) $payload->table_prefix;

        return $payload;
    }

    public function fingerprintBefore(): void
    {
        if ($this->options->flag('no-fingerprint')) {
            return;
        }

        $this->before = (new Fingerprint($this->runner))->take($this->tablePrefix);
    }

    public function fingerprintAfter(): void
    {
        if ($this->before === null) {
            return;
        }

        $after = (new Fingerprint($this->runner))->take($this->tablePrefix);
        Fingerprint::compare($this->before, $after, $this->tablePrefix, $this->safety, $this->log);
    }

    public function fail(string $message): void
    {
        $this->failures[] = $message;
    }

    public function finish(string $what): int
    {
        $this->safety->report($this->log);

        foreach ($this->failures as $failure) {
            $this->log->info('FAIL ' . $failure);
        }

        if ($this->options->flag('keep-tmp')) {
            $this->log->info('work files kept in ' . $this->workspace->tmpDir());
        } else {
            $this->workspace->cleanup();
        }

        if (!$this->safety->ok()) {
            $this->log->info("{$what}: SAFETY VIOLATION");

            return 2;
        }

        if ($this->failures !== []) {
            $this->log->info(\sprintf('%s: %d failure(s)', $what, \count($this->failures)));

            return 1;
        }

        $this->log->info("{$what}: ok ({$this->store->mode()})");

        return 0;
    }

    /**
     * @return array<string, mixed> base job fields shared by route and flow runs
     */
    public function job(string $kind, string $integration): array
    {
        return ['kind' => $kind, 'http_fixtures' => $this->fixtures->http($integration)];
    }

    /**
     * @return list<string>
     */
    private function resolveIntegrations(): array
    {
        $names = $this->options->list('only');

        if ($this->options->get('batch') !== null) {
            $names = [...$names, ...Batches::get((string) $this->options->get('batch'))];
        }

        if ($names === []) {
            throw new InvalidArgumentException('pass --only=<Integration,...> or --batch=<F1..F10>');
        }

        $names = array_values(array_unique($names));
        sort($names, SORT_STRING);

        foreach ($names as $name) {
            if (!preg_match('~^[A-Za-z0-9_]+$~', $name)) {
                throw new InvalidArgumentException("bad integration name '{$name}'");
            }

            if (!is_dir($this->workspace->actionsDir('free') . '/' . $name) && !is_dir($this->workspace->actionsDir('pro') . '/' . $name)) {
                throw new InvalidArgumentException("no action folder named '{$name}' in Free or Pro");
            }
        }

        return $names;
    }

    /**
     * @return list<string>
     */
    private function resolveProStates(): array
    {
        $states = $this->options->list('pro', 'on');

        foreach ($states as $state) {
            if (!\in_array($state, ['on', 'off'], true)) {
                throw new InvalidArgumentException("--pro takes on and/or off, not '{$state}'");
            }
        }

        return array_values(array_unique($states));
    }
}
