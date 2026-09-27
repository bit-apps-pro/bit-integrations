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

final class VerifyCommand
{
    public const USAGE = <<<'TXT'
        bi verify --root <repoRoot> --base <gitRef> [--only A,B | --batch F1] [--manifests <dir>] [--json <file>]

          Checks the working tree at <repoRoot> against <gitRef> for each integration:
          - every moved member's AST, names resolved and mapped through the manifests' renames,
            equals the base member (visibility may differ only where the manifest lists a widening);
          - no instance/static change, no member gained or lost, class modifiers and parents kept;
          - comment tokens per integration folder (and per edited file elsewhere) unchanged;
          - php7.4 -l and php8.4 -l clean on every file in the folder and every edited file;
          - Routes.php and Hooks.php point at methods that exist with the same static-ness.
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
        $options = Options::parse($argv, [], ['root', 'base', 'only', 'batch', 'manifests', 'json']);
        $root = $options->require('root');
        $base = new Workspace(Tree::gitRef($root, $options->require('base')));
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
            $ok = array_filter($results, static fn (array $result) => !$result['ok']) === [];
            $failed += $ok ? 0 : 1;
            $report[$folder] = ['ok' => $ok, 'checks' => $results, 'testsRequired' => $manifests[$folder]['tests'] ?? []];
            fwrite(STDOUT, ($ok ? 'PASS ' : 'FAIL ') . $folder . "\n");

            foreach ($results as $result) {
                fwrite(STDOUT, '  ' . ($result['ok'] ? 'ok   ' : 'FAIL ') . str_pad($result['check'], 28) . str_replace("\n", "\n" . str_repeat(' ', 35), $result['detail']) . "\n");
            }

            $tests = $manifests[$folder]['tests'] ?? [];

            if ($tests !== []) {
                fwrite(STDOUT, '  note ' . str_pad('extra tests (plan 8.5)', 28) . implode(', ', $tests) . " are required for this integration; their results are not checked here\n");
            }
        }

        fwrite(STDOUT, "\nverified=" . \count($folders) . " failed={$failed}\n");

        if ($options->get('json') !== null) {
            Json::writeFile((string) $options->get('json'), $report);
        }

        return $failed === 0 ? 0 : 1;
    }
}
