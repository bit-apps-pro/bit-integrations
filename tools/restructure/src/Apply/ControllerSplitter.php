<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use BitApps\Restructure\Analyze\Edge;
use BitApps\Restructure\Analyze\IntegrationPlan;
use BitApps\Restructure\Analyze\Naming;
use BitApps\Restructure\Analyze\Reference;
use BitApps\Restructure\Analyze\RenameMap;
use BitApps\Restructure\Php\ClassLayout;
use BitApps\Restructure\Php\Member;
use BitApps\Restructure\Php\Names;
use BitApps\Restructure\Php\Source;
use PhpParser\Node\Name;
use PhpParser\Node\Stmt;
use PhpParser\NodeFinder;
use PhpParser\Token;
use RuntimeException;

final class ControllerSplitter
{
    private const NOP_POSITION = 1000;

    private Source $source;

    private ClassLayout $layout;

    /**
     * @var array<string, string> lowercase first name segment written by the tool => FQCN
     */
    private array $introduced = [];

    /**
     * @var array<int, string> spl_object_id(edge) => replacement
     */
    private array $crossings = [];

    /**
     * @param list<Reference>     $references references inside the Controller file to classes the unit renames
     * @param array<string, true> $renamed    FQCNs that stop existing
     */
    public function __construct(
        private readonly IntegrationPlan $plan,
        private readonly RenameMap $renames,
        private readonly array $references,
        private readonly array $renamed,
    ) {
        $this->layout = $plan->layout ?? throw new RuntimeException("{$plan->folder}: no Controller layout");
        $this->source = $this->layout->source;

        foreach ($plan->crossings as $crossing) {
            $this->crossings[spl_object_id($crossing['edge'])] = $crossing['replacement'];
        }

        $this->introduce($plan->actionFqcn);
        $this->introduce($plan->helperFqcn);
    }

    /**
     * @return array<string, string> path => new content
     */
    public function render(): array
    {
        $primary = $this->plan->moveTarget;
        $other = $primary === IntegrationPlan::ACTION ? IntegrationPlan::HELPER : IntegrationPlan::ACTION;
        $pieces = [IntegrationPlan::ACTION => [], IntegrationPlan::HELPER => []];

        foreach ($this->layout->members as $member) {
            if (!$member->isCode()) {
                $pieces[$primary][] = ['position' => self::NOP_POSITION, 'index' => $member->index, 'text' => $this->source->text($member->start, $member->end), 'key' => $member->key];

                continue;
            }

            $side = $this->plan->placement[$member->key] ?? null;

            if ($side === null) {
                throw new RuntimeException("{$this->plan->folder}: {$member->key} has no placement");
            }

            if ($side === IntegrationPlan::BOTH) {
                $pieces[$primary][] = $this->piece($member, $primary, false);
                $pieces[$other][] = $this->piece($member, $other, true);
            } else {
                $pieces[$side][] = $this->piece($member, $side, false);
            }

            if ($member->isConstructor() && $this->plan->ctorCopy !== null) {
                $pieces[IntegrationPlan::HELPER][] = $this->constructorCopy($member);
            }
        }

        $outputs = [];
        $movedPath = $primary === IntegrationPlan::ACTION ? $this->plan->actionPath : $this->plan->helperPath;
        $outputs[$movedPath] = $this->rebuildMoved($pieces[$primary], $primary);

        if ($this->plan->helperExists) {
            if ($pieces[IntegrationPlan::HELPER] !== []) {
                $outputs[$this->plan->helperPath] = $this->insertIntoHelper($pieces[IntegrationPlan::HELPER]);
            }
        } elseif ($pieces[$other] !== [] || $other === IntegrationPlan::ACTION) {
            $outputs[$other === IntegrationPlan::ACTION ? $this->plan->actionPath : $this->plan->helperPath] = $this->createFile($pieces[$other], $other);
        }

        return $outputs;
    }

