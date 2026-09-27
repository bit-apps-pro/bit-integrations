<?php

declare(strict_types=1);

namespace BitApps\Restructure\Contract\Smoke\Wp;

use BitApps\Integrations\Config;
use BitApps\Integrations\Flow\Flow;
use Throwable;

final class Runners
{
    private const PAST = 1500000000;

    private const EXPIRY_KEYS = ['generated_at', 'generates_on', 'created_at', 'issued_at', 'expires', 'expires_at', 'expire_at', 'expiry', 'expired_at'];

    public static function dispatch(): void
    {
        $kind = (string) (Probe::job()['kind'] ?? '');

        match ($kind) {
            'discover' => self::discover(),
            'route'    => self::route(),
            'flow'     => self::flow(),
            default    => Probe::emit(['error' => "unknown job kind '{$kind}'"]),
        };
    }

    private static function discover(): void
    {
        global $wpdb;

        Probe::phase('setup');
        $job = Probe::job();

        $admins = get_users(['role' => 'administrator', 'orderby' => 'ID', 'order' => 'ASC', 'number' => 1, 'fields' => 'ID']);

        $auth = [];
        foreach ($job['auth_candidates'] ?? [] as $integration => $candidates) {
            $auth[$integration] = self::authConfig($candidates);
        }

        $connections = [];
        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', Tables::connectionTable()))) {
            foreach ((array) $wpdb->get_results('SELECT id, app_slug, auth_type, status FROM `' . Tables::connectionTable() . '` ORDER BY id', ARRAY_A) as $row) {
                $connections[] = ['id' => (int) $row['id'], 'app_slug' => (string) $row['app_slug'], 'auth_type' => (string) $row['auth_type'], 'status' => (int) $row['status']];
            }
        }

        $flows = [];
        foreach ((array) $wpdb->get_results('SELECT id, triggered_entity, status, flow_details FROM `' . Tables::flowTable() . '` ORDER BY id', ARRAY_A) as $row) {
            $details = json_decode((string) $row['flow_details'], true);
            $details = \is_array($details) ? $details : [];
            $flows[] = [
                'id'               => (int) $row['id'],
                'triggered_entity' => (string) $row['triggered_entity'],
                'status'           => (int) $row['status'],
                'type'             => isset($details['type']) && \is_scalar($details['type']) ? (string) $details['type'] : null,
                'connection_id'    => isset($details['connection_id']) ? (int) $details['connection_id'] : null,
                'has_token'        => isset($details['tokenDetails']) && \is_array($details['tokenDetails']),
            ];
        }

