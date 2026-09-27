<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Lib;

use FilesystemIterator;
use PhpParser\Node;
use PhpParser\Node\Name\FullyQualified;
use PhpParser\Node\Scalar\MagicConst;
use PhpParser\Node\Scalar\String_;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitorAbstract;
use Throwable;

final class RouteCapture
{
    public const ROUTE_CLASS = 'BitApps\\Integrations\\Core\\Util\\Route';

    /**
     * @return list<string>
     */
    public static function folders(string $actionsDir): array
    {
        $folders = [];

        foreach (new FilesystemIterator($actionsDir) as $entry) {
            if ($entry->isDir()) {
                $folders[] = $entry->getFilename();
            }
        }

        sort($folders, SORT_STRING);

        return $folders;
    }

    /**
     * @return array{registrations: list<array<string, mixed>>, errors: list<string>, files: int}
     */
    public static function capture(string $actionsDir): array
    {
        $registrations = [];
        $errors = [];
        $files = 0;

        foreach (self::folders($actionsDir) as $folder) {
            $file = $actionsDir . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . 'Routes.php';

            if (!is_readable($file)) {
                continue;
            }

            ++$files;

            try {
                self::evaluate(self::redirectRouteCalls($file));
            } catch (Throwable $e) {
                $errors[] = "routes {$folder}: " . \get_class($e) . ': ' . $e->getMessage();
            }

            foreach (RouteRecorder::drain() as $registration) {
                $registrations[] = ['folder' => $folder] + $registration;
            }
        }

        return ['registrations' => $registrations, 'errors' => $errors, 'files' => $files];
    }

    private static function redirectRouteCalls(string $file): string
    {
        $visitor = new class($file) extends NodeVisitorAbstract {
            public function __construct(private string $file)
            {
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof FullyQualified && strcasecmp($node->toString(), RouteCapture::ROUTE_CLASS) === 0) {
                    return new FullyQualified(RouteRecorder::class, $node->getAttributes());
                }

                if ($node instanceof MagicConst\Dir) {
                    return new String_(\dirname($this->file));
                }

                if ($node instanceof MagicConst\File) {
                    return new String_($this->file);
                }
            }
        };

        $stmts = (new NodeTraverser($visitor))->traverse(ParserKit::parseFile($file));

        return ParserKit::printer()->prettyPrint($stmts);
    }

    private static function evaluate(string $code): void
    {
        eval($code);
    }
}
