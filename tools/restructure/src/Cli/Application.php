<?php

declare(strict_types=1);

namespace BitApps\Restructure\Cli;

use BitApps\Restructure\Analyze\AnalyzeCommand;
use BitApps\Restructure\Apply\ApplyCommand;
use BitApps\Restructure\Verify\VerifyCommand;
use InvalidArgumentException;
use RuntimeException;
use Throwable;

final class Application
{
    private const DELEGATES = <<<'TXT'
        bi phpstan-diff <base.json> <head.json> [--rename-map <dir>] [--batch F1 | --only A,B]
        bi csfixer-subset [--base <gitRef>] [--batch F1 | --only A,B] [--repo <dir>] [...]

          Run qa/phpstan-diff.php and qa/csfixer-subset.php with the same arguments; --batch is
          expanded to --only, csfixer-subset defaults --base to main, and both read the
          manifests in tools/restructure/manifests unless told otherwise.
        TXT;

    public function __construct(private readonly string $toolRoot)
    {
    }

    /**
     * @param list<string> $argv
     */
    public function run(array $argv): int
    {
        $command = $argv[0] ?? 'help';
        $rest = \array_slice($argv, 1);

        try {
            return match ($command) {
                'analyze'              => (new AnalyzeCommand($this->toolRoot))->run($rest),
                'apply'                => (new ApplyCommand($this->toolRoot))->run($rest),
                'verify'               => (new VerifyCommand($this->toolRoot))->run($rest),
                'phpstan-diff'         => $this->delegate('qa/phpstan-diff.php', $rest, false, '--rename-map'),
                'csfixer-subset'       => $this->delegate('qa/csfixer-subset.php', $rest, true, '--manifests'),
                'help', '--help', '-h' => $this->help(0),
                default                => $this->help(2, "Unknown command {$command}"),
            };
        } catch (InvalidArgumentException $e) {
            return $this->help(2, $e->getMessage());
        } catch (RuntimeException $e) {
            fwrite(STDERR, "bi {$command}: {$e->getMessage()}\n");

            return 2;
        } catch (Throwable $e) {
            fwrite(STDERR, "bi {$command}: " . \get_class($e) . ": {$e->getMessage()}\n{$e->getTraceAsString()}\n");

            return 2;
        }
    }

    /**
     * @param list<string> $argv
     */
    private function delegate(string $script, array $argv, bool $needsBase, string $manifestOption): int
    {
        $forwarded = [];
        $hasBase = false;
        $hasManifests = false;

        for ($i = 0, $count = \count($argv); $i < $count; $i++) {
            $argument = $argv[$i];

            if ($argument === '--batch' || str_starts_with($argument, '--batch=')) {
                $batch = $argument === '--batch' ? ($argv[++$i] ?? throw new InvalidArgumentException('--batch needs a value')) : substr($argument, 8);
                $forwarded[] = '--only';
                $forwarded[] = implode(',', Batches::folders($batch));

                continue;
            }

            $hasBase = $hasBase || $argument === '--base' || str_starts_with($argument, '--base=');
            $hasManifests = $hasManifests || $argument === $manifestOption || str_starts_with($argument, $manifestOption . '=');
            $forwarded[] = $argument;
        }

        if ($needsBase && !$hasBase) {
            array_push($forwarded, '--base', 'main');
        }

        if (!$hasManifests && is_dir($this->toolRoot . '/manifests')) {
            array_push($forwarded, $manifestOption, $this->toolRoot . '/manifests');
        }

        $command = array_merge([PHP_BINARY, $this->toolRoot . '/' . $script], $forwarded);
        $process = proc_open($command, [0 => STDIN, 1 => STDOUT, 2 => STDERR], $pipes);

        if (!\is_resource($process)) {
            throw new RuntimeException("Cannot start {$script}");
        }

        return proc_close($process);
    }

    private function help(int $code, ?string $error = null): int
    {
        $stream = $code === 0 ? STDOUT : STDERR;

        if ($error !== null) {
            fwrite($stream, $error . "\n\n");
        }

        fwrite($stream, "Usage:\n" . AnalyzeCommand::USAGE . "\n\n" . ApplyCommand::USAGE . "\n\n" . VerifyCommand::USAGE . "\n\n" . self::DELEGATES . "\n");

        return $code;
    }
}
