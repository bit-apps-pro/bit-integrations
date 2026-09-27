<?php

declare(strict_types=1);

namespace BitApps\Restructure\Analyze;

use BitApps\Restructure\Cli\Options;
use BitApps\Restructure\Repo\Tree;
use BitApps\Restructure\Repo\Workspace;
use BitApps\Restructure\Support\Json;
use InvalidArgumentException;

final class AnalyzeCommand
{
    public const USAGE = <<<'TXT'
        bi analyze --free <freeRoot> [--pro <proRoot>] [--only A,B | --batch F1] [--out <dir>] [--summary <file>]

          Plans the Phase A move of each integration and writes <out>/<Integration>.json:
          member inventory, call graph (self::, static::, $this->, Class::, callables and
          callable strings), route and hook handlers, placement of every member, renames,
          file operations, refusals and the T1-T6 test flags. Nothing in the tree changes.

          --only     comma-separated backend/Actions folders (default: every folder with <N>Controller.php)
          --batch    a batch id from plan section 8.1 (F1..F10)
          --out      manifest directory (default: tools/restructure/manifests)
          --summary  also write the aggregate counts as JSON to this file
        TXT;

    public function __construct(private readonly string $toolRoot)
    {
    }

    /**
     * @param list<string> $argv
     */
    public function run(array $argv): int
    {
        $options = Options::parse($argv, ['quiet'], ['free', 'pro', 'only', 'batch', 'out', 'summary']);
        $workspace = new Workspace(Tree::filesystem($options->require('free')));
        $pro = $options->get('pro') === null ? null : ProIndex::scan((string) $options->get('pro'));
        $context = PlanContext::build($workspace, $pro);
        $folders = self::selectFolders($options, $workspace->integrations());
        $outDir = $options->get('out', $this->toolRoot . '/manifests');
        $planner = new Planner($context);
        $summary = ['integrations' => 0, 'refused' => 0, 'refusals' => [], 'flags' => [], 'tests' => [], 'moveTarget' => [], 'refusedIntegrations' => []];

        foreach ($folders as $folder) {
            $plan = $planner->plan($folder);
            $manifest = Manifest::fromPlan($plan);
            Json::writeFile(Manifest::path((string) $outDir, $folder), $manifest);
            $this->summarize($summary, $plan);

            if (!$options->has('quiet')) {
                fwrite(STDOUT, self::line($plan) . "\n");
            }
        }

        foreach (['refusals', 'flags', 'tests', 'moveTarget'] as $key) {
            ksort($summary[$key], SORT_STRING);
        }

        sort($summary['refusedIntegrations'], SORT_STRING);
        $errors = $context->index->parseErrors();

        if ($errors !== []) {
            $summary['parseErrors'] = $errors;
        }

        fwrite(STDOUT, self::summaryText($summary));

        if ($options->get('summary') !== null) {
            Json::writeFile((string) $options->get('summary'), $summary);
        }

        return 0;
    }

    /**
     * @param list<string> $known
     *
     * @return list<string>
     */
    public static function selectFolders(Options $options, array $known): array
    {
        $folders = $options->has('batch') ? \BitApps\Restructure\Cli\Batches::folders((string) $options->get('batch')) : $options->list('only');

        if ($folders === []) {
            return $known;
        }

        $unknown = array_values(array_diff($folders, $known));

        if ($unknown !== []) {
            throw new InvalidArgumentException('Not an integration folder with a Controller: ' . implode(', ', $unknown));
        }

        return array_values(array_unique($folders));
    }

    /**
     * @param array<string, mixed> $summary
     */
    private function summarize(array &$summary, IntegrationPlan $plan): void
    {
        $summary['integrations']++;

        if ($plan->isRefused()) {
            $summary['refused']++;
            $summary['refusedIntegrations'][] = $plan->folder;
        }

        $codes = [];

        foreach ($plan->refusals as $refusal) {
            $codes[$refusal['code']] = true;
        }

        foreach (array_keys($codes) as $code) {
            $summary['refusals'][$code] = ($summary['refusals'][$code] ?? 0) + 1;
        }

        foreach ($plan->flags as $name => $value) {
            if ($value !== null && $value !== false && $value !== [] && $name !== 'linesPerTarget') {
                $summary['flags'][$name] = ($summary['flags'][$name] ?? 0) + 1;
            }
        }

        foreach ($plan->tests as $test) {
            $summary['tests'][$test] = ($summary['tests'][$test] ?? 0) + 1;
        }

        if ($plan->layout !== null) {
            $target = $plan->helperExists ? 'Action (+ insert into existing Helper)' : ($plan->hasHelperMembers() ? ucfirst($plan->moveTarget) . ' (git mv) + ' . ($plan->moveTarget === IntegrationPlan::ACTION ? 'Helper' : 'Action') . ' (created)' : 'Action only');
            $summary['moveTarget'][$target] = ($summary['moveTarget'][$target] ?? 0) + 1;
        }
    }

    private static function line(IntegrationPlan $plan): string
    {
        if ($plan->layout === null) {
            return "{$plan->folder}: REFUSED " . implode('; ', array_map(static fn (array $r) => "[{$r['code']}] {$r['message']}", $plan->refusals));
        }

        $counts = [IntegrationPlan::ACTION => 0, IntegrationPlan::HELPER => 0, IntegrationPlan::BOTH => 0];

        foreach ($plan->placement as $side) {
            $counts[$side]++;
        }

        $parts = [
            $plan->folder . ':',
            'mv->' . ($plan->moveTarget === IntegrationPlan::HELPER ? 'Helper' : 'Action'),
            "action={$counts['action']} helper={$counts['helper']} both={$counts['both']}",
            'services=' . \count($plan->services),
            'widen=' . \count($plan->widen),
            'tests=' . ($plan->tests === [] ? '-' : implode(',', $plan->tests)),
        ];

        if (\count($plan->unit) > 1) {
            $parts[] = 'unit=' . implode('+', $plan->unit);
        }

        if ($plan->isRefused()) {
            $parts[] = 'REFUSED: ' . implode('; ', array_map(static fn (array $r) => "[{$r['code']}] {$r['message']}", $plan->refusals));
        }

        return implode(' ', $parts);
    }

    /**
     * @param array<string, mixed> $summary
     */
    private static function summaryText(array $summary): string
    {
        $text = "\nintegrations={$summary['integrations']} refused={$summary['refused']}\n";

        foreach (['refusals' => 'refusal', 'tests' => 'test', 'flags' => 'flag', 'moveTarget' => 'layout'] as $key => $label) {
            foreach ($summary[$key] as $name => $count) {
                $text .= "  {$label} {$name}: {$count}\n";
            }
        }

        return $text;
    }
}