        Probe::emit([
            'var_prefix'   => Config::VAR_PREFIX,
            'table_prefix' => $wpdb->prefix,
            'admin_id'     => isset($admins[0]) ? (int) $admins[0] : 0,
            'pro_loaded'   => class_exists('BitApps\IntegrationsPro\Config'),
            'free_version' => Config::VERSION,
            'auth'         => $auth,
            'connections'  => $connections,
            'flows'        => $flows,
        ]);
    }

    private static function route(): void
    {
        Probe::phase('setup');
        $job = Probe::job();

        wp_set_current_user((int) $job['user_id']);

        $nonce = wp_create_nonce(Config::withPrefix('nonce'));

        if (($job['http_method'] ?? 'POST') === 'GET') {
            $_GET['_ajax_nonce'] = $nonce;
        } else {
            $_POST['_ajax_nonce'] = $nonce;
        }

        $_REQUEST['_ajax_nonce'] = $nonce;

        require_once ABSPATH . 'wp-admin/includes/admin.php';
        require_once ABSPATH . 'wp-admin/includes/ajax-actions.php';

        try {
            do_action('admin_init');
        } catch (Throwable $e) {
            Probe::emit(['setup_error' => 'admin_init: ' . \get_class($e) . ': ' . Probe::scrub()->message($e->getMessage())]);
        }

        $hook = 'wp_ajax_' . (string) ($_REQUEST['action'] ?? '');
        $registered = has_action($hook) !== false;
        $flowsBefore = Tables::flowRows();

        Probe::run(
            static function () use ($hook, $registered) {
                if (!$registered) {
                    wp_die('0', 400);
                }

                do_action($hook);

                wp_die('0');
            },
            static fn () => [
                'registered'  => $registered,
                'flow_writes' => Tables::flowDiff($flowsBefore, Tables::flowRows()),
            ]
        );
    }

    private static function flow(): void
    {
        global $wpdb;

        Probe::phase('setup');
        $job = Probe::job();

        if (!empty($job['user_id'])) {
            wp_set_current_user((int) $job['user_id']);
        }

        $labels = [];

        if (isset($job['fixture'])) {
            $fixture = $job['fixture'];
            $inserted = $wpdb->insert(Tables::flowTable(), [
                'name'                => (string) ($fixture['name'] ?? 'smoke fixture'),
                'triggered_entity'    => (string) ($fixture['triggered_entity'] ?? 'Smoke'),
                'triggered_entity_id' => (string) ($fixture['triggered_entity_id'] ?? '1'),
                'flow_details'        => wp_json_encode($fixture['flow_details']),
                'status'              => 1,
                'user_id'             => (int) ($job['user_id'] ?? 0),
                'created_at'          => '2024-01-01 00:00:00',
                'updated_at'          => '2024-01-01 00:00:00',
            ]);

            if (!$inserted) {
                Probe::emit(['setup_error' => 'could not insert the fixture flow: ' . $wpdb->last_error]);
            }

            $flowId = (int) $wpdb->insert_id;
            $labels[$flowId] = '<fixture>';
            Probe::scrub()->alias($flowId, '<fixture>');
        } else {
            $flowId = (int) $job['flow_id'];
        }

        $row = $wpdb->get_row($wpdb->prepare('SELECT id, name, triggered_entity, triggered_entity_id, flow_details FROM `' . Tables::flowTable() . '` WHERE id = %d', $flowId));

        if (!\is_object($row)) {
            Probe::emit(['setup_error' => "flow {$flowId} not found"]);
        }

        $input = ['flow_details_sha' => substr(sha1((string) $row->flow_details), 0, 16)];

        [$fieldData, $source] = self::fieldData($row, $job);
        $input['field_source'] = $source;
        $input['field_data_sha'] = substr(sha1((string) wp_json_encode($fieldData)), 0, 16);

        $expiry = empty($job['force_expiry']) ? null : self::forceExpiry($row);

        $flowsBefore = Tables::flowRows();
        $logBefore = Tables::logState();

        Probe::run(
            static function () use ($row, $fieldData) {
                Flow::execute($row->triggered_entity, $row->triggered_entity_id, $fieldData, [$row]);
            },
            static function () use ($flowsBefore, $logBefore, $labels, $input, $expiry, $flowId) {
                $flowsAfter = Tables::flowRows();
                $existing = Tables::existingLogState($logBefore['max_id']);

                return [
                    'input'                 => $input,
                    'flow_writes'           => Tables::flowDiff($flowsBefore, $flowsAfter, $labels),
                    'log_rows'              => Tables::newLogRows($logBefore['max_id'], $labels),
                    'existing_logs_changed' => $existing['count'] !== $logBefore['count'] || $existing['crc'] !== $logBefore['crc'],
                    't1'                    => $expiry === null ? null : self::expiryVerdict($expiry, $flowId, $flowsAfter),
                ];
            }
        );
    }

    private static function authConfig(array $candidates): ?array
    {
        foreach ($candidates as $class) {
            try {
                if (!class_exists($class) || !property_exists($class, 'authConfig') || !\is_array($class::$authConfig)) {
                    continue;
                }
            } catch (Throwable $e) {
                continue;
            }

            $config = $class::$authConfig;
            $fields = [];
            foreach ($config['fields'] ?? [] as $key => $value) {
                $fields[] = $key === '__object' ? (string) $value[0] : (string) $key;
            }

            return [
                'owner'   => $class,
                'slug'    => (string) ($config['slug'] ?? ''),
                'aliases' => array_values(array_map('strval', $config['aliases'] ?? [])),
                'fields'  => $fields,
            ];
        }

        return null;
    }

    private static function fieldData(object $row, array $job): array
    {
        global $wpdb;

        if (isset($job['field_data']) && \is_array($job['field_data'])) {
            return [$job['field_data'], 'fixture'];
        }

        $logId = isset($job['field_log_id']) ? (int) $job['field_log_id'] : 0;

        if ($logId > 0) {
            $log = $wpdb->get_row($wpdb->prepare('SELECT id, field_data FROM `' . Tables::logTable() . '` WHERE id = %d AND flow_id = %d', $logId, (int) $row->id));
        } elseif (!isset($job['field_log_id'])) {
            $log = $wpdb->get_row($wpdb->prepare('SELECT id, field_data FROM `' . Tables::logTable() . "` WHERE flow_id = %d AND field_data IS NOT NULL AND field_data <> '' ORDER BY id DESC LIMIT 1", (int) $row->id));
        } else {
            $log = null;
        }

        if (\is_object($log) && !empty($log->field_data)) {
            $decoded = json_decode((string) $log->field_data, true);

            if (\is_array($decoded)) {
                return [$decoded, 'log#' . (int) $log->id];
            }
        }

        if ($logId > 0) {
            Probe::emit(['setup_error' => "log row {$logId} with field data for flow {$row->id} is gone"]);
        }

        $keys = [];
        self::collectFormFields(json_decode((string) $row->flow_details, true), $keys);
        ksort($keys);

        $data = [];
        foreach (array_keys($keys) as $key) {
            $data[$key] = self::sampleValue((string) $key);
        }

        return [$data, 'field_map'];
    }

    private static function collectFormFields(mixed $node, array &$keys): void
    {
        if (!\is_array($node)) {
            return;
        }

        foreach ($node as $key => $value) {
            if (($key === 'formField' || $key === 'formFields') && \is_scalar($value) && $value !== '' && $value !== 'custom') {
                $keys[(string) $value] = true;
            } elseif (\is_array($value)) {
                self::collectFormFields($value, $keys);
            }
        }
    }

    private static function sampleValue(string $key): string
    {
        $lower = strtolower($key);

        return match (true) {
            str_contains($lower, 'email')                                               => 'smoke@example.com',
            str_contains($lower, 'phone') || str_contains($lower, 'mobile')             => '+15555550100',
            str_contains($lower, 'date') || str_contains($lower, 'birth')               => '2024-01-15',
            str_contains($lower, 'url') || str_contains($lower, 'website')              => 'https://example.com/smoke',
            (bool) preg_match('~amount|price|qty|quantity|count|total|number~', $lower) => '10',
            str_contains($lower, 'name')                                                => 'Smoke Name',
            default                                                                     => 'smoke ' . $key,
        };
    }

    private static function forceExpiry(object $row): array
    {
        global $wpdb;

        $details = json_decode((string) $row->flow_details);
        $forced = ['flow_token' => false, 'connection' => null, 'keys' => []];

        if (\is_object($details) && isset($details->tokenDetails) && \is_object($details->tokenDetails)) {
            foreach (self::EXPIRY_KEYS as $key) {
                if (isset($details->tokenDetails->{$key}) && is_numeric($details->tokenDetails->{$key})) {
                    $details->tokenDetails->{$key} = (float) $details->tokenDetails->{$key} > 1e12 ? self::PAST * 1000 : self::PAST;
                    $forced['keys'][] = "tokenDetails.{$key}";
                }
            }

            if ($forced['keys'] !== []) {
                $row->flow_details = wp_json_encode($details);
                $wpdb->update(Tables::flowTable(), ['flow_details' => $row->flow_details], ['id' => (int) $row->id]);
                $forced['flow_token'] = true;
                $forced['flow_token_sha'] = sha1((string) wp_json_encode($details->tokenDetails));
            }
        }

        $connectionId = \is_object($details) && isset($details->connection_id) ? (int) $details->connection_id : 0;

        if ($connectionId > 0) {
            $auth = $wpdb->get_var($wpdb->prepare('SELECT auth_details FROM `' . Tables::connectionTable() . '` WHERE id = %d', $connectionId));
            $decoded = json_decode((string) $auth, true);

            if (\is_array($decoded)) {
                $touched = false;
                foreach (self::EXPIRY_KEYS as $key) {
                    if (isset($decoded[$key]) && is_numeric($decoded[$key])) {
                        $decoded[$key] = self::PAST;
                        $forced['keys'][] = "connection.{$key}";
                        $touched = true;
                    }
                }

                if ($touched) {
                    $encoded = (string) wp_json_encode($decoded);
                    $wpdb->update(Tables::connectionTable(), ['auth_details' => $encoded], ['id' => $connectionId]);
                    $forced['connection'] = $connectionId;
                    $forced['connection_sha'] = sha1($encoded);
                }
            }
        }

        return $forced;
    }

    private static function expiryVerdict(array $forced, int $flowId, array $flowsAfter): array
    {
        global $wpdb;

        $verdict = ['forced' => $forced['keys'], 'write_back' => []];

        if ($forced['flow_token']) {
            $after = json_decode((string) ($flowsAfter[$flowId]['flow_details'] ?? ''));
            $token = \is_object($after) && isset($after->tokenDetails) ? sha1((string) wp_json_encode($after->tokenDetails)) : null;
            $verdict['write_back']['flow_details'] = $token !== null && $token !== $forced['flow_token_sha'];
        }

        if ($forced['connection'] !== null) {
            $auth = (string) $wpdb->get_var($wpdb->prepare('SELECT auth_details FROM `' . Tables::connectionTable() . '` WHERE id = %d', $forced['connection']));
            $verdict['write_back']['connection'] = sha1($auth) !== $forced['connection_sha'];
        }

        if ($verdict['write_back'] === []) {
            $verdict['pass'] = false;
            $verdict['reason'] = 'nothing to expire: no numeric expiry key in tokenDetails or the connection';
        } else {
            $verdict['pass'] = \in_array(true, $verdict['write_back'], true);
        }

        return $verdict;
    }
}
