<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use stdClass;

final class RouteSmoke
{
    private const AUTH_SUFFIXES = ['Action', 'Controller'];

    private const FIXTURE_CONNECTION = 'fixture';

    private object $context;

    private HttpReach $reach;

    /**
     * @var array<string, int>
     */
    private array $coverageCounts = [];

    public function __construct(private Session $session)
    {
    }

    public function run(): int
    {
        $session = $this->session;
        $catalog = new RouteCatalog($session->workspace, $session->source);

        $routes = [];
        $candidates = [];

        foreach ($session->integrations as $integration) {
            $routes[$integration] = $catalog->routes($integration);

            foreach ($routes[$integration] as $route) {
                if (!isset($route['error'])) {
                    $candidates[self::authKey($integration, $route['class'])] = $this->authCandidates($integration, $route['class']);
                }
            }
        }

        $this->reach = new HttpReach($session->source);
        $this->context = $session->discover($candidates);
        $session->fingerprintBefore();

        foreach ($session->integrations as $integration) {
            $this->integration($integration, $routes[$integration]);
        }

        $session->fingerprintAfter();
        ksort($this->coverageCounts, SORT_STRING);
        $session->log->info('coverage: ' . ($this->coverageCounts === [] ? 'no routes' : implode(', ', array_map(static fn (string $verdict, int $count) => "{$verdict}={$count}", array_keys($this->coverageCounts), $this->coverageCounts))));

        return $session->finish('route smoke');
    }

    /**
     * @param list<array<string, mixed>> $routes
     */
    private function integration(string $integration, array $routes): void
    {
        $session = $this->session;
        $store = $session->store;
        $names = [];

        if ($routes === []) {
            $session->log->info("{$integration}: no routes");
        }

        $store->clear($integration, 'route');
        $failuresBefore = $session->failureCount();
        $withConnection = 0;
        $connectionRan = 0;

        foreach ($routes as $index => $route) {
            $name = isset($route['error'])
                ? "{$integration}__unparsed-line-{$route['line']}"
                : "{$integration}__{$route['hook']}";
            $names[] = $name;

            $record = $this->route($integration, $route, $store->baseline($name));
            $this->checkCoverage($name, $record);
            $store->write($name, $record);

            if ($store->mode() === 'compare') {
                $this->compare($name, $record, $store->baseline($name));
            }

            $session->log->info(self::summary($name, $record));

            if (($record['input']['connection_id'] ?? null) !== null) {
                $withConnection++;
                $connectionRan += array_filter($record['runs'], static fn (array $variants) => !\is_string($variants['connection'])) === $record['runs'] ? 1 : 0;
            }
        }

        if ($store->mode() === 'compare') {
            foreach (array_diff($store->baselineNames($integration, 'route'), $names) as $missing) {
                $session->fail("{$missing}: in the baseline but no longer registered");
            }
        }

        $ok = $session->failureCount() === $failuresBefore;
        $states = 'Pro ' . implode('/', $session->proStates);
        $session->result($integration, 'route-smoke', $ok, \count($routes) . " route(s) compared with the baseline, {$states}" . ($ok ? '' : '; see the route smoke failures'));

        if ($withConnection > 0) {
            $session->result($integration, 'T3', $ok && $connectionRan === $withConnection, "connection_id variant ran on {$connectionRan}/{$withConnection} route(s) against a fixture connection, {$states}");
        }
    }

    private function route(string $integration, array $route, mixed $baseline): array
    {
        if (isset($route['error'])) {
            return ['schema' => Session::SCHEMA, 'kind' => 'route', 'integration' => $integration, 'error' => "cannot drive: {$route['error']}", 'runs' => new stdClass()];
        }

        $auth = $this->context->auth->{self::authKey($integration, $route['class'])} ?? null;
        $derived = (new ParamDeriver($this->session->source, $this->session->fixtures->params($integration)))->derive($route['class'], $route['function']);
        $derived['params'] += $this->session->fixtures->integrationParams($integration);
        ksort($derived['params'], SORT_STRING);

        $input = [
            'params'        => $derived['params'] === [] ? new stdClass() : $derived['params'],
            'superglobals'  => $derived['superglobals'] === [] ? new stdClass() : $derived['superglobals'],
            'connection_id' => $auth === null ? null : self::FIXTURE_CONNECTION,
            'connection'    => $auth === null ? null : self::fixtureConnection($auth, $derived['params'], $this->session->fixtures->connectionDetails($integration)),
        ];

        $notes = $derived['notes'];

        if (\is_object($baseline) && isset($baseline->input)) {
            if (!Canon::same($baseline->input->params, $input['params']) || !Canon::same($baseline->input->superglobals, $input['superglobals'])) {
                $notes[] = 'derived params differ from the baseline; the baseline params were used';
            }
            $input = (array) $baseline->input + ['connection' => null];

            if ($auth !== null && $input['connection_id'] === null) {
                $this->session->fail("{$integration}__{$route['hook']}: the baseline has no connection variant although the handler has an \$authConfig (T3); re-record the baseline with this harness");
            }
        }

        $runs = [];

        foreach ($this->session->proStates as $state) {
            $runs["pro-{$state}"] = [
                'no-connection' => $this->execute($integration, $route, $input, null, $auth, $state),
                'connection'    => match (true) {
                    $auth === null                   => 'skipped: no authConfig on the handler, Action or Controller',
                    $input['connection_id'] === null => 'skipped: no connection',
                    default                          => $this->execute($integration, $route, $input, $input['connection_id'], $auth, $state),
                },
            ];
        }

        return [
            'schema'      => Session::SCHEMA,
            'kind'        => 'route',
            'integration' => $integration,
            'hook'        => $route['hook'],
            'method'      => $route['method'],
            'flags'       => $route['flags'],
            'input'       => $input,
            'runs'        => $runs,
            'coverage'    => $this->coverage($route, $runs),
            'info'        => [
                'handler'    => $route['class'] . '::' . $route['function'],
                'auth_owner' => $auth->owner ?? null,
                'notes'      => $notes,
            ],
        ];
    }

