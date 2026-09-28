<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke\Wp;

use mysqli;
use mysqli_result;
use RuntimeException;
use Throwable;

final class Probe
{
    private const LEGACY_HOOK_PREFIX = 'btcbi_';

    private const FORBIDDEN = '~^(COMMIT\b|ROLLBACK\b(?!\s+TO\b)|START\s+TRANSACTION\b|BEGIN\b|SET\s+(?:SESSION\s+|LOCAL\s+|@@SESSION\.|@@LOCAL\.|@@)?AUTOCOMMIT\b|SET\s+(?:GLOBAL|PERSIST|PERSIST_ONLY)\b|SET\s+@@(?:GLOBAL|PERSIST)\.|LOCK\s+TABLES?\b|UNLOCK\s+TABLES?\b|CREATE\s+(?!TEMPORARY\b)|ALTER\b|DROP\s+(?!TEMPORARY\b)|TRUNCATE\b|RENAME\b|GRANT\b|REVOKE\b|FLUSH\b|OPTIMIZE\b|ANALYZE\b|REPAIR\b|CHECK\s+TABLES?\b|LOAD\s+(?:DATA|XML|INDEX)\b|XA\b|INSTALL\b|UNINSTALL\b|CACHE\s+INDEX\b|RESET\b|PURGE\b|CHANGE\s+(?:MASTER|REPLICATION)\b|SET\s+PASSWORD\b|KILL\b|SHUTDOWN\b|IMPORT\b)~i';

    private const WRITE = '~^(INSERT|REPLACE|UPDATE|DELETE)\b(?:\s+(?:LOW_PRIORITY|DELAYED|HIGH_PRIORITY|QUICK|IGNORE))*\s+(?:(?:INTO|FROM)\s+)?(?:`?[\w$]+`?\.)?`?([\w$]+)`?~i';

    private static array $job = [];

    private static int $origin = 0;

    private static string $phase = 'load';

    private static bool $txStarted = false;

    private static ?mysqli $dbh = null;

    private static ?int $dbhId = null;

    private static bool $connectionChanged = false;

    private static array $engines = [];

    private static array $autoIncrement = [];

    private static array $requests = [];

    private static array $mails = [];

    private static array $hooks = [];

    private static array $blocked = [];

    private static array $writes = [];

    private static array $escapes = [];

    private static array $phpErrors = [];

    private static ?int $status = null;

    private static int $obBase = 0;

    private static ?array $exit = null;

    private static ?string $output = null;

    /**
     * @var null|callable
     */
    private static $collector;

    private static mixed $collected = null;

    private static mixed $payload = null;

    private static bool $measured = false;

    private static ?Scrub $scrub = null;

    private static string|false $previousErrorLog = false;

    private static bool $finished = false;

    public static function boot(): void
    {
        $jobPath = getenv('SMOKE_JOB');

        if (!\is_string($jobPath) || $jobPath === '' || !is_readable($jobPath)) {
            fwrite(STDERR, "smoke: SMOKE_JOB does not name a readable job file\n");

            exit(3);
        }

        self::$job = json_decode((string) file_get_contents($jobPath), true, 512, JSON_THROW_ON_ERROR);
        self::$origin = time();

        foreach (self::$job['constants'] ?? [] as $name => $value) {
            if (!\defined($name)) {
                \define($name, $value);
            }
        }

        foreach (['DISABLE_WP_CRON' => true, 'WP_HTTP_BLOCK_EXTERNAL' => true] as $name => $value) {
            if (!\defined($name)) {
                \define($name, $value);
            }
        }

        foreach (self::$job['superglobals'] ?? [] as $name => $values) {
            match ($name) {
                '_GET'    => $_GET = $values + $_GET,
                '_POST'   => $_POST = $values + $_POST,
                '_SERVER' => $_SERVER = $values + $_SERVER,
                default   => null,
            };
        }

        if (isset(self::$job['superglobals'])) {
            $_REQUEST = array_merge($_GET, $_POST);
        }

        self::seed('query', 'guardQuery', PHP_INT_MAX, 1);
        self::seed('pre_http_request', 'stubHttp', PHP_INT_MAX, 3);
        self::seed('http_api_curl', 'refuseTransport', PHP_INT_MIN, 1);
        self::seed('requests-requests.before_request', 'refuseTransport', PHP_INT_MIN, 1);
        self::seed('pre_wp_mail', 'stubMail', PHP_INT_MAX, 2);
        self::seed('random_password', 'stubPassword', PHP_INT_MAX, 2);

        register_shutdown_function([self::class, 'onShutdown']);
    }

