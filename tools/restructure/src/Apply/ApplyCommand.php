<?php

declare(strict_types=1);

namespace BitApps\Restructure\Apply;

use BitApps\Restructure\Analyze\AnalyzeCommand;
use BitApps\Restructure\Analyze\IntegrationPlan;
use BitApps\Restructure\Analyze\Manifest;
use BitApps\Restructure\Analyze\PlanContext;
use BitApps\Restructure\Analyze\Planner;
use BitApps\Restructure\Analyze\ProIndex;
use BitApps\Restructure\Cli\Options;
use BitApps\Restructure\Repo\Tree;
use BitApps\Restructure\Repo\Workspace;
use BitApps\Restructure\Support\Git;
use BitApps\Restructure\Support\Lint;
use InvalidArgumentException;
use RuntimeException;

final class ApplyCommand
{
    public const USAGE = <<<'TXT'
        bi apply [--root <repoRoot> | --repo free] [--only A,B | --batch F1] [--commit-per-unit] [--manifests <dir>]
                 [--pro <proRoot>] [--fixer <php-cs-fixer> | --no-fixer] [--dry-run]

          Performs Phase A for each integration from its reviewed manifest: git mv of the
          Controller to the file that receives most of its lines (the Action when a Helper
          already exists), git mv of RecordApiHelper to <N>Service and of every other
          *ApiHelper to <N><Role>Service, the new Action or Helper built from verbatim member
          slices, and every reference that resolves to a moved class rewritten (use lines,
          ::class, new, static calls, type hints, class-name strings). Coupled integrations
          (WebHooks and its subclasses, Mail and LearnDash) form one unit and must be selected
          together. Files are linted with php7.4 and php8.4 before anything is committed.

          Salesforce keeps a permanent @deprecated SalesforceController extending SalesforceHelper
          at its old path (plan 6.6); the manifest lists it as a create-shim file operation.

          --root / --repo    repository to change; --repo free (or no option) means this plugin
          --commit-per-unit  commit each unit: refactor(actions): move <N> to Action/Service/Helper layout
          --manifests        manifest directory (default: tools/restructure/manifests)
          --pro              Pro root, only used to recompute the T2 flag
          --fixer            php-cs-fixer entry point for the import rules on created files
          --no-fixer         skip php-cs-fixer
          --dry-run          print the file operations without touching the tree
        TXT;

    private const ALLOWLIST = 'tools/restructure/ci/actions-shape-allowlist.txt';

    public function __construct(private readonly string $toolRoot)
    {
    }

    /**
     * @param list<string> $argv
     */
    public function run(array $argv): int
    {
        $options = Options::parse($argv, ['commit-per-unit', 'no-fixer', 'dry-run'], ['root', 'repo', 'only', 'batch', 'manifests', 'pro', 'fixer']);
        $root = Tree::filesystem($this->root($options))->root;
        $git = new Git($root);

        if (!$git->isRepository()) {
            throw new RuntimeException("{$root} is not a git repository");
        }

        $dryRun = $options->has('dry-run');

        if (!$dryRun && !$git->trackedTreeIsClean()) {
            throw new RuntimeException("{$root} has uncommitted changes to tracked files; commit or stash them first");
        }

        $manifests = (string) $options->get('manifests', $this->toolRoot . '/manifests');
        $pro = $options->get('pro') === null ? null : ProIndex::scan((string) $options->get('pro'));
        $fixer = $options->has('no-fixer') || $dryRun ? null : FixerRunner::locate($root, $this->toolRoot, $options->get('fixer'));
        $lint = new Lint();
        $context = PlanContext::build(new Workspace(Tree::filesystem($root)), $pro);
        $folders = AnalyzeCommand::selectFolders($options, $context->workspace->integrations());
        $units = $this->units($context, $folders);
        $failures = 0;

        foreach ($units as $position => $unit) {
            if ($position > 0) {
                $context = PlanContext::build(new Workspace(Tree::filesystem($root)), $pro);
            }

            $label = implode(' + ', $unit);
            $plans = $this->plans($context, $unit, $manifests);
            $change = UnitChange::compute($context->workspace, $plans);

            fwrite(STDOUT, "== {$label}\n" . $this->describe($change));

            if ($dryRun) {
                continue;
            }

            $this->write($git, $root, $change);
            $changedByFixer = $fixer?->fixImports($change->created) ?? [];

            foreach ($changedByFixer as $path) {
                fwrite(STDOUT, "   php-cs-fixer adjusted imports in {$path}\n");
            }

            $errors = [];

            foreach (array_keys($change->contents) as $path) {
                foreach ($lint->lintFile((string) $path, $root . '/' . $path) as $error) {
                    $errors[] = $error;
                }
            }

            $allowlist = $this->pruneAllowlist($root, array_keys($change->moves));
            $paths = array_merge($change->paths(), $allowlist === null ? [] : [$allowlist]);
            $git->add($paths);

            if ($errors !== []) {
                fwrite(STDERR, "   lint failed; the unit is left staged and uncommitted:\n   " . implode("\n   ", $errors) . "\n");
                $failures++;

                break;
            }

            fwrite(STDOUT, '   lint php7.4/php8.4: ' . \count($change->contents) . " files clean\n");

            if ($options->has('commit-per-unit')) {
                $sha = $git->commit($this->message($unit, $plans), $paths);
                fwrite(STDOUT, '   committed ' . substr($sha, 0, 12) . "\n");
            }
        }

        return $failures === 0 ? 0 : 1;
    }

    private function root(Options $options): string
    {
        if ($options->has('root') && $options->has('repo')) {
            throw new InvalidArgumentException('pass --root or --repo, not both');
        }

        $repo = $options->get('repo', 'free');

        return (string) $options->get('root', $repo === 'free' ? \dirname($this->toolRoot, 2) : $repo);
    }

