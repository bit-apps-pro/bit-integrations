<?php

declare(strict_types=1);

namespace BitApps\Restructure\Php;

use PhpParser\Modifiers;
use PhpParser\Node\Stmt;

final class Member
{
    public const ORDER_POSITIONS = [
        'use_trait'          => 0,
        'case'               => 1,
        'constant_public'    => 2,
        'constant_protected' => 3,
        'constant_private'   => 4,
        'property_public'    => 5,
        'property_protected' => 6,
        'property_private'   => 7,
        'construct'          => 8,
        'destruct'           => 9,
        'magic'              => 10,
        'phpunit'            => 11,
        'method_public'      => 12,
        'method_protected'   => 13,
        'method_private'     => 14,
    ];

    private const PHPUNIT_METHODS = [
        'setupbeforeclass', 'dosetupbeforeclass', 'teardownafterclass', 'doteardownafterclass', 'setup',
        'dosetup', 'assertpreconditions', 'assertpostconditions', 'teardown', 'doteardown',
    ];

    /**
     * @param list<string> $names
     */
    public function __construct(
        public readonly string $key,
        public readonly string $kind,
        public readonly array $names,
        public readonly Stmt $stmt,
        public readonly int $index,
        public readonly int $start,
        public readonly int $end,
        public readonly int $startLine,
        public readonly int $endLine,
    ) {
    }

    public static function keyFor(string $kind, string $name): string
    {
        return $kind === 'method' ? 'method:' . strtolower($name) : "{$kind}:{$name}";
    }

    public function name(): string
    {
        return $this->names[0] ?? '';
    }

    public function lineCount(): int
    {
        return $this->endLine - $this->startLine + 1;
    }

    public function isStatic(): bool
    {
        return match (true) {
            $this->stmt instanceof Stmt\ClassMethod => $this->stmt->isStatic(),
            $this->stmt instanceof Stmt\Property    => $this->stmt->isStatic(),
            default                                 => $this->kind === 'const',
        };
    }

    public function visibility(): string
    {
        $flags = match (true) {
            $this->stmt instanceof Stmt\ClassMethod,
            $this->stmt instanceof Stmt\Property,
            $this->stmt instanceof Stmt\ClassConst => $this->stmt->flags,
            default                                => 0,
        };

        if ($flags & Modifiers::PRIVATE) {
            return 'private';
        }

        if ($flags & Modifiers::PROTECTED) {
            return 'protected';
        }

        return 'public';
    }

    public function isConstructor(): bool
    {
        return $this->kind === 'method' && strtolower($this->name()) === '__construct';
    }

    public function isCode(): bool
    {
        return $this->kind !== 'nop';
    }

    public function orderPosition(?string $visibility = null): int
    {
        $visibility ??= $this->visibility();

        if ($this->kind === 'trait') {
            return self::ORDER_POSITIONS['use_trait'];
        }

        if ($this->kind === 'case') {
            return self::ORDER_POSITIONS['case'];
        }

        if ($this->kind === 'const') {
            return self::ORDER_POSITIONS["constant_{$visibility}"];
        }

        if ($this->kind === 'property') {
            return self::ORDER_POSITIONS["property_{$visibility}"];
        }

        if ($this->kind === 'method') {
            $lower = strtolower($this->name());

            if ($lower === '__construct') {
                return self::ORDER_POSITIONS['construct'];
            }

            if ($lower === '__destruct') {
                return self::ORDER_POSITIONS['destruct'];
            }

            if (\in_array($lower, self::PHPUNIT_METHODS, true)) {
                return self::ORDER_POSITIONS['phpunit'];
            }

            if (str_starts_with($this->name(), '__')) {
                return self::ORDER_POSITIONS['magic'];
            }

            return self::ORDER_POSITIONS["method_{$visibility}"];
        }

        return \count(self::ORDER_POSITIONS);
    }

    public function requiredParameterCount(): int
    {
        if (!$this->stmt instanceof Stmt\ClassMethod) {
            return 0;
        }

        $required = 0;

        foreach ($this->stmt->params as $position => $param) {
            if ($param->default === null && !$param->variadic) {
                $required = $position + 1;
            }
        }

        return $required;
    }
}
