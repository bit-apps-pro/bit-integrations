<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke\Wp;

final class Tables
{
    public static function flowTable(): string
    {
        global $wpdb;

        return $wpdb->prefix . 'btcbi_flow';
    }

    public static function logTable(): string
    {
        global $wpdb;

        return $wpdb->prefix . 'btcbi_log';
    }

    public static function connectionTable(): string
    {
        global $wpdb;

        return $wpdb->prefix . 'btcbi_connections';
    }

    /**
     * @return array<int, array<string, mixed>> id => row
     */
    public static function flowRows(): array
    {
        global $wpdb;

        $rows = [];
        foreach ((array) $wpdb->get_results('SELECT * FROM `' . self::flowTable() . '` ORDER BY id', ARRAY_A) as $row) {
            $rows[(int) $row['id']] = $row;
        }

        return $rows;
    }

    /**
     * @param array<int, array<string, mixed>> $before
     * @param array<int, array<string, mixed>> $after
     * @param array<int, string>               $labels id => label used instead of the id
     */
    public static function flowDiff(array $before, array $after, array $labels = []): array
    {
        $scrub = Probe::scrub();
        $diff = [];
        $ids = array_unique(array_merge(array_keys($before), array_keys($after)));
        sort($ids);

        foreach ($ids as $id) {
            $old = $before[$id] ?? null;
            $new = $after[$id] ?? null;

            if ($old === $new) {
                continue;
            }

            $entry = ['id' => $labels[$id] ?? $id];

            if ($old === null) {
                $entry['change'] = 'inserted';
                $entry['columns'] = self::rowColumns($new, $labels);
            } elseif ($new === null) {
                $entry['change'] = 'deleted';
            } else {
                $entry['change'] = 'updated';
                $entry['columns'] = [];
                foreach ($new as $column => $value) {
                    if (($old[$column] ?? null) === $value) {
                        continue;
                    }
                    $entry['columns'][$column] = $column === 'flow_details'
                        ? self::detailsDiff((string) ($old[$column] ?? ''), (string) $value)
                        : ['old' => $scrub->value($old[$column] ?? null, $column), 'new' => $scrub->value($value, $column)];
                }
                ksort($entry['columns']);
            }

            $diff[] = $entry;
        }

        return $diff;
    }

    public static function logState(): array
    {
        global $wpdb;

        $row = $wpdb->get_row(
            "SELECT COUNT(*) AS n, COALESCE(MAX(id), 0) AS max_id, COALESCE(BIT_XOR(CRC32(CONCAT_WS('|', id, flow_id, job_id, api_type, response_type, response_obj, field_data, parent_id, created_at))), 0) AS crc FROM `" . self::logTable() . '`',
            ARRAY_A
        );

        return ['count' => (int) ($row['n'] ?? 0), 'max_id' => (int) ($row['max_id'] ?? 0), 'crc' => (string) ($row['crc'] ?? '')];
    }

    public static function existingLogState(int $maxId): array
    {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT COUNT(*) AS n, COALESCE(BIT_XOR(CRC32(CONCAT_WS('|', id, flow_id, job_id, api_type, response_type, response_obj, field_data, parent_id, created_at))), 0) AS crc FROM `" . self::logTable() . '` WHERE id <= %d',
                $maxId
            ),
            ARRAY_A
        );

        return ['count' => (int) ($row['n'] ?? 0), 'crc' => (string) ($row['crc'] ?? '')];
    }

    /**
     * @param array<int, string> $flowLabels
     */
    public static function newLogRows(int $afterId, array $flowLabels = []): array
    {
        global $wpdb;

        $scrub = Probe::scrub();
        $rows = (array) $wpdb->get_results(
            $wpdb->prepare('SELECT * FROM `' . self::logTable() . '` WHERE id > %d ORDER BY id', $afterId),
            ARRAY_A
        );

        $out = [];
        foreach ($rows as $row) {
            $flowId = (int) $row['flow_id'];
            $out[] = [
                'flow_id'        => $flowLabels[$flowId] ?? $flowId,
                'job_id'         => $row['job_id'] ?? null,
                'api_type'       => self::jsonOrText($row['api_type'] ?? null),
                'response_type'  => $row['response_type'] ?? null,
                'response_obj'   => self::jsonOrText($row['response_obj'] ?? null),
                'field_data_sha' => empty($row['field_data']) ? null : $scrub->hash(json_decode((string) $row['field_data'], true) ?? $row['field_data']),
                'parent_id'      => $row['parent_id'] ?? null,
                'created_at'     => $scrub->value($row['created_at'] ?? null),
            ];
        }

        return $out;
    }

    private static function rowColumns(array $row, array $labels): array
    {
        $scrub = Probe::scrub();
        $out = [];
        foreach ($row as $column => $value) {
            if ($column === 'id') {
                continue;
            }
            $out[$column] = $column === 'flow_details'
                ? $scrub->value(json_decode((string) $value))
                : $scrub->value($value, $column);
        }
        ksort($out);

        return $out;
    }

    private static function detailsDiff(string $old, string $new): array
    {
        $scrub = Probe::scrub();
        $a = json_decode($old, true);
        $b = json_decode($new, true);

        if (!\is_array($a) || !\is_array($b)) {
            return ['old' => $scrub->value($old, 'flow_details'), 'new' => $scrub->value($new, 'flow_details')];
        }

        $keys = array_unique(array_merge(array_keys($a), array_keys($b)));
        sort($keys);
        $changed = [];

        foreach ($keys as $key) {
            if (($a[$key] ?? null) === ($b[$key] ?? null) && \array_key_exists($key, $a) === \array_key_exists($key, $b)) {
                continue;
            }
            $changed[$key] = [
                'old' => \array_key_exists($key, $a) ? $scrub->value($a[$key], (string) $key) : '<absent>',
                'new' => \array_key_exists($key, $b) ? $scrub->value($b[$key], (string) $key) : '<absent>',
            ];
        }

        return $changed;
    }

    private static function jsonOrText(?string $value): mixed
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value);

        return Probe::scrub()->value(json_last_error() === JSON_ERROR_NONE ? $decoded : $value);
    }
}