    private function execute(string $integration, array $route, array $input, int|string|null $connectionId, ?object $auth, string $state): array
    {
        $params = json_decode(json_encode($input['params']), true) ?: [];
        $fixture = null;

        if ($connectionId !== null) {
            foreach ($auth->fields ?? [] as $field) {
                unset($params[$field]);
            }

            if ($connectionId === self::FIXTURE_CONNECTION) {
                $fixture = json_decode(json_encode($input['connection'] ?? null), true);

                if (!\is_array($fixture)) {
                    throw new \RuntimeException("{$integration} {$route['hook']}: the record asks for a fixture connection but carries none");
                }
            }

            $params['connection_id'] = $connectionId === self::FIXTURE_CONNECTION ? 0 : (int) $connectionId;
        }

        $extras = json_decode(json_encode($input['superglobals']), true) ?: [];
        $action = $this->context->var_prefix . $route['hook'];
        $job = $this->session->job('route', $integration);
        $job['http_method'] = $route['method'];
        $job['user_id'] = (int) $this->context->admin_id;
        $job['constants'] = ['DOING_AJAX' => true, 'WP_ADMIN' => true];

        if ($fixture !== null) {
            $job['fixture_connection'] = $fixture;
        }

        if ($route['method'] === 'GET') {
            $job['superglobals'] = [
                '_SERVER' => ['REQUEST_METHOD' => 'GET', 'REQUEST_URI' => '/wp-admin/admin-ajax.php'],
                '_GET'    => ['action' => $action] + $params + $extras,
                '_POST'   => new stdClass(),
            ];
        } else {
            $job['superglobals'] = [
                '_SERVER' => ['REQUEST_METHOD' => 'POST', 'REQUEST_URI' => '/wp-admin/admin-ajax.php', 'CONTENT_TYPE' => 'multipart/form-data; boundary=----smoke'],
                '_GET'    => new stdClass(),
                '_POST'   => ['action' => $action, 'data' => json_encode($params === [] ? new stdClass() : $params, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)] + $extras,
            ];
        }

        $label = "{$integration}-{$route['hook']}-pro-{$state}" . ($connectionId === null ? '' : '-connection');
        $run = $this->session->runner->run($label, $job, $state === 'on', (int) $this->context->admin_id);
        $this->session->safety->absorb($label, $run);

        return Outcome::route($run);
    }

    /**
     * @param array<string, array<string, mixed>> $runs
     *
     * @return array{verdict: string, handler_calls_http: bool, php_errors: int, runs: array<string, string>}
     */
    private function coverage(array $route, array $runs): array
    {
        $http = $this->reach->reaches($route['class'], $route['function']);
        $reached = false;
        $errors = 0;
        $variants = [];

        foreach ($runs as $state => $byVariant) {
            foreach ($byVariant as $variant => $run) {
                $key = "{$state}/{$variant}";
                $run = json_decode(json_encode($run), true);

                if (!\is_array($run) || isset($run['error'])) {
                    $variants[$key] = \is_string($run) ? $run : 'error';

                    continue;
                }

                $requests = \count((array) ($run['compare']['requests'] ?? []));
                $warnings = \count((array) ($run['info']['php_errors'] ?? []));
                $errors += $warnings;
                $reached = $reached || $requests > 0;
                $exit = (array) ($run['compare']['exit'] ?? []);
                $status = $run['compare']['status'] ?? ($exit['response'] ?? null);

                $variants[$key] = match (true) {
                    $requests > 0                                      => "reached HTTP ({$requests} request(s))",
                    \is_int($status) && $status >= 400                 => "stopped at a guard ({$status})",
                    ($exit['kind'] ?? '') === 'throwable'               => 'threw ' . ($exit['class'] ?? '?'),
                    default                                            => 'no request',
                } . ($warnings > 0 ? ", {$warnings} PHP diagnostic(s)" : '');
            }
        }

        ksort($variants, SORT_STRING);

        return [
            'verdict'            => $reached ? 'reached-http' : ($http ? 'uncovered' : 'no-http-in-handler'),
            'handler_calls_http' => $http,
            'php_errors'         => $errors,
            'runs'               => $variants,
        ];
    }