    /**
     * @return array{position: int, index: int, text: string, key: string}
     */
    private function piece(Member $member, string $side, bool $copy): array
    {
        if ($copy) {
            $start = $member->stmt->getStartFilePos();
            $end = $member->stmt->getEndFilePos() + 1;

            if ($this->hasCommentBetween($start, $end)) {
                throw new RuntimeException("{$this->plan->folder}: {$member->key} is copied to both classes but has a comment inside it");
            }

            $lineStart = $this->source->lineStartPos($start);
            $indent = $this->source->text($lineStart, $start);

            if (trim($indent) !== '') {
                throw new RuntimeException("{$this->plan->folder}: {$member->key} does not start its line");
            }

            $text = $indent . $this->editsFor($member, $side, $start, $end, false)->applyTo($this->source->code, $start, $end);
        } else {
            $text = $this->editsFor($member, $side, $member->start, $member->end, true)->applyTo($this->source->code, $member->start, $member->end);
        }

        $visibility = !$copy && isset($this->plan->widen[$member->key]) ? $this->plan->widen[$member->key] : null;

        return ['position' => $member->orderPosition($visibility), 'index' => $member->index, 'text' => $text, 'key' => $member->key];
    }

    private function editsFor(Member $member, string $side, int $from, int $to, bool $widen): TextEdits
    {
        $edits = new TextEdits();

        foreach ($this->plan->graph?->edges ?? [] as $edge) {
            if ($edge->from !== $member->key || $edge->start < $from || $edge->end > $to) {
                continue;
            }

            $replacement = $this->edgeReplacement($edge, $side);

            if ($replacement !== null) {
                $edits->add($edge->start, $edge->end, $replacement, $edge->label() . ' ' . $edge->to);
            }
        }

        foreach ((new NodeFinder())->findInstanceOf([$member->stmt], Name::class) as $name) {
            $start = $name->getStartFilePos();
            $end = $name->getEndFilePos() + 1;

            if ($start < $from || $end > $to || Names::resolved($name) !== $this->plan->controllerFqcn || $edits->covers($start, $end) !== null) {
                continue;
            }

            $edits->add($start, $end, Naming::shortName($this->plan->sideClass($side)), 'own class name');
        }

        foreach ($this->references as $reference) {
            if ($reference->isImport() || $reference->start < $from || $reference->end > $to) {
                continue;
            }

            $replacement = $this->referenceReplacement($reference);

            if ($replacement !== null) {
                $edits->add($reference->start, $reference->end, $replacement, "rename {$reference->target}");
            }
        }

        if ($widen && isset($this->plan->widen[$member->key])) {
            $token = $this->visibilityToken($member);

            if ($token !== null) {
                $edits->add($token->pos, $token->pos + \strlen($token->text), $this->plan->widen[$member->key], 'widen');
            }
        }

        return $edits;
    }

    private function edgeReplacement(Edge $edge, string $side): ?string
    {
        if (isset($this->crossings[spl_object_id($edge)])) {
            return $this->crossings[spl_object_id($edge)];
        }

        if ($edge->via !== 'class' && $edge->via !== 'fqcn-string') {
            return null;
        }

        $target = $this->plan->placement[$this->plan->resolveKey($edge->to)] ?? $side;
        $holder = Naming::shortName($this->plan->sideClass($target === IntegrationPlan::BOTH ? $side : $target));

        return $edge->via === 'fqcn-string' ? $holder . '::class' : $holder;
    }

    private function referenceReplacement(Reference $reference): ?string
    {
        $new = $this->renames->target($reference->target, $reference->member, $reference->kind);

        if ($new === null || $new === $reference->target) {
            return null;
        }

        $short = Naming::shortName($new);

        return match ($reference->style) {
            'string'    => $this->classNameFor($new) . '::class',
            'fq'        => '\\' . $new,
            'qualified' => substr($reference->written, 0, (int) strrpos($reference->written, '\\') + 1) . $short,
            default     => $this->unqualified($reference, $new),
        };
    }

    private function unqualified(Reference $reference, string $new): ?string
    {
        if ($reference->alias !== null && $this->isExplicitAlias($reference->alias)) {
            $this->introduced[strtolower($reference->alias)] = $new;

            return null;
        }

        return $this->introduce($new);
    }

