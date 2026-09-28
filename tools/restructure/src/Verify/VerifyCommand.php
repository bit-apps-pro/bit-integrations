<?php

declare(strict_types=1);

namespace BitApps\Restructure\Verify;

use BitApps\Restructure\Analyze\AnalyzeCommand;
use BitApps\Restructure\Analyze\Manifest;
use BitApps\Restructure\Cli\Options;
use BitApps\Restructure\Repo\Tree;
use BitApps\Restructure\Repo\Workspace;
use BitApps\Restructure\Support\Json;
use BitApps\Restructure\Support\Lint;
use BitApps\Restructure\Support\Shell;

final class VerifyCommand
{
    public const USAGE = <<<'TXT'
        bi verify [--root <repoRoot>] [--base <gitRef>] [--only A,B | --batch F1] [--manifests <dir>] [--json <file>]
                  [--tests <dir> | --allow-missing-tests]

          Checks the working tree at <repoRoot> (default: this plugin) against <gitRef> (default: main)
          for each integration:
          - every moved member's AST, names resolved and mapped through the manifests' renames,
            equals the base member (visibility may differ only where the manifest lists a widening);
          - no instance/static change, no member gained or lost, class modifiers and parents kept;
          - statements outside the class (declare, guards, code) equal to the source file's;
          - the permanent shims of plan 6.6 are written byte for byte;
          - comment tokens per integration folder (and per edited file elsewhere) unchanged;
          - php7.4 -l and php8.4 -l clean on every file in the folder and every edited file;
          - Routes.php and Hooks.php point at methods that exist with the same static-ness;
          - contract/public-contract.php passes on the tree (autoloaded through PSR-4 from backend/);
          - the plan 8.5 tests the manifest requires (T1-T6) have passing harness results in --tests,
            recorded by route-smoke.php/flow-smoke.php --results=<dir> against this exact folder state.
          --allow-missing-tests reports missing results without failing; use it only for a dry run.
          Exits 1 with a report when anything does not match.
        TXT;

    public function __construct(private readonly string $toolRoot)
    {
    }

    /**
     * @param list<string> $argv
     */
    public function run(array $argv): int
    {
        $options = Options::parse($argv, ['allow-missing-tests'], ['root', 'base', 'only', 'batch', 'manifests', 'json', 'tests']);
        $root = (string) $options->get('root', \dirname($this->toolRoot, 2));
        $base = new Workspace(Tree::gitRef($root, (string) $options->get('base', 'main')));
        $head = new Workspace(Tree::filesystem($root));
        $manifestDir = (string) $options->get('manifests', $this->toolRoot . '/manifests');
        $folders = AnalyzeCommand::selectFolders($options, $base->integrations());
        $manifests = [];
        $map = new UnitMap();

        foreach ($folders as $folder) {
            $manifest = Manifest::load($manifestDir, $folder);

            foreach ($manifest['unit'] ?? [$folder] as $member) {
                $manifests[$member] ??= $member === $folder ? $manifest : Manifest::load($manifestDir, (string) $member);
            }
        }

        foreach ($manifests as $manifest) {
            $map->add($manifest);
        }

        $verifier = new Verifier($base, $head, $map, new Lint());
        $failed = 0;
        $report = [];

        foreach ($folders as $folder) {
            $results = $verifier->verify($manifests[$folder]);
            $results = array_merge($results, $this->testResults($options, $head->tree->root, $folder, $manifests[$folder]['tests'] ?? []));
            $ok = array_filter($results, static fn (array $result) => !$result['ok']) === [];
            $failed += $ok ? 0 : 1;
            $report[$folder] = ['ok' => $ok, 'checks' => $results, 'testsRequired' => $manifests[$folder]['tests'] ?? []];
            fwrite(STDOUT, ($ok ? 'PASS ' : 'FAIL ') . $folder . "\n");

            foreach ($results as $result) {
                fwrite(STDOUT, '  ' . ($result['ok'] ? 'ok   ' : 'FAIL ') . str_pad($result['check'], 28) . str_replace("\n", "\n" . str_repeat(' ', 35), $result['detail']) . "\n");
            }
        }

        $contract = $this->publicContract($head->tree->root);
        fwrite(STDOUT, ($contract['ok'] ? 'PASS ' : 'FAIL ') . "public contract (plan 6.6)\n  " . str_replace("\n", "\n  ", $contract['detail']) . "\n");
        $report['__publicContract'] = $contract;

        fwrite(STDOUT, "\nverified=" . \count($folders) . " failed={$failed}" . ($contract['ok'] ? '' : ' public-contract=FAIL') . "\n");

        if ($options->get('json') !== null) {
            Json::writeFile((string) $options->get('json'), $report);
        }

        return $failed === 0 && $contract['ok'] ? 0 : 1;
    }

    /**
     * @param list<string> $required
     *
     * @return list<array{ok: bool, check: string, detail: string}>
     */
    private function testResults(Options $options, string $root, string $folder, array $required): array
    {
        if ($required === []) {
            return [];
        }

        $label = 'tests (plan 8.5)';
        $dir = $options->get('tests');

        if ($dir === null) {
            $detail = implode(', ', $required) . ' required; no --tests results directory given';

            return [['ok' => $options->has('allow-missing-tests'), 'check' => $label, 'detail' => $detail . ($options->has('allow-missing-tests') ? ' (allowed by --allow-missing-tests)' : '')]];
        }

        $check = TestResults::check($dir, $folder, TestResults::folderDigest($root, $folder), $required);

        if ($check['problems'] === []) {
            return [['ok' => true, 'check' => $label, 'detail' => implode("\n", $check['satisfied'])]];
        }

        $allowed = $options->has('allow-missing-tests');

        return [['ok' => $allowed, 'check' => $label, 'detail' => implode("\n", $check['problems']) . ($allowed ? "\n(allowed by --allow-missing-tests)" : '')]];
    }

    /**
     * @return array{ok: bool, detail: string}
     */
    private function publicContract(string $root): array
    {
        [$code, $out, $err] = Shell::run([PHP_BINARY, $this->toolRoot . '/contract/public-contract.php', '--root=' . $root]);
        $lines = array_values(array_filter(explode("\n", trim($out . "\n" . $err)), static fn (string $line) => $line !== ''));

        return ['ok' => $code === 0, 'detail' => implode("\n", $lines)];
    }
}
