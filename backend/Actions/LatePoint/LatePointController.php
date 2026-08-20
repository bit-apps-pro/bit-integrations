<?php

/**
 * LatePoint Integration
 */

namespace BitApps\Integrations\Actions\LatePoint;

use WP_Error;

class LatePointController
{
    public static function isExists()
    {
        if (!class_exists('LatePoint')) {
            wp_send_json_error(
                __(
                    'LatePoint is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function latePointAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshAgents()
    {
        self::isExists();

        $response['agents'] = self::fetchRows(
            'LATEPOINT_TABLE_AGENTS',
            'latepoint_agents',
            ['id', 'first_name', 'last_name', 'email'],
            function ($row) {
                return (object) [
                    'value' => $row['id'],
                    'label' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: ($row['email'] ?? $row['id']),
                ];
            }
        );

        wp_send_json_success($response, 200);
    }

    public function refreshServices()
    {
        self::isExists();

        $response['services'] = self::fetchRows(
            'LATEPOINT_TABLE_SERVICES',
            'latepoint_services',
            ['id', 'name'],
            function ($row) {
                return (object) [
                    'value' => $row['id'],
                    'label' => $row['name'] ?? $row['id'],
                ];
            }
        );

        wp_send_json_success($response, 200);
    }

    public function refreshLocations()
    {
        self::isExists();

        $response['locations'] = self::fetchRows(
            'LATEPOINT_TABLE_LOCATIONS',
            'latepoint_locations',
            ['id', 'name'],
            function ($row) {
                return (object) [
                    'value' => $row['id'],
                    'label' => $row['name'] ?? $row['id'],
                ];
            }
        );

        wp_send_json_success($response, 200);
    }

    public function refreshBundles()
    {
        self::isExists();

        $response['bundles'] = self::fetchRows(
            'LATEPOINT_TABLE_BUNDLES',
            'latepoint_bundles',
            ['id', 'name'],
            function ($row) {
                return (object) [
                    'value' => $row['id'],
                    'label' => $row['name'] ?? $row['id'],
                ];
            }
        );

        wp_send_json_success($response, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    private static function fetchRows($constant, $fallback, array $columns, $mapper)
    {
        global $wpdb;

        if (!$wpdb) {
            return [];
        }

        $tableName = \defined($constant) ? \constant($constant) : $wpdb->prefix . $fallback;

        $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tableName));

        if ($exists !== $tableName) {
            return [];
        }

        $columnList = implode(', ', array_map('sanitize_key', $columns));

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table and column names are hardcoded literals verified above
        $rows = $wpdb->get_results("SELECT {$columnList} FROM {$tableName}", ARRAY_A);

        if (empty($rows)) {
            return [];
        }

        return array_map($mapper, $rows);
    }
}
