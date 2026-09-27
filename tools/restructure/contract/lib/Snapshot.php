<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use Closure;
use ReflectionClass;
use ReflectionMethod;
use ReflectionProperty;
use RuntimeException;
use Throwable;

final class Snapshot
{
    private const FLOW = 'BitApps\\Integrations\\Flow\\Flow';

    private const FLOW_MODEL = 'BitApps\\Integrations\\Core\\Database\\FlowModel';

    private const CONFIG = 'BitApps\\Integrations\\Config';

    /** @var list<string> */
    private array $errors = [];

    /**
     * @return array<string, mixed>
     */
    public function build(): array
    {
        if (!class_exists(self::FLOW)) {
            throw new RuntimeException('Bit Integrations is not loaded in this WordPress install');
        }

        $flow = new ReflectionClass(self::FLOW);
        $actionsDir = rtrim((string) \call_user_func([self::CONFIG, 'get'], 'BACKEND_DIR'), '/\\') . DIRECTORY_SEPARATOR . 'Actions';
        $aliases = FlowAliases::fromFile((string) $flow->getFileName());
        $folders = RouteCapture::folders($actionsDir);
        $storedTypes = $this->storedTypes($this->normalizer($flow), $aliases);

        $sources = [];

        foreach ($folders as $folder) {
            $sources[$folder]['folder'] = true;
        }

        foreach ($aliases as [, $target]) {
            $sources[$target]['alias'] = true;
        }

        foreach ($storedTypes as $stored) {
            $sources[$stored['name']]['stored'] = true;
        }

        $resolver = $flow->getMethod('isActionExists');
        $dispatch = [];

        foreach ($sources as $name => $from) {
            $name = (string) $name;
            $dispatch[$name] = ['sources' => self::sortedKeys($from)] + $this->dispatchEntry($resolver, $name);
        }

        $capture = RouteCapture::capture($actionsDir);
        array_push($this->errors, ...$capture['errors']);
        $routes = $this->routes($capture['registrations']);

        sort($this->errors, SORT_STRING);

        return [
            'counts'      => $this->counts($folders, $aliases, $storedTypes, $dispatch, $routes, $capture['files']),
            'aliases'     => $aliases,
            'storedTypes' => $storedTypes,
            'dispatch'    => $dispatch,
            'routes'      => $routes,
            'errors'      => $this->errors,
        ];
    }

    private function normalizer(ReflectionClass $flow): Closure
    {
        if (!$flow->hasMethod('normalizeActionType')) {
            return static fn ($type) => $type;
        }

        $method = $flow->getMethod('normalizeActionType');

        return static fn ($type) => $method->invoke(null, $type);
    }

    /**
     * @param list<array{0: string, 1: string}> $aliases
     *
     * @return array<string, array{normalized: string, name: string}>
     */
    private function storedTypes(Closure $normalize, array $aliases): array
    {
        global $wpdb;

        $model = (new ReflectionClass(self::FLOW_MODEL))->newInstance();
        $table = (new ReflectionProperty(self::FLOW_MODEL, 'table_name'))->getValue($model);
        $column = $wpdb->get_col("SELECT flow_details FROM `{$table}`");

        if ($wpdb->last_error !== '') {
            throw new RuntimeException('reading stored flows failed: ' . $wpdb->last_error);
        }

        $types = [];

        foreach ($column as $raw) {
            $details = \is_string($raw) ? json_decode($raw) : $raw;

            if (!\is_object($details) || !property_exists($details, 'type') || $details->type === null) {
                continue;
            }

            $type = $details->type;
            $key = \is_scalar($type) ? (string) $type : json_encode($type);
            $normalized = (string) $normalize($type);

            $types[$key] = [
                'normalized' => $normalized,
                'name'       => FlowAliases::apply($normalized, $aliases),
            ];
        }

        ksort($types, SORT_STRING);

        return $types;
    }