    public static function job(): array
    {
        return self::$job;
    }

    public static function origin(): int
    {
        return self::$origin;
    }

    public static function phase(string $phase): void
    {
        if (self::$phase !== 'measure') {
            self::$phase = $phase;
        }
    }

    public static function scrub(): Scrub
    {
        if (self::$scrub === null) {
            $paths = [];
            if (\defined('ABSPATH')) {
                $paths[rtrim(ABSPATH, '/') . '/'] = '<abspath>/';
                $real = realpath(ABSPATH);
                if ($real !== false) {
                    $paths[rtrim($real, '/') . '/'] = '<abspath>/';
                }
            }
            if (!empty(self::$job['work_dir'])) {
                $paths[rtrim(self::$job['work_dir'], '/') . '/'] = '<work>/';
            }
            self::$scrub = new Scrub(self::$origin, $paths);
        }

        return self::$scrub;
    }

    public static function emit(mixed $payload): void
    {
        self::$payload = $payload;

        exit(0);
    }

    /**
     * The result file is written by the last shutdown function, after ROLLBACK.
     */
    public static function run(callable $measured, callable $collector): void
    {
        self::$collector = $collector;
        self::begin();

        try {
            $measured();
            self::$exit = ['kind' => 'returned'];
        } catch (HarnessExit $e) {
            self::$exit = self::dieExit($e);
        } catch (Throwable $e) {
            self::$exit = [
                'kind'    => 'throwable',
                'class'   => Scrub::classLabel(\get_class($e)),
                'message' => self::scrub()->message($e->getMessage()),
            ];
        }

        self::end();

        exit(0);
    }

    public static function dieHandler($message = '', $title = '', $args = []): void
    {
        if (self::$phase === 'measure') {
            throw new HarnessExit($message, $args);
        }
    }

    public static function captureStatus($header, $code = null)
    {
        if (self::$phase === 'measure' && $code !== null) {
            self::$status = (int) $code;
        }

        return $header;
    }

    public static function recordHook(...$args): void
    {
        if (self::$phase !== 'measure' || !isset($args[0]) || !\is_string($args[0])) {
            return;
        }

        $tag = $args[0];

        if (!str_starts_with($tag, self::freePrefix()) && !str_starts_with($tag, self::LEGACY_HOOK_PREFIX)) {
            return;
        }

        $params = \array_slice($args, 1);

        self::$hooks[] = [
            'name'     => $tag,
            'argc'     => \count($params),
            'args_sha' => self::scrub()->hash($params),
        ];
    }

    public static function onPhpError(int $errno, string $message, string $file = '', int $line = 0): bool
    {
        if (!(error_reporting() & $errno)) {
            return false;
        }

        self::$phpErrors[] = self::errorName($errno) . ': ' . self::scrub()->message($message);

        return true;
    }

    public static function guardQuery($query)
    {
        if (!\is_string($query) || $query === '') {
            return $query;
        }

        global $wpdb;

        $dbh = \is_object($wpdb) ? $wpdb->dbh : null;

        if (!self::$txStarted) {
            self::openTransaction($dbh);
        }

        $sql = ltrim((string) preg_replace('~^(?:\s+|/\*.*?\*/|(?:--|#)[^\n]*(?:\n|$))*~s', '', $query));

        if (preg_match(self::FORBIDDEN, $sql, $m)) {
            return self::block('statement', strtoupper((string) preg_replace('~\s+~', ' ', trim($m[1]))));
        }

        if (!preg_match(self::WRITE, $sql, $m)) {
            return $query;
        }

        $verb = strtoupper($m[1]);
        $table = $m[2];

        if (!$dbh instanceof mysqli || spl_object_id($dbh) !== self::$dbhId) {
            self::$connectionChanged = true;

            return self::block('reconnected', self::tableLabel($table));
        }

        $engine = self::$engines[strtolower($table)] ?? null;

        if ($engine !== null && strcasecmp($engine, 'InnoDB') !== 0) {
            return self::block('non-transactional ' . $engine, self::tableLabel($table));
        }

        if ($verb === 'INSERT' || $verb === 'REPLACE') {
            self::rememberAutoIncrement($table);
        }

        $label = self::tableLabel($table);
        self::$writes[self::$phase][$label][$verb] = (self::$writes[self::$phase][$label][$verb] ?? 0) + 1;

        return $query;
    }

