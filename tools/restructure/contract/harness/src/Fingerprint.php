<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke;

final class Fingerprint
{
    public const HARD = ['btcbi_flow', 'btcbi_log', 'btcbi_connections', 'btcbi_auth'];

    public const SOFT = ['options', 'posts', 'postmeta', 'users', 'usermeta'];

    public function __construct(private WpRunner $runner)
    {
    }

    /**
     * @return array<string, array{rows: string, checksum: string, auto_increment: string}>
     */
    public function take(string $prefix): array
    {
        $wanted = array_map(static fn ($t) => $prefix . $t, [...self::HARD, ...self::SOFT]);
        $in = implode(',', array_map(static fn ($t) => "'" . addslashes($t) . "'", $wanted));

        $tables = array_column($this->runner->sql("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ({$in}) ORDER BY TABLE_NAME"), 0);

        if ($tables === []) {
            return [];
        }

        $quoted = implode(', ', array_map(static fn ($t) => '`' . str_replace('`', '``', $t) . '`', $tables));
        $prints = [];

        foreach ($this->runner->sql("CHECKSUM TABLE {$quoted} EXTENDED") as [$name, $checksum]) {
            $table = substr($name, strrpos($name, '.') + 1);
            $prints[$table]['checksum'] = $checksum;
        }

        $counts = implode(' UNION ALL ', array_map(static fn ($t) => "SELECT '" . addslashes($t) . "', COUNT(*) FROM `" . str_replace('`', '``', $t) . '`', $tables));
        foreach ($this->runner->sql($counts) as [$table, $rows]) {
            $prints[$table]['rows'] = $rows;
        }

        $tableList = implode(',', array_map(static fn ($t) => "'" . addslashes($t) . "'", $tables));
        foreach ($this->runner->sql("SET SESSION information_schema_stats_expiry = 0; SELECT TABLE_NAME, AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ({$tableList})") as [$table, $autoIncrement]) {
            $prints[$table]['auto_increment'] = $autoIncrement;
        }

        ksort($prints);

        return $prints;
    }

    public static function compare(array $before, array $after, string $prefix, Safety $safety, Log $log): void
    {
        $hard = array_map(static fn ($t) => $prefix . $t, self::HARD);

        foreach ($before as $table => $print) {
            $now = $after[$table] ?? null;
            $line = \sprintf('%s rows=%s checksum=%s auto_increment=%s', $table, $print['rows'] ?? '?', $print['checksum'] ?? '?', $print['auto_increment'] ?? '?');

            if ($now === $print) {
                $log->info('  db unchanged: ' . $line);

                continue;
            }

            $message = "{$table} changed during the run: before " . json_encode($print) . ' after ' . json_encode($now);

            if (\in_array($table, $hard, true)) {
                $safety->violation($message);
            } else {
                $safety->warning($message . ' (not written by this harness unless listed above; other processes may write it)');
            }
        }
    }
}