    private function introduce(string $fqcn): string
    {
        $short = Naming::shortName($fqcn);
        $this->introduced[strtolower($short)] = $fqcn;

        return $short;
    }

    private function classNameFor(string $fqcn): string
    {
        return Naming::namespaceName($fqcn) === $this->plan->namespace ? $this->introduce($fqcn) : '\\' . $fqcn;
    }

    private function isExplicitAlias(string $alias): bool
    {
        foreach (ImportBlock::of($this->source)->statements as $statement) {
            if ($statement['explicit'] && strcasecmp($statement['alias'], $alias) === 0) {
                return true;
            }
        }

        return false;
    }

    private function visibilityToken(Member $member): ?Token
    {
        $stmt = $member->stmt;
        $first = $stmt->getStartTokenPos();
        $limit = $stmt->getEndTokenPos();

        for ($i = $first; $i <= $limit; $i++) {
            $token = $this->source->tokens[$i];

            if ($token->id === T_PRIVATE || $token->id === T_PROTECTED) {
                return $token;
            }

            if (\in_array($token->id, [T_FUNCTION, T_VARIABLE, T_CONST], true)) {
                return null;
            }
        }

        return null;
    }

    /**
     * @return array{position: int, index: int, text: string, key: string}
     */
    private function constructorCopy(Member $constructor): array
    {
        $stmt = $constructor->stmt;

        if (!$stmt instanceof Stmt\ClassMethod || $stmt->stmts === null) {
            throw new RuntimeException("{$this->plan->folder}: the constructor has no body to copy");
        }

        $open = null;

        for ($i = $stmt->getStartTokenPos(), $limit = $stmt->getEndTokenPos(); $i <= $limit; $i++) {
            if ($this->source->tokens[$i]->text === '{') {
                $open = $this->source->tokens[$i]->pos;

                break;
            }
        }

        if ($open === null) {
            throw new RuntimeException("{$this->plan->folder}: cannot find the constructor body");
        }

        $header = $this->source->text($this->source->lineStartPos($stmt->getStartFilePos()), $open + 1);
        $lines = [];

        foreach ($this->plan->ctorCopy ?? [] as $index) {
            $kept = $stmt->stmts[$index] ?? throw new RuntimeException("{$this->plan->folder}: constructor statement {$index} is missing");
            $lines[] = $this->source->text($this->source->lineStartPos($kept->getStartFilePos()), $kept->getEndFilePos() + 1);
        }

        $close = $stmt->getEndFilePos();
        $footer = $this->source->text($this->source->lineStartPos($close), $close + 1);

        return ['position' => $constructor->orderPosition(), 'index' => $constructor->index, 'text' => $header . "\n" . implode("\n", $lines) . "\n" . $footer, 'key' => 'method:__construct'];
    }

    /**
     * @param list<array{position: int, index: int, text: string, key: string}> $pieces
     */
    private function body(array $pieces): string
    {
        if ($pieces === []) {
            return "\n";
        }

        usort($pieces, static fn (array $a, array $b) => [$a['position'], $a['index']] <=> [$b['position'], $b['index']]);

        return "\n" . implode("\n\n", array_column($pieces, 'text')) . "\n";
    }

    /**
     * @param list<array{position: int, index: int, text: string, key: string}> $pieces
     */
    private function rebuildMoved(array $pieces, string $side): string
    {
        $code = $this->source->code;
        $class = $this->layout->class;
        $edits = new TextEdits();
        $edits->add($class->name->getStartFilePos(), $class->name->getEndFilePos() + 1, Naming::shortName($this->plan->sideClass($side)), 'class name');

        foreach ($this->references as $reference) {
            if (!$reference->isImport() && $reference->start >= $class->getStartFilePos() && $reference->end <= $this->layout->openBrace) {
                $replacement = $this->referenceReplacement($reference);

                if ($replacement !== null) {
                    $edits->add($reference->start, $reference->end, $replacement, 'rename in class declaration');
                }
            }
        }

        $hasMembers = array_filter($this->layout->members, static fn (Member $member) => $member->isCode()) !== [];

        if ($hasMembers) {
            $edits->add($this->layout->bodyStart, $this->layout->closeBrace, $this->body($pieces), 'members');
        }

        return $this->withImports($code, $edits, ImportBlock::of($this->source), false);
    }