    public static function stubHttp($preempt, $args, $url)
    {
        $args = \is_array($args) ? $args : [];
        $entry = self::describeRequest((string) $url, $args);

        if ($preempt !== false) {
            $entry['answer'] = 'preempted:' . (is_wp_error($preempt) ? 'WP_Error:' . $preempt->get_error_code() : get_debug_type($preempt));
            self::$requests[] = $entry;

            return $preempt;
        }

        [$answer, $status, $body, $headers] = self::answer($entry['method'], (string) $url, $args['body'] ?? null);

        $entry['answer'] = $answer;
        self::$requests[] = $entry;

        $headerBag = class_exists('\WpOrg\Requests\Utility\CaseInsensitiveDictionary')
            ? new \WpOrg\Requests\Utility\CaseInsensitiveDictionary($headers)
            : $headers;

        return [
            'headers'  => $headerBag,
            'body'     => $body,
            'response' => ['code' => $status, 'message' => get_status_header_desc($status)],
            'cookies'  => [],
            'filename' => null,
        ];
    }

    public static function refuseTransport(): void
    {
        self::$escapes[] = ['phase' => self::$phase, 'hook' => current_filter()];

        throw new RuntimeException('smoke: an outbound HTTP transport was reached and refused');
    }

    public static function stubMail($return, $atts)
    {
        $atts = \is_array($atts) ? $atts : [];
        $scrub = self::scrub();

        self::$mails[] = [
            'phase'       => self::$phase,
            'to_sha'      => $scrub->hash($atts['to'] ?? null),
            'subject'     => $scrub->text((string) ($atts['subject'] ?? '')),
            'message_sha' => $scrub->hash($atts['message'] ?? null),
            'headers_sha' => $scrub->hash($atts['headers'] ?? null),
            'attachments' => \count((array) ($atts['attachments'] ?? [])),
        ];

        return false;
    }

