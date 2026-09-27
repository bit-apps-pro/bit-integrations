<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use stdClass;

final class RouteSmoke
{
    private const AUTH_SUFFIXES = ['Action', 'Controller'];

    private object $context;

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

        $this->context = $session->discover($candidates);
        $session->fingerprintBefore();

        foreach ($session->integrations as $integration) {
            $this->integration($integration, $routes[$integration]);
        }

        $session->fingerprintAfter();

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

        foreach ($routes as $index => $route) {
            $name = isset($route['error'])
                ? "{$integration}__unparsed-line-{$route['line']}"
                : "{$integration}__{$route['hook']}";
            $names[] = $name;

            $record = $this->route($integration, $route, $store->baseline($name));
            $store->write($name, $record);

            if ($store->mode() === 'compare') {
                $this->compare($name, $record, $store->baseline($name));
            }

            $session->log->info(self::summary($name, $record));
        }

        if ($store->mode() === 'compare') {
            foreach (array_diff($store->baselineNames($integration, 'route'), $names) as $missing) {
                $session->fail("{$missing}: in the baseline but no longer registered");
            }
        }
    }

    private function route(string $integration, array $route, mixed $baseline): array
    {
        if (isset($route['error'])) {
            return ['schema' => Session::SCHEMA, 'kind' => 'route', 'integration' => $integration, 'error' => "cannot drive: {$route['error']}", 'runs' => new stdClass()];
        }

        $auth = $this->context->auth->{self::authKey($integration, $route['class'])} ?? null;
        $derived = (new ParamDeriver($this->session->source, $this->session->fixtures->params($integration)))->derive($route['class'], $route['function']);
        $connection = $this->connectionFor($auth);

        $input = [
            'params'        => $derived['params'] === [] ? new stdClass() : $derived['params'],
            'superglobals'  => $derived['superglobals'] === [] ? new stdClass() : $derived['superglobals'],
            'connection_id' => $connection,
        ];

        $notes = $derived['notes'];

        if (\is_object($baseline) && isset($baseline->input)) {
            if (!Canon::same($baseline->input->params, $input['params']) || !Canon::same($baseline->input->superglobals, $input['superglobals'])) {
                $notes[] = 'derived params differ from the baseline; the baseline params were used';
            }
            $input = (array) $baseline->input;
        }

        $runs = [];

        foreach ($this->session->proStates as $state) {
            $runs["pro-{$state}"] = [
                'no-connection' => $this->execute($integration, $route, $input, null, $auth, $state),
                'connection'    => match (true) {
                    $auth === null                   => 'skipped: no authConfig on the handler, Action or Controller',
                    $input['connection_id'] === null => 'skipped: no connection',
                    default                          => $this->execute($integration, $route, $input, (int) $input['connection_id'], $auth, $state),
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
            'info'        => [
                'handler'    => $route['class'] . '::' . $route['function'],
                'auth_owner' => $auth->owner ?? null,
                'notes'      => $notes,
            ],
        ];
    }

    private function execute(string $integration, array $route, array $input, ?int $connectionId, ?object $auth, string $state): array
    {
        $params = json_decode(json_encode($input['params']), true) ?: [];

        if ($connectionId !== null) {
            foreach ($auth->fields ?? [] as $field) {
                unset($params[$field]);
            }
            $params['connection_id'] = $connectionId;
        }

        $extras = json_decode(json_encode($input['superglobals']), true) ?: [];
        $action = $this->context->var_prefix . $route['hook'];
        $job = $this->session->job('route', $integration);
        $job['http_method'] = $route['method'];
        $job['user_id'] = (int) $this->context->admin_id;
        $job['constants'] = ['DOING_AJAX' => true, 'WP_ADMIN' => true];

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

    private function connectionFor(?object $auth): ?int
    {
        if ($auth === null || ($auth->slug ?? '') === '') {
            return null;
        }

        $normalize = static fn ($value) => strtolower((string) preg_replace('/[^a-z0-9]/i', '', (string) $value));
        $accepted = array_map($normalize, [$auth->slug, ...($auth->aliases ?? [])]);

        foreach ($this->context->connections as $connection) {
            if ((int) $connection->status === 1 && \in_array($normalize($connection->app_slug), $accepted, true)) {
                return (int) $connection->id;
            }
        }

        return null;
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
