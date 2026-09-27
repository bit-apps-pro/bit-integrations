<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Php\ClassLayout;

final class IntegrationPlan
{
    public const ACTION = 'action';

    public const HELPER = 'helper';

    public const BOTH = 'both';

    public string $controllerPath;

    public string $controllerFqcn;

    public ?ClassLayout $layout = null;

    public ?MemberGraph $graph = null;

    /**
     * @var list<string>
     */
    public array $modifiers = [];

    public ?string $parent = null;

    public int $ctorRequired = 0;

    public ?bool $ctorExists = null;

    public string $actionPath;

    public string $actionFqcn;

    public string $helperPath;

    public string $helperFqcn;

    public bool $helperExists = false;

    public ?ClassLayout $existingHelper = null;

    /**
     * @var 'action'|'helper'
     */
    public string $moveTarget = self::ACTION;

    /**
     * @var list<array{from: string, to: string, fromClass: string, toClass: string}>
     */
    public array $services = [];

    /**
     * @var array<string, list<array<string, mixed>>> service source path => member inventory
     */
    public array $serviceMembers = [];

    /**
     * @var array<string, string> member key => action|helper|both
     */
    public array $placement = [];

    /**
     * @var array<string, string>
     */
    public array $reasons = [];

    /**
     * @var array<string, list<string>> member key => root kinds that reach it
     */
    public array $reach = [];

    /**
     * @var array<string, string> member key => new visibility
     */
    public array $widen = [];

    /**
     * @var array<string, string> alias member key (second name of a grouped declaration) => statement key
     */
    public array $aliases = [];

    /**
     * @var list<int>|null indexes of the constructor statements the Helper copy keeps
     */
    public ?array $ctorCopy = null;

    /**
     * @var list<string>
     */
    public array $ctorCopyProperties = [];

    /**
     * @var list<array{edge: Edge, holder: string, replacement: string}>
     */
    public array $crossings = [];

    /**
     * @var list<array<string, mixed>>
     */
    public array $routes = [];

    /**
     * @var list<array<string, mixed>>
     */
    public array $hooks = [];

    /**
     * @var list<Reference> references from other code to the classes this plan renames
     */
    public array $references = [];

    /**
     * @var list<array{code: string, message: string}>
     */
    public array $refusals = [];

    /**
     * @var array<string, mixed>
     */
    public array $flags = [];

    /**
     * @var list<string>
     */
    public array $tests = [];

    /**
     * @var list<string>
     */
    public array $unit = [];

    /**
     * @var list<string>
     */
    public array $editedFiles = [];

    /**
     * @var array<string, string> path => sha1
     */
    public array $hashes = [];

    public RenameMap $renames;

    public function __construct(public readonly string $folder, public readonly string $namespace)
    {
        $this->renames = new RenameMap();
    }

    public function refuse(string $code, string $message): void
    {
        foreach ($this->refusals as $refusal) {
            if ($refusal['code'] === $code && $refusal['message'] === $message) {
                return;
            }
        }

        $this->refusals[] = ['code' => $code, 'message' => $message];
    }

    public function flag(string $name, mixed $value): void
    {
        $this->flags[$name] = $value;
    }

    public function isRefused(): bool
    {
        return $this->refusals !== [];
    }

    public function sideClass(string $side): string
    {
        return $side === self::ACTION ? $this->actionFqcn : $this->helperFqcn;
    }

    public function hasHelperMembers(): bool
    {
        foreach ($this->placement as $side) {
            if ($side !== self::ACTION) {
                return true;
            }
        }

        return false;
    }

    public function resolveKey(string $key): string
    {
        return $this->aliases[$key] ?? $key;
    }

    /**
     * @return array<string, list<string>> member key => classes that hold it
     */
    public function holders(): array
    {
        $holders = [];

        foreach ($this->placement as $key => $side) {
            $holders[$key] = match ($side) {
                self::ACTION => [$this->actionFqcn],
                self::HELPER => [$this->helperFqcn],
                default      => [$this->actionFqcn, $this->helperFqcn],
            };
        }

        foreach ($this->aliases as $alias => $key) {
            $holders[$alias] = $holders[$key] ?? [];
        }

        ksort($holders, SORT_STRING);

        return $holders;
    }
}
