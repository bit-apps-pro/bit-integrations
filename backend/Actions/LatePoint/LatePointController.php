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

    private static function fetchRows($table, $mapper)
    {
        global $wpdb;

        if (!$wpdb || !self::tableExists($table)) {
            return [];
        }

        switch ($table) {
            case 'latepoint_agents':
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $rows = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}latepoint_agents", ARRAY_A);

                break;

            case 'latepoint_services':
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $rows = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}latepoint_services", ARRAY_A);

                break;

            case 'latepoint_locations':
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $rows = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}latepoint_locations", ARRAY_A);

                break;

            case 'latepoint_bundles':
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $rows = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}latepoint_bundles", ARRAY_A);

                break;

            default:
                return [];
        }

        if (empty($rows)) {
            return [];
        }

        return array_map($mapper, $rows);
    }

    private static function tableExists($table)
    {
        global $wpdb;

        $tableName = $wpdb->prefix . $table;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $found = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($tableName)));

        return $found === $tableName;
    }
}
