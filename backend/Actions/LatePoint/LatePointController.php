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

    public function refreshAgents()
    {
        self::isExists();

        $response['agents'] = self::fetchRows(
            'LATEPOINT_TABLE_AGENTS',
            'latepoint_agents',
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

    private static function fetchRows($constant, $fallback, $mapper)
    {
        global $wpdb;

        if (!$wpdb) {
            return [];
        }

        $tableName = \defined($constant) ? \constant($constant) : $wpdb->prefix . $fallback;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Schema probe for an optional third party table.
        $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $tableName));

        if ($exists !== $tableName) {
            return [];
        }

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- Table name is verified above.
        $rows = $wpdb->get_results("SELECT * FROM {$tableName}", ARRAY_A);

        if (empty($rows)) {
            return [];
        }

        return array_map($mapper, $rows);
    }
}
