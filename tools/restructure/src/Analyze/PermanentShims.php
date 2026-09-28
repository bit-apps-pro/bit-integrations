<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

final class PermanentShims
{
    public const OP = 'create-shim';

    private const SHIMS = [
        'Salesforce' => [
            'since'  => '2.11.0',
            'reason' => 'Bit Integrations Pro 2.6.11 to 2.8.5 resolves this class by name.',
        ],
    ];

    /**
     * @return array{since: string, reason: string}|null
     */
    public static function for(string $folder): ?array
    {
        return self::SHIMS[$folder] ?? null;
    }

    public static function docblock(string $parentShort, string $since, string $reason): string
    {
        return "/**\n * @deprecated {$since} Use {$parentShort}. Kept permanently: {$reason}\n */";
    }

    public static function render(string $namespace, string $classShort, string $parentShort, string $docblock): string
    {
        return "<?php\n\nnamespace {$namespace};\n\nif (!defined('ABSPATH')) {\n    exit;\n}\n\n{$docblock}\nclass {$classShort} extends {$parentShort}\n{\n}\n";
    }

    /**
     * @param array<string, mixed> $op a create-shim file operation from a manifest
     */
    public static function renderOp(array $op): string
    {
        $class = (string) $op['class'];

        return self::render(Naming::namespaceName($class), Naming::shortName($class), Naming::shortName((string) $op['extends']), (string) $op['docblock']);
    }
}
