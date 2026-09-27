<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

final class Reference
{
    public const IMPORT = 'import';

    public const STATIC_CALL = 'static-call';

    public const CONST = 'const';

    public const STATIC_PROP = 'static-prop';

    public const CALLABLE = 'callable';

    public const CLASS_NAME = 'class-name';

    public const NEW = 'new';

    public const INSTANCEOF = 'instanceof';

    public const TYPE = 'type';

    public const CATCH = 'catch';

    public const EXTENDS = 'extends';

    public const IMPLEMENTS = 'implements';

    public const NAME = 'name';

    public const STRING_FQCN = 'string-fqcn';

    public const STRING_CALLABLE = 'string-callable';

    /**
     * @param string      $style  fq|qualified|unqualified|import|string
     * @param string|null $alias  the import alias an unqualified or qualified name goes through
     * @param string|null $member member key (method:x, const:X, property:x) the reference reaches
     */
    public function __construct(
        public readonly string $file,
        public readonly int $line,
        public readonly string $kind,
        public readonly string $target,
        public readonly ?string $member,
        public readonly int $start,
        public readonly int $end,
        public readonly string $written,
        public readonly string $style,
        public readonly ?string $alias,
        public readonly ?string $inClass,
        public readonly ?string $inMember,
        public readonly bool $explicitAlias = false,
        public readonly bool $multiImport = false,
    ) {
    }

    public function isImport(): bool
    {
        return $this->kind === self::IMPORT;
    }

    public function id(): string
    {
        return "{$this->file}:{$this->start}:{$this->kind}";
    }

    /**
     * @return array<string, mixed>
     */
    public function describe(): array
    {
        return array_filter([
            'file'   => $this->file,
            'line'   => $this->line,
            'kind'   => $this->kind,
            'class'  => $this->target,
            'member' => $this->member,
            'text'   => $this->written,
        ], static fn ($value) => $value !== null);
    }
}