    /**
     * @param list<array{position: int, index: int, text: string, key: string}> $pieces
     */
    private function createFile(array $pieces, string $side): string
    {
        $class = $this->layout->class;

        if ($class->attrGroups !== []) {
            throw new RuntimeException("{$this->plan->folder}: the Controller class has attributes; the new class would not get them");
        }

        $header = "<?php\n\n";
        $before = [];
        $after = [];
        $block = ImportBlock::of($this->source);
        $seenUse = false;

        foreach ($this->source->stmts as $top) {
            if ($top instanceof Stmt\Declare_) {
                $header .= $this->source->nodeText($top) . "\n\n";
            }
        }

        foreach ($this->source->topLevelStmts() as $stmt) {
            if ($stmt instanceof Stmt\Use_ || $stmt instanceof Stmt\GroupUse) {
                $seenUse = true;
            } elseif ($stmt instanceof Stmt\If_) {
                if ($seenUse || $block->isEmpty()) {
                    $after[] = $this->source->nodeText($stmt);
                } else {
                    $before[] = $this->source->nodeText($stmt);
                }
            }
        }

        $header .= "namespace {$this->plan->namespace};\n\n";

        foreach ($before as $text) {
            $header .= $text . "\n\n";
        }

        $placeholder = '/*__BI_IMPORTS__*/';
        $declaration = implode(' ', array_merge($this->plan->modifiers, ['class', Naming::shortName($this->plan->sideClass($side))]));

        if ($side === IntegrationPlan::ACTION && $class->extends !== null) {
            $declaration .= ' extends ' . $this->declarationName($class->extends);
        }

        if ($side === IntegrationPlan::ACTION && $class->implements !== []) {
            $declaration .= ' implements ' . implode(', ', array_map(fn (Name $name) => $this->declarationName($name), $class->implements));
        }

        $body = $header . $placeholder . "\n\n";

        foreach ($after as $text) {
            $body .= $text . "\n\n";
        }

        $body .= $declaration . "\n{" . $this->body($pieces) . "}\n";
        $withoutPlaceholder = str_replace($placeholder, '', $body);
        $needs = ImportNeeds::compute($withoutPlaceholder, $this->plan->namespace, $this->originalImports(), $this->introduced, $this->renamed);
        $lines = ImportBlock::sorted(array_values(array_map(static fn (array $need) => ImportBlock::line($need['name'], $need['alias'], $need['type']), $needs)));

        if ($lines === []) {
            return str_replace($placeholder . "\n\n", '', $body);
        }

        return str_replace($placeholder, implode("\n", $lines), $body);
    }

    private function declarationName(Name $name): string
    {
        $start = $name->getStartFilePos();
        $end = $name->getEndFilePos() + 1;

        foreach ($this->references as $reference) {
            if ($reference->start === $start && $reference->end === $end) {
                return $this->referenceReplacement($reference) ?? $reference->written;
            }
        }

        return $this->source->text($start, $end);
    }

    /**
     * @param list<array{position: int, index: int, text: string, key: string}> $pieces
     */
    private function insertIntoHelper(array $pieces): string
    {
        $helper = $this->plan->existingHelper ?? throw new RuntimeException("{$this->plan->folder}: no existing Helper layout");
        $existing = array_values(array_filter($helper->members, static fn (Member $member) => $member->isCode()));
        $existingKeys = array_flip(array_map(static fn (Member $member) => $member->key, $existing));

        foreach ($pieces as $piece) {
            if (isset($existingKeys[$piece['key']])) {
                throw new RuntimeException("{$this->plan->helperPath} already declares {$piece['key']}");
            }
        }

        usort($pieces, static fn (array $a, array $b) => [$a['position'], $a['index']] <=> [$b['position'], $b['index']]);
        $edits = new TextEdits();

        if ($existing === []) {
            $edits->add($helper->bodyStart, $helper->closeBrace, $this->body($pieces), 'members');
        } else {
            $groups = [];

            foreach ($pieces as $piece) {
                $anchor = null;

                foreach ($existing as $member) {
                    if ($member->orderPosition() <= $piece['position']) {
                        $anchor = $member;
                    }
                }

                $groups[$anchor === null ? -1 : $anchor->index][] = $piece['text'];
            }

            foreach ($groups as $anchorIndex => $texts) {
                if ($anchorIndex === -1) {
                    $edits->add($existing[0]->start, $existing[0]->start, implode("\n\n", $texts) . "\n\n", 'insert before first member');
                } else {
                    $anchor = $helper->members[$anchorIndex];
                    $edits->add($anchor->end, $anchor->end, "\n\n" . implode("\n\n", $texts), 'insert after ' . $anchor->key);
                }
            }
        }

        return $this->withImports($helper->source->code, $edits, ImportBlock::of($helper->source), true);
    }