    public static function onShutdown(): void
    {
        if (self::$phase === 'measure') {
            $exit = ['kind' => 'exit'];
            $last = error_get_last();

            if (\is_array($last) && \in_array($last['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR], true)) {
                $exit = ['kind' => 'fatal', 'message' => self::scrub()->message((string) $last['message'])];
            }

            self::$exit = $exit;
            self::end();
        }

        register_shutdown_function([self::class, 'finish']);
    }

    public static function finish(): void
    {
        if (self::$finished) {
            return;
        }

        self::$finished = true;

        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        $rollback = self::rollback();
        $autoIncrement = $rollback === 'ok' ? self::restoreAutoIncrement() : [];

        $result = [
            'measured'  => self::$measured,
            'exit'      => self::$exit,
            'status'    => self::$status,
            'output'    => self::$output === null ? null : self::decodeOutput(self::$output),
            'requests'  => self::onlyPhase(self::$requests, 'measure'),
            'hooks'     => self::$hooks,
            'mails'     => self::onlyPhase(self::$mails, 'measure'),
            'collected' => self::$collected,
            'payload'   => self::$payload,
            'info'      => [
                'php_errors'     => self::$phpErrors,
                'error_log'      => self::errorLogLines(),
                'tables_written' => self::sortedWrites(self::$writes['measure'] ?? []),
                'blocked'        => self::onlyPhase(self::$blocked, 'measure'),
            ],
            'safety' => [
                'transaction'         => self::$txStarted,
                'rollback'            => $rollback,
                'connection_changed'  => self::$connectionChanged,
                'requests_by_phase'   => self::countByPhase(self::$requests),
                'unmeasured_requests' => self::unmeasured(self::$requests),
                'mails_by_phase'      => self::countByPhase(self::$mails),
                'escapes'             => self::$escapes,
                'blocked'             => self::$blocked,
                'writes'              => self::sortedWritesByPhase(self::$writes),
                'auto_increment'      => $autoIncrement,
            ],
        ];

        $path = self::$job['result'] ?? null;

        if (\is_string($path) && $path !== '') {
            file_put_contents($path, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_PRESERVE_ZERO_FRACTION));
        }
    }

    public static function freePrefix(): string
    {
        return class_exists('\BitApps\Integrations\Config') ? \BitApps\Integrations\Config::withPrefix('') : "\0";
    }

    public static function tableLabel(string $table): string
    {
        global $wpdb;

        $prefix = \is_object($wpdb) ? (string) $wpdb->base_prefix : '';

        return $prefix !== '' && str_starts_with($table, $prefix) ? '{prefix}' . substr($table, \strlen($prefix)) : $table;
    }

    public static function stubPassword($password, $length = 12): string
    {
        return substr(str_repeat('Smoke0', 43), 0, max(1, (int) $length));
    }

    private static function seed(string $hook, string $method, int $priority, int $args): void
    {
        $GLOBALS['wp_filter'][$hook][$priority][] = ['function' => [self::class, $method], 'accepted_args' => $args];
    }

    private static function begin(): void
    {
        self::$phase = 'measure';
        self::$measured = true;

        foreach (['wp_die_ajax_handler', 'wp_die_json_handler', 'wp_die_jsonp_handler', 'wp_die_xmlrpc_handler', 'wp_die_xml_handler', 'wp_die_handler'] as $filter) {
            add_filter($filter, static fn () => [self::class, 'dieHandler'], PHP_INT_MAX);
        }

        add_filter('status_header', [self::class, 'captureStatus'], PHP_INT_MAX, 2);
        add_action('all', [self::class, 'recordHook'], 10, 99);

        set_error_handler([self::class, 'onPhpError']);

        if (!empty(self::$job['work_dir'])) {
            self::$previousErrorLog = ini_set('error_log', self::$job['work_dir'] . '/error.log');
        }

        self::$obBase = ob_get_level();
        ob_start();
    }

    private static function end(): void
    {
        if (self::$phase !== 'measure') {
            return;
        }

        $output = '';
        while (ob_get_level() > self::$obBase) {
            $output = (string) ob_get_clean() . $output;
        }

        self::$output = $output;
        self::$phase = 'after';

        remove_action('all', [self::class, 'recordHook'], 10);
        restore_error_handler();

        if (self::$previousErrorLog !== false) {
            ini_set('error_log', (string) self::$previousErrorLog);
        }

        if (\is_callable(self::$collector)) {
            try {
                self::$collected = (self::$collector)();
            } catch (Throwable $e) {
                self::$collected = ['collector_error' => \get_class($e) . ': ' . self::scrub()->message($e->getMessage())];
            }
        }
    }

    private static function dieExit(HarnessExit $e): array
    {
        $message = $e->dieMessage;

        if (is_wp_error($message)) {
            $message = ['wp_error' => self::scrub()->value($message)];
        } elseif (\is_scalar($message) || $message === null) {
            $message = self::scrub()->text((string) $message);
        } else {
            $message = self::scrub()->value($message);
        }

        $args = \is_array($e->dieArgs) ? $e->dieArgs : [];

        return [
            'kind'     => 'wp_die',
            'message'  => $message,
            'response' => $args['response'] ?? null,
        ];
    }

    private static function openTransaction($dbh): void
    {
        if (!$dbh instanceof mysqli) {
            fwrite(STDERR, "smoke: wpdb is not using mysqli, refusing to run without a transaction\n");

            exit(3);
        }

        self::$dbh = $dbh;
        self::$dbhId = spl_object_id($dbh);

        if (!mysqli_query($dbh, 'SET SESSION autocommit = 0') || !mysqli_query($dbh, 'START TRANSACTION')) {
            fwrite(STDERR, 'smoke: could not open a transaction: ' . mysqli_error($dbh) . "\n");

            exit(3);
        }

        self::$txStarted = true;

        try {
            mysqli_query($dbh, 'SET SESSION information_schema_stats_expiry = 0');
        } catch (Throwable $e) {
        }

        $result = mysqli_query($dbh, 'SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()');

        if ($result instanceof mysqli_result) {
            while ($row = mysqli_fetch_row($result)) {
                self::$engines[strtolower((string) $row[0])] = $row[1];
            }
        }
    }

    private static function block(string $kind, string $what): string
    {
        self::$blocked[] = ['phase' => self::$phase, 'kind' => $kind, 'what' => $what];

        return '';
    }

    private static function rememberAutoIncrement(string $table): void
    {
        if (\array_key_exists($table, self::$autoIncrement)) {
            return;
        }

        self::$autoIncrement[$table] = self::readAutoIncrement($table);
    }

    private static function readAutoIncrement(string $table): ?int
    {
        $name = mysqli_real_escape_string(self::$dbh, $table);
        $result = mysqli_query(self::$dbh, "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{$name}'");
        $row = $result instanceof mysqli_result ? mysqli_fetch_row($result) : null;

        return isset($row[0]) ? (int) $row[0] : null;
    }

    private static function rollback(): string
    {
        if (!self::$txStarted || !self::$dbh instanceof mysqli) {
            return 'no-transaction';
        }

        try {
            return mysqli_query(self::$dbh, 'ROLLBACK') ? 'ok' : 'failed: ' . mysqli_error(self::$dbh);
        } catch (Throwable $e) {
            return 'failed: ' . $e->getMessage();
        }
    }

    private static function restoreAutoIncrement(): array
    {
        $report = [];

        if ((self::$job['restore_auto_increment'] ?? true) === false) {
            return $report;
        }

        ksort(self::$autoIncrement);

        mysqli_query(self::$dbh, 'SET SESSION lock_wait_timeout = 5');

        foreach (self::$autoIncrement as $table => $before) {
            if ($before === null) {
                continue;
            }

            $now = self::readAutoIncrement($table);

            if ($now === $before) {
                continue;
            }

            $escaped = str_replace('`', '``', $table);

            try {
                mysqli_query(self::$dbh, "ALTER TABLE `{$escaped}` AUTO_INCREMENT = {$before}");
            } catch (Throwable $e) {
            }

            $report[self::tableLabel($table)] = ['before' => $before, 'after_rollback' => $now, 'restored' => self::readAutoIncrement($table)];
        }

        return $report;
    }

    private static function describeRequest(string $url, array $args): array
    {
        $scrub = self::scrub();
        $headers = \is_array($args['headers'] ?? null) ? $args['headers'] : [];
        [$bodySha, $bodyKeys] = self::bodyDigest($args['body'] ?? null, $headers);

        return [
            'phase'     => self::$phase,
            'method'    => strtoupper((string) ($args['method'] ?? 'GET')),
            'url'       => self::displayUrl($url),
            'url_sha'   => substr(sha1($scrub->collapsed()->text($url)), 0, 16),
            'headers'   => self::headerDigest($headers),
            'body_sha'  => $bodySha,
            'body_keys' => $bodyKeys,
        ];
    }

    private static function displayUrl(string $url): string
    {
        $scrub = self::scrub();
        $parts = parse_url($url);

        if (!\is_array($parts) || empty($parts['host'])) {
            return $scrub->text($url);
        }

        $path = implode('/', array_map(
            static fn ($segment) => preg_match('~^[\w-]*:[\w-]{20,}$|^[\w-]{40,}$~', $segment) ? '<seg:' . substr(sha1($segment), 0, 8) . '>' : $segment,
            explode('/', $parts['path'] ?? '')
        ));

        $display = ($parts['scheme'] ?? 'http') . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '') . $path;

        if (isset($parts['query']) && $parts['query'] !== '') {
            $pairs = [];
            foreach (explode('&', $parts['query']) as $pair) {
                [$key, $value] = array_pad(explode('=', $pair, 2), 2, null);
                $clean = $scrub->value($value === null ? null : urldecode($value), urldecode((string) $key));
                $pairs[] = $key . ($value === null ? '' : '=' . (\is_string($clean) ? $clean : json_encode($clean)));
            }
            $display .= '?' . implode('&', $pairs);
        }

        return $scrub->text($display);
    }

