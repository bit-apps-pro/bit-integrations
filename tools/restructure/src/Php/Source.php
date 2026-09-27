<?php

declare(strict_types=1);

namespace BitApps\Restructure\Php;

use PhpParser\Error;
use PhpParser\Node;
use PhpParser\Node\Stmt;
use PhpParser\NodeFinder;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitor\NameResolver;
use PhpParser\NodeVisitor\ParentConnectingVisitor;
use PhpParser\Parser;
use PhpParser\ParserFactory;
use PhpParser\PhpVersion;
use PhpParser\Token;
use RuntimeException;

final class Source
{
    private static ?Parser $legacyParser = null;

    private static ?Parser $modernParser = null;

    /**
     * @var list<int>|null
     */
    private ?array $lineStarts = null;

    /**
     * @param list<Stmt>  $stmts
     * @param list<Token> $tokens
     */
    private function __construct(
        public readonly string $path,
        public readonly string $code,
        public readonly array $stmts,
        public readonly array $tokens,
        public readonly bool $parsedAsModern,
    ) {
    }

    public static function fromString(string $path, string $code): self
    {
        $modern = false;

        try {
            $parser = self::$legacyParser ??= (new ParserFactory())->createForVersion(PhpVersion::fromString('7.4'));
            $stmts = $parser->parse($code);
        } catch (Error $e) {
            $modern = true;

            try {
                $parser = self::$modernParser ??= (new ParserFactory())->createForNewestSupportedVersion();
                $stmts = $parser->parse($code);
            } catch (Error $inner) {
                throw new RuntimeException("Cannot parse {$path}: {$inner->getMessage()}", 0, $inner);
            }
        }

        $tokens = $parser->getTokens();
        $traverser = new NodeTraverser();
        $traverser->addVisitor(new NameResolver(null, ['preserveOriginalNames' => false, 'replaceNodes' => false]));
        $traverser->addVisitor(new ParentConnectingVisitor());
        $stmts = $traverser->traverse($stmts ?? []);

        return new self($path, $code, $stmts, $tokens, $modern);
    }

    public static function fromFile(string $root, string $relativePath): self
    {
        $code = file_get_contents(rtrim($root, '/') . '/' . $relativePath);

        if ($code === false) {
            throw new RuntimeException("Cannot read {$relativePath}");
        }

        return self::fromString($relativePath, $code);
    }

    public function text(int $start, int $end): string
    {
        return substr($this->code, $start, $end - $start);
    }

    public function nodeText(Node $node): string
    {
        return $this->text($node->getStartFilePos(), $node->getEndFilePos() + 1);
    }

    public function lineOf(int $pos): int
    {
        $starts = $this->lineStarts();
        $low = 0;
        $high = \count($starts) - 1;

        while ($low < $high) {
            $mid = intdiv($low + $high + 1, 2);

            if ($starts[$mid] <= $pos) {
                $low = $mid;
            } else {
                $high = $mid - 1;
            }
        }

        return $low + 1;
    }

    public function lineStartPos(int $pos): int
    {
        $starts = $this->lineStarts();

        return $starts[$this->lineOf($pos) - 1];
    }

    public function lineEndPos(int $pos): int
    {
        $newline = strpos($this->code, "\n", $pos);

        return $newline === false ? \strlen($this->code) : $newline;
    }

    public function onlyWhitespaceBetween(int $start, int $end): bool
    {
        return trim($this->text($start, $end), " \t\r\n") === '';
    }

    public function namespaceName(): ?string
    {
        foreach ($this->stmts as $stmt) {
            if ($stmt instanceof Stmt\Namespace_) {
                return $stmt->name?->toString();
            }
        }

        return null;
    }

    /**
     * @return list<Stmt>
     */
    public function topLevelStmts(): array
    {
        foreach ($this->stmts as $stmt) {
            if ($stmt instanceof Stmt\Namespace_) {
                return $stmt->stmts;
            }
        }

        return $this->stmts;
    }

    /**
     * @return list<Stmt\ClassLike>
     */
    public function classLikes(): array
    {
        return array_values((new NodeFinder())->findInstanceOf($this->stmts, Stmt\ClassLike::class));
    }

    public function findClass(string $shortName): ?Stmt\Class_
    {
        foreach ($this->classLikes() as $classLike) {
            if ($classLike instanceof Stmt\Class_ && $classLike->name !== null && strcasecmp($classLike->name->toString(), $shortName) === 0) {
                return $classLike;
            }
        }

        return null;
    }

    /**
     * @return list<array{stmt: Stmt\Use_, item: Node\UseItem, alias: string, name: string, type: int}>
     */
    public function imports(): array
    {
        $imports = [];

        foreach ($this->topLevelStmts() as $stmt) {
            if (!$stmt instanceof Stmt\Use_) {
                continue;
            }

            foreach ($stmt->uses as $item) {
                $type = $stmt->type === Stmt\Use_::TYPE_UNKNOWN ? $item->type : $stmt->type;
                $imports[] = [
                    'stmt'  => $stmt,
                    'item'  => $item,
                    'alias' => $item->getAlias()->toString(),
                    'name'  => $item->name->toString(),
                    'type'  => $type,
                ];
            }
        }

        return $imports;
    }

    /**
     * @return list<Token>
     */
    public function commentTokens(): array
    {
        $comments = [];

        foreach ($this->tokens as $token) {
            if ($token->id === T_COMMENT || $token->id === T_DOC_COMMENT) {
                $comments[] = $token;
            }
        }

        return $comments;
    }

    public function tokenIndexAt(int $filePos): ?int
    {
        $low = 0;
        $high = \count($this->tokens) - 1;

        while ($low <= $high) {
            $mid = intdiv($low + $high, 2);
            $token = $this->tokens[$mid];

            if ($token->pos === $filePos) {
                return $mid;
            }

            if ($token->pos < $filePos) {
                $low = $mid + 1;
            } else {
                $high = $mid - 1;
            }
        }

        return null;
    }

    /**
     * @return list<int>
     */
    private function lineStarts(): array
    {
        if ($this->lineStarts !== null) {
            return $this->lineStarts;
        }

        $starts = [0];
        $offset = 0;

        while (($newline = strpos($this->code, "\n", $offset)) !== false) {
            $starts[] = $newline + 1;
            $offset = $newline + 1;
        }

        return $this->lineStarts = $starts;
    }
}
