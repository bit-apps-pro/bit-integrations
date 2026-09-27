<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use PhpParser\Node;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitor\NameResolver;
use PhpParser\Parser;
use PhpParser\ParserFactory;
use PhpParser\PrettyPrinter\Standard;
use ReflectionClass;
use RuntimeException;

final class ParserKit
{
    private static ?Parser $parser = null;

    private static ?Standard $printer = null;

    /**
     * @return Node[]
     */
    public static function parseFile(string $file): array
    {
        $code = @file_get_contents($file);

        if ($code === false) {
            throw new RuntimeException("cannot read {$file}");
        }

        return self::parseCode($code, $file);
    }

    /**
     * @return Node[]
     */
    public static function parseCode(string $code, string $label): array
    {
        try {
            $stmts = self::parser()->parse($code) ?? [];
        } catch (\PhpParser\Error $e) {
            throw new RuntimeException("{$label}: {$e->getMessage()}", 0, $e);
        }

        $traverser = new NodeTraverser(new NameResolver(null, ['preserveOriginalNames' => true]));

        return $traverser->traverse($stmts);
    }

    public static function printer(): Standard
    {
        return self::$printer ??= new Standard(['shortArraySyntax' => true]);
    }

    public static function assertBundledParser(): void
    {
        $loadedFrom = (string) (new ReflectionClass(ParserFactory::class))->getFileName();
        $bundled = realpath(\dirname(__DIR__, 2) . '/vendor/nikic/php-parser');

        if ($bundled === false || strncmp((string) realpath($loadedFrom), $bundled . DIRECTORY_SEPARATOR, \strlen($bundled) + 1) !== 0) {
            throw new RuntimeException('nikic/php-parser was loaded from another package before the tools vendor; refusing to mix parser versions');
        }
    }

    private static function parser(): Parser
    {
        return self::$parser ??= (new ParserFactory())->createForHostVersion();
    }
}