    private static function headerDigest(array $headers): array
    {
        $scrub = self::scrub();
        $normalized = [];

        foreach ($headers as $name => $value) {
            $key = strtolower((string) $name);
            $value = \is_scalar($value) ? (string) $value : json_encode($value);
            if ($key === 'content-type') {
                $value = (string) preg_replace('~boundary="?[^\s;"]+"?~i', 'boundary=<boundary>', $value);
            }
            $normalized[$key] = $scrub->value($value, $key);
        }

        ksort($normalized);

        return ['names' => array_keys($normalized), 'sha' => $scrub->hash($normalized)];
    }

    private static function bodyDigest(mixed $body, array $headers): array
    {
        $scrub = self::scrub();

        if ($body === null || $body === '' || $body === []) {
            return [null, []];
        }

        if (\is_array($body) || \is_object($body)) {
            return [$scrub->hash($body), array_map('strval', array_keys((array) $body))];
        }

        $text = (string) $body;

        foreach ($headers as $name => $value) {
            if (strtolower((string) $name) === 'content-type' && \is_string($value) && preg_match('~boundary="?([^\s;"]+)"?~i', $value, $m)) {
                $text = str_replace($m[1], '<boundary>', $text);
            }
        }

        $decoded = json_decode($text);

        if (\is_array($decoded) || \is_object($decoded)) {
            return [$scrub->hash($decoded), array_map('strval', array_keys((array) $decoded))];
        }

        return [substr(sha1($scrub->collapsed()->text($text)), 0, 16), []];
    }

