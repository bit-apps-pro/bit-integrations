<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

final class Edge
{
    public const CALL = 'call';

    public const PROPERTY = 'property';

    public const CONSTANT = 'const';

    public const CALLABLE = 'callable';

    public const CALLABLE_STRING = 'callable-string';

    public const NEW = 'new';

    /**
     * @param string $via   self|static|class|this|this-static|magic-class|fqcn-string
     * @param int    $start start of the text that names the class (or `$this->`) and would be rewritten
     * @param int    $end   end of that text
     */
    public function __construct(
        public readonly string $from,
        public readonly string $to,
        public readonly string $form,
        public readonly string $via,
        public readonly int $line,
        public readonly int $start,
        public readonly int $end,
        public readonly bool $write = false,
    ) {
    }

    public function isCallableForm(): bool
    {
        return $this->form === self::CALLABLE || $this->form === self::CALLABLE_STRING;
    }

    public function label(): string
    {
        return match ($this->via) {
            'self'        => 'self::',
            'static'      => 'static::',
            'class'       => 'ClassName::',
            'this'        => '$this->',
            'this-static' => '$this::',
            'magic-class' => '__CLASS__',
            'fqcn-string' => "'FQCN'",
            default       => $this->via,
        } . ($this->isCallableForm() ? ' callable' : '');
    }

    /**
     * @return array<string, mixed>
     */
    public function describe(): array
    {
        return [
            'from' => $this->from,
            'to'   => $this->to,
            'form' => $this->form,
            'via'  => $this->via,
            'line' => $this->line,
        ] + ($this->write ? ['write' => true] : []);
    }
}
