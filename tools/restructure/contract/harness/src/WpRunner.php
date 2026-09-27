<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

use RuntimeException;

final class WpRunner
{
    public const PRO_PLUGIN = 'bit-integrations-pro';

    private const DISABLED_FUNCTIONS = 'curl_exec,curl_multi_exec,fsockopen,pfsockopen,stream_socket_client,socket_connect';

    private string $php;

    private string $wpCli;

    private int $timeout;

    public function __construct(private Workspace $workspace, Options $options, private Log $log)
    {
        $this->php = (string) $options->get('php', 'php');
        $this->wpCli = $options->get('wp-cli') ?? self::which('wp');
        $this->timeout = max(10, (int) $options->get('timeout', '180'));

        if ($this->wpCli === '' || !is_file($this->wpCli)) {
            throw new RuntimeException('wp-cli not found; pass --wp-cli=<path to the wp phar>');
        }
    }

    /**
     * @param array<string, mixed> $job
     *
     * @return array{exit_code: int, result: ?object, stderr: string, timed_out: bool}
     */
    public function run(string $label, array $job, bool $proActive = true, ?int $user = null): array
    {
        $dir = $this->workspace->newJobDir($label);
        $job['result'] = $dir . '/result.json';
        $job['work_dir'] = $dir;
        $job['constants'] = ($job['constants'] ?? []) + ['WP_DEBUG_LOG' => $dir . '/wp-debug.log'];

        file_put_contents($dir . '/job.json', json_encode($job, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));

        $harness = $this->workspace->harnessDir . '/wp';
        $command = [
            $this->php,
            '-d', 'disable_functions=' . self::DISABLED_FUNCTIONS,
            '-d', 'allow_url_fopen=0',
            $this->wpCli,
            '--path=' . $this->workspace->wpPath,
            '--require=' . $harness . '/bootstrap.php',
        ];

        if (!$proActive) {
            $command[] = '--skip-plugins=' . self::PRO_PLUGIN;
        }

        if ($user !== null && $user > 0) {
            $command[] = '--user=' . $user;
        }

        $command[] = 'eval-file';
        $command[] = $harness . '/run.php';

        $env = getenv();
        $env['SMOKE_JOB'] = $dir . '/job.json';

        $this->log->debug('run ' . $label);

        $process = proc_open($command, [0 => ['pipe', 'r'], 1 => ['file', $dir . '/stdout.txt', 'w'], 2 => ['file', $dir . '/stderr.txt', 'w']], $pipes, $this->workspace->wpPath, $env);

        if (!\is_resource($process)) {
            throw new RuntimeException('cannot start wp-cli');
        }

        fclose($pipes[0]);

        $deadline = microtime(true) + $this->timeout;
        $timedOut = false;

        while (true) {
            $status = proc_get_status($process);
            if (!$status['running']) {
                break;
            }
            if (microtime(true) > $deadline) {
                $timedOut = true;
                proc_terminate($process, 9);

                break;
            }
            usleep(20000);
        }

        $exitCode = $status['running'] ? -1 : (int) $status['exitcode'];
        proc_close($process);

        $result = null;
        if (is_readable($job['result'])) {
            $decoded = json_decode((string) file_get_contents($job['result']));
            $result = \is_object($decoded) ? $decoded : null;
        }

        $stderr = is_readable($dir . '/stderr.txt') ? (string) file_get_contents($dir . '/stderr.txt') : '';

        return ['exit_code' => $exitCode, 'result' => $result, 'stderr' => $stderr, 'timed_out' => $timedOut];
    }

    /**
     * Runs a read-only SQL statement through `wp db query`, which uses the mysql client and loads no plugins.
     *
     * @return list<list<string>>
     */
    public function sql(string $sql): array
    {
        $command = [$this->php, $this->wpCli, '--path=' . $this->workspace->wpPath, 'db', 'query', $sql, '--skip-column-names', '--batch'];
        $process = proc_open($command, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $this->workspace->wpPath);

        if (!\is_resource($process)) {
            throw new RuntimeException('cannot start wp db query');
        }

        fclose($pipes[0]);
        $out = (string) stream_get_contents($pipes[1]);
        $err = (string) stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);

        if (proc_close($process) !== 0) {
            throw new RuntimeException('wp db query failed: ' . trim($err));
        }

        $rows = [];
        foreach (preg_split('~\R~', trim($out)) as $line) {
            if ($line !== '') {
                $rows[] = explode("\t", $line);
            }
        }

        return $rows;
    }

    private static function which(string $binary): string
    {
        foreach (explode(PATH_SEPARATOR, (string) getenv('PATH')) as $dir) {
            $candidate = rtrim($dir, '/') . '/' . $binary;
            if (is_file($candidate) && is_executable($candidate)) {
                return realpath($candidate) ?: $candidate;
            }
        }

        return '';
    }
}