    private static function answer(string $method, string $url, mixed $body): array
    {
        $bodyText = \is_string($body) ? $body : (\is_array($body) ? http_build_query($body) . json_encode($body) : '');

        foreach (self::$job['http_fixtures'] ?? [] as $index => $rule) {
            $ruleMethod = strtoupper($rule['method'] ?? '*');

            if ($ruleMethod !== '*' && $ruleMethod !== $method) {
                continue;
            }

            if (!@preg_match($rule['url'], $url)) {
                continue;
            }

            if (isset($rule['body_contains']) && !str_contains($bodyText, (string) $rule['body_contains'])) {
                continue;
            }

            $responseBody = $rule['body'] ?? '';
            $responseBody = \is_string($responseBody) ? $responseBody : json_encode($responseBody, JSON_UNESCAPED_SLASHES);

            return [
                'fixture:' . ($rule['id'] ?? (string) $index),
                (int) ($rule['status'] ?? 200),
                $responseBody,
                ($rule['headers'] ?? []) + ['content-type' => 'application/json'],
            ];
        }

        return ['synthetic', 200, '{}', ['content-type' => 'application/json']];
    }

    private static function decodeOutput(string $output): array
    {
        $decoded = json_decode($output);

        if ($output !== '' && json_last_error() === JSON_ERROR_NONE) {
            return ['json' => self::scrub()->value($decoded)];
        }

        return ['text' => self::scrub()->text($output)];
    }

    private static function errorLogLines(): array
    {
        $path = (self::$job['work_dir'] ?? '') . '/error.log';

        if (empty(self::$job['work_dir']) || !is_readable($path)) {
            return [];
        }

        $lines = [];
        foreach (preg_split('~\R~', (string) file_get_contents($path)) as $line) {
            $line = (string) preg_replace('~^\[[^\]]+\]\s*~', '', $line);
            if ($line !== '') {
                $lines[] = self::scrub()->message($line);
            }
        }

        return $lines;
    }

    private static function onlyPhase(array $entries, string $phase): array
    {
        $out = [];
        foreach ($entries as $entry) {
            if (($entry['phase'] ?? null) === $phase) {
                unset($entry['phase']);
                $out[] = $entry;
            }
        }

        return $out;
    }

    private static function unmeasured(array $requests): array
    {
        $out = [];
        foreach ($requests as $request) {
            if ($request['phase'] !== 'measure') {
                $out[] = "{$request['phase']} {$request['method']} {$request['url']} -> {$request['answer']}";
            }
        }

        return $out;
    }

    private static function countByPhase(array $entries): array
    {
        $counts = [];
        foreach ($entries as $entry) {
            $counts[$entry['phase']] = ($counts[$entry['phase']] ?? 0) + 1;
        }
        ksort($counts);

        return $counts;
    }

    private static function sortedWrites(array $writes): array
    {
        ksort($writes);
        foreach ($writes as &$verbs) {
            ksort($verbs);
        }

        return $writes;
    }

    private static function sortedWritesByPhase(array $writes): array
    {
        ksort($writes);

        return array_map([self::class, 'sortedWrites'], $writes);
    }

    private static function errorName(int $errno): string
    {
        return match ($errno) {
            E_WARNING, E_USER_WARNING       => 'warning',
            E_NOTICE, E_USER_NOTICE         => 'notice',
            E_DEPRECATED, E_USER_DEPRECATED => 'deprecated',
            E_RECOVERABLE_ERROR             => 'recoverable',
            default                         => 'error' . $errno,
        };
    }
}