    private function checkCoverage(string $name, array $record): void
    {
        $verdict = $record['coverage']['verdict'] ?? (isset($record['error']) ? 'error' : 'unknown');
        $exempt = $this->session->fixtures->coverageExempt()[$name] ?? null;

        if ($verdict === 'uncovered' && $exempt !== null) {
            $verdict = 'exempt';
            $this->session->log->info("  note {$name}: no request reached; exempt: {$exempt}");
        } elseif ($verdict === 'uncovered') {
            $this->session->fail("{$name}: the handler makes HTTP calls but no run reached one (" . implode('; ', array_map(static fn ($k, $v) => "{$k}: {$v}", array_keys($record['coverage']['runs']), $record['coverage']['runs'])) . '); add a param fixture or list it in fixtures/coverage-exempt.json with the reason');
        } elseif ($exempt !== null) {
            $this->session->log->info("  note {$name}: listed in coverage-exempt.json but now {$verdict}; drop the entry");
        }

        if (($record['coverage']['php_errors'] ?? 0) > 0) {
            $this->session->log->info("  note {$name}: the handler raised {$record['coverage']['php_errors']} PHP diagnostic(s)");
        }

        $this->coverageCounts[$verdict] = ($this->coverageCounts[$verdict] ?? 0) + 1;
    }

    private function compare(string $name, array $record, mixed $baseline): void
    {
        if (!\is_object($baseline)) {
            $this->session->fail("{$name}: no baseline record");

            return;
        }

        foreach ($record['runs'] as $state => $variants) {
            foreach ($variants as $variant => $current) {
                $old = $baseline->runs->{$state}->{$variant} ?? null;

                if ($old === null) {
                    $this->session->fail("{$name} {$state}/{$variant}: not in the baseline");

                    continue;
                }

                Outcome::compare($this->session, "{$name} {$state}/{$variant}", $old, $current);
            }
        }
    }

    /**
     * The connection variant runs against this row rather than whatever live connection the site
     * has, so every integration with an $authConfig is covered and the result does not depend on
     * the database. Each credential gets the value the no-connection variant sends inline.
     *
     * @param array<string, mixed> $params
     *
     * @return array{app_slug: string, auth_type: string, auth_details: array<string, mixed>}
     */
    private static function fixtureConnection(object $auth, array $params, array $extraDetails = []): array
    {
        $details = $extraDetails;

        foreach ($auth->map ?? [] as $entry) {
            $field = (string) $entry->field;

            if (isset($entry->keys)) {
                $inline = $params[$field] ?? [];

                foreach ($entry->keys as $key) {
                    $details[$key] = \is_array($inline) && isset($inline[$key]) && \is_scalar($inline[$key]) ? $inline[$key] : 'smoke_' . $key;
                }

                continue;
            }

            $details[(string) $entry->key] = isset($params[$field]) && \is_scalar($params[$field]) ? $params[$field] : 'smoke_' . $entry->key;
        }

        ksort($details, SORT_STRING);

        return [
            'app_slug'     => (string) ($auth->slug ?? ''),
            'auth_type'    => (string) ($auth->auth_type ?? ''),
            'auth_details' => $details,
        ];
    }

    /**
     * @return list<string>
     */
    private function authCandidates(string $integration, string $handler): array
    {
        $candidates = [$handler];
        foreach (self::AUTH_SUFFIXES as $suffix) {
            $candidates[] = "BitApps\\Integrations\\Actions\\{$integration}\\{$integration}{$suffix}";
        }

        return array_values(array_unique($candidates));
    }

    private static function authKey(string $integration, string $class): string
    {
        return $integration . '::' . $class;
    }

    private static function summary(string $name, array $record): string
    {
        if (isset($record['error'])) {
            return "{$name}: {$record['error']}";
        }

        $parts = [];
        foreach ($record['runs'] as $state => $variants) {
            foreach ($variants as $variant => $run) {
                $parts[] = "{$state}/{$variant}=" . Outcome::label($run);
            }
        }

        return "{$name}: " . implode(' ', $parts);
    }
}