    private function withImports(string $code, TextEdits $edits, ImportBlock $block, bool $keepAll): string
    {
        $source = $block->source;
        $placeholder = '/*__BI_IMPORTS__*/';
        $draft = clone $edits;

        if ($block->isEmpty()) {
            if ($block->namespaceEnd === null) {
                throw new RuntimeException("{$source->path} has no namespace statement");
            }

            $draft->add($block->namespaceEnd, $block->namespaceEnd, "\n\n" . $placeholder, 'imports');
        } else {
            $draft->add((int) $block->start, (int) $block->end, $placeholder, 'imports');
        }

        $drafted = $draft->applyTo($code);
        $original = $source === $this->source ? $this->originalImports() : self::importsOf($block);
        $needs = ImportNeeds::compute(str_replace($placeholder, '', $drafted), $this->plan->namespace, $original, $this->introduced, $keepAll ? [] : $this->renamed);
        $lines = [];
        $satisfied = [];

        foreach ($block->statements as $statement) {
            $key = $statement['type'] . ':' . strtolower($statement['alias']);

            if (!$statement['simple']) {
                $lines[] = $statement['text'];

                continue;
            }

            if ($keepAll || (isset($needs[$key]) && strcasecmp($needs[$key]['name'], $statement['name']) === 0)) {
                $lines[] = $statement['text'];
                $satisfied[$key] = true;
            }
        }

        foreach ($needs as $key => $need) {
            if (!isset($satisfied[$key])) {
                $lines[] = ImportBlock::line($need['name'], $need['alias'], $need['type']);
            }
        }

        $sort = $block->isEmpty() || $block->wasSorted();

        if ($block->isEmpty()) {
            return $lines === [] ? str_replace("\n\n" . $placeholder, '', $drafted) : str_replace($placeholder, implode("\n", ImportBlock::sorted($lines)), $drafted);
        }

        if ($lines === []) {
            $after = (int) $block->end;

            while ($after < \strlen($code) && ctype_space($code[$after])) {
                $after++;
            }

            $final = clone $edits;
            $final->add((int) $block->start, $after, '', 'remove imports');

            return $final->applyTo($code);
        }

        $final = clone $edits;
        $final->add((int) $block->start, (int) $block->end, $block->contiguous ? $block->render($lines, $sort) : implode("\n", $lines), 'imports');

        return $final->applyTo($code);
    }

    /**
     * @return list<array{name: string, alias: string, type: int}>
     */
    private function originalImports(): array
    {
        return self::importsOf(ImportBlock::of($this->source));
    }

    /**
     * @return list<array{name: string, alias: string, type: int}>
     */
    private static function importsOf(ImportBlock $block): array
    {
        $imports = [];

        foreach ($block->statements as $statement) {
            if ($statement['simple']) {
                $imports[] = ['name' => $statement['name'], 'alias' => $statement['alias'], 'type' => $statement['type']];
            }
        }

        return $imports;
    }

    private function hasCommentBetween(int $start, int $end): bool
    {
        foreach ($this->source->tokens as $token) {
            if ($token->pos >= $end) {
                break;
            }

            if ($token->pos >= $start && ($token->id === T_COMMENT || $token->id === T_DOC_COMMENT)) {
                return true;
            }
        }

        return false;
    }
}