    /**
     * @return array<string, mixed>
     */
    private function dispatchEntry(ReflectionMethod $resolver, string $name): array
    {
        try {
            $class = $resolver->invoke(null, $name);
        } catch (Throwable $e) {
            $this->errors[] = "dispatch {$name}: " . \get_class($e) . ': ' . $e->getMessage();

            return ['class' => null];
        }

        if (!\is_string($class) || $class === '') {
            return ['class' => null];
        }

        return ['class' => $class]
            + ClassFacts::constructor($class)
            + ClassFacts::method($class, 'execute', 'execute')
            + ClassFacts::authConfig($class);
    }

    /**
     * @param list<array<string, mixed>> $registrations
     *
     * @return array<string, array<string, mixed>>
     */
    private function routes(array $registrations): array
    {
        $routes = [];

        foreach ($registrations as $registration) {
            $key = "{$registration['name']} {$registration['method']}";

            if (isset($routes[$key])) {
                $this->errors[] = "route {$key} is registered more than once (again in {$registration['folder']})";
                $key .= " @{$registration['folder']}";
            }

            $routes[$key] = $this->routeEntry($registration);
        }

        ksort($routes, SORT_STRING);

        return $routes;
    }

    /**
     * @param array<string, mixed> $registration
     *
     * @return array<string, mixed>
     */
    private function routeEntry(array $registration): array
    {
        $entry = [
            'name'      => $registration['name'],
            'method'    => $registration['method'],
            'folder'    => $registration['folder'],
            'modifiers' => $registration['modifiers'],
            'access'    => $registration['access'],
        ];

        $invokeable = $registration['invokeable'];

        if (!\is_array($invokeable) || \count($invokeable) !== 2 || !\is_string($invokeable[1] ?? null)) {
            return $entry + ['handlerShape' => get_debug_type($invokeable)];
        }

        $class = \is_object($invokeable[0]) ? \get_class($invokeable[0]) : (string) $invokeable[0];
        $entry += [
            'handlerClass'  => $class,
            'handlerMethod' => $invokeable[1],
        ];

        $loadError = ClassFacts::loadError($class);

        if ($loadError !== null) {
            return $entry + ['handlerLoadError' => $loadError];
        }

        return $entry
            + ClassFacts::method($class, $invokeable[1], 'handler')
            + ClassFacts::constructor($class)
            + ClassFacts::authConfig($class);
    }

    /**
     * @param list<string>                         $folders
     * @param list<array{0: string, 1: string}>    $aliases
     * @param array<string, array<string, string>> $storedTypes
     * @param array<string, array<string, mixed>>  $dispatch
     * @param array<string, array<string, mixed>>  $routes
     *
     * @return array<string, int>
     */
    private function counts(array $folders, array $aliases, array $storedTypes, array $dispatch, array $routes, int $routeFiles): array
    {
        $resolved = \count(array_filter($dispatch, static fn ($entry) => $entry['class'] !== null));
        $handlersOk = \count(array_filter($routes, static fn ($route) => ($route['handlerExists'] ?? false) === true));

        return [
            'actionFolders'        => \count($folders),
            'aliases'              => \count($aliases),
            'storedTypes'          => \count($storedTypes),
            'dispatchNames'        => \count($dispatch),
            'dispatchResolved'     => $resolved,
            'dispatchUnresolved'   => \count($dispatch) - $resolved,
            'dispatchWithAuth'     => \count(array_filter($dispatch, static fn ($entry) => ($entry['authConfigOwner'] ?? null) !== null)),
            'routeFiles'           => $routeFiles,
            'routes'               => \count($routes),
            'routeHandlersFound'   => $handlersOk,
            'routeHandlersMissing' => \count($routes) - $handlersOk,
            'routesWithAuth'       => \count(array_filter($routes, static fn ($route) => ($route['authConfigOwner'] ?? null) !== null)),
            'errors'               => \count($this->errors),
        ];
    }

    /**
     * @param array<string, true> $set
     *
     * @return list<string>
     */
    private static function sortedKeys(array $set): array
    {
        $keys = array_map('strval', array_keys($set));
        sort($keys, SORT_STRING);

        return $keys;
    }
}