    /**
     * @param list<string> $folders
     *
     * @return list<list<string>>
     */
    private function units(PlanContext $context, array $folders): array
    {
        $selected = array_flip($folders);
        $units = [];
        $seen = [];
        $missing = [];

        foreach ($folders as $folder) {
            $unit = $context->unitOf($folder);
            $key = implode(',', $unit);

            foreach ($unit as $member) {
                if (!isset($selected[$member])) {
                    $missing[$key][] = $member;
                }
            }

            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $units[] = $unit;
            }
        }

        if ($missing !== []) {
            $lines = [];

            foreach ($missing as $key => $members) {
                $lines[] = str_replace(',', ' + ', $key) . ' move as one unit; also select ' . implode(', ', array_unique($members));
            }

            throw new RuntimeException("Coupled integrations must be applied together:\n  " . implode("\n  ", $lines));
        }

        return $units;
    }

    /**
     * @param list<string> $unit
     *
     * @return list<IntegrationPlan>
     */
    private function plans(PlanContext $context, array $unit, string $manifests): array
    {
        $planner = new Planner($context);
        $plans = [];

        foreach ($unit as $folder) {
            $manifest = Manifest::load($manifests, $folder);
            $this->checkHashes($context, $manifest);
            $plan = $planner->plan($folder, Manifest::placements($manifest));

            if ($plan->isRefused()) {
                throw new RuntimeException("{$folder} is refused:\n  " . implode("\n  ", array_map(static fn (array $refusal) => "[{$refusal['code']}] {$refusal['message']}", $plan->refusals)));
            }

            $this->warnOnDrift($plan, $manifest);
            $plans[] = $plan;
        }

        return $plans;
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function checkHashes(PlanContext $context, array $manifest): void
    {
        $folderPrefix = 'backend/Actions/' . $manifest['integration'] . '/';

        foreach ($manifest['sourceHashes'] ?? [] as $path => $hash) {
            $content = $context->workspace->tree->read((string) $path);
            $current = $content === null ? 'missing' : sha1($content);

            if ($current === $hash) {
                continue;
            }

            if (str_starts_with((string) $path, $folderPrefix)) {
                throw new RuntimeException("The manifest for {$manifest['integration']} is stale: {$path} changed since `bi analyze`; re-run analyze and review it again");
            }

            fwrite(STDERR, "   note: {$path} changed since the manifest for {$manifest['integration']} was written\n");
        }
    }

    /**
     * @param array<string, mixed> $manifest
     */
    private function warnOnDrift(IntegrationPlan $plan, array $manifest): void
    {
        $fresh = Manifest::fromPlan($plan);

        foreach (['targets', 'renames', 'fileOps', 'constructorCopy'] as $key) {
            if (($fresh[$key] ?? null) != ($manifest[$key] ?? null)) {
                fwrite(STDERR, "   note: {$plan->folder}: '{$key}' differs from the reviewed manifest; the manifest placements were used\n");
            }
        }
    }

    private function describe(UnitChange $change): string
    {
        $text = '';

        foreach ($change->moves as $from => $to) {
            $text .= "   git mv {$from} -> {$to}\n";
        }

        foreach ($change->created as $path) {
            $text .= "   create {$path}\n";
        }

        foreach ($change->edited as $path) {
            $text .= "   edit   {$path}\n";
        }

        foreach ($change->shims as $path) {
            $text .= "   shim   {$path}\n";
        }

        return $text;
    }

    private function write(Git $git, string $root, UnitChange $change): void
    {
        foreach ($change->moves as $from => $to) {
            $git->move($from, $to);
        }

        foreach ($change->contents as $path => $content) {
            $full = $root . '/' . $path;

            if (!is_dir(\dirname($full)) && !mkdir(\dirname($full), 0777, true) && !is_dir(\dirname($full))) {
                throw new RuntimeException('Cannot create ' . \dirname($full));
            }

            file_put_contents($full, $content);
        }
    }

    /**
     * @param list<string> $removed
     */
    private function pruneAllowlist(string $root, array $removed): ?string
    {
        $path = $root . '/' . self::ALLOWLIST;

        if (!is_file($path)) {
            return null;
        }

        $lines = explode("\n", (string) file_get_contents($path));
        $kept = array_values(array_filter($lines, static fn (string $line) => !\in_array(trim($line), $removed, true)));

        if (\count($kept) === \count($lines)) {
            return null;
        }

        file_put_contents($path, implode("\n", $kept));

        return self::ALLOWLIST;
    }

    /**
     * @param list<string>          $unit
     * @param list<IntegrationPlan> $plans
     */
    private function message(array $unit, array $plans): string
    {
        if (\count($unit) === 1) {
            return "refactor(actions): move {$unit[0]} to Action/Service/Helper layout";
        }

        $inbound = [];

        foreach ($plans as $plan) {
            foreach ($plan->references as $reference) {
                $from = PlanContext::folderOfPath($reference->file);

                if ($from !== null && $from !== $plan->folder) {
                    $inbound[$plan->folder][$from] = true;
                }
            }
        }

        uksort($inbound, static fn ($a, $b) => [\count($inbound[$b]), $a] <=> [\count($inbound[$a]), $b]);
        $lead = (string) (array_key_first($inbound) ?? $unit[0]);
        $others = array_values(array_filter($unit, static fn (string $folder) => $folder !== $lead));
        $name = \count($others) === 1 ? "{$lead} and {$others[0]}" : "{$lead} and " . \count($others) . ' coupled integrations';

        return "refactor(actions): move {$name} to Action/Service/Helper layout";
    }
}
