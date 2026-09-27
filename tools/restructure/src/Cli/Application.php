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

    private function help(int $code, ?string $error = null): int
    {
        $stream = $code === 0 ? STDOUT : STDERR;

        if ($error !== null) {
            fwrite($stream, $error . "\n\n");
        }

        fwrite($stream, "Usage:\n" . AnalyzeCommand::USAGE . "\n\n" . ApplyCommand::USAGE . "\n\n" . VerifyCommand::USAGE . "\n");

        return $code;
    }
}
