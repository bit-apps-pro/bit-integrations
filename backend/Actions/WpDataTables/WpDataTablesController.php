<?php

namespace BitApps\Integrations\Actions\WpDataTables;

use WP_Error;

class WpDataTablesController
{
    public static function isExists()
    {
        if (!class_exists('WDTConfigController')) {
            wp_send_json_error(
                __('wpDataTables is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function wpDataTablesGetTables()
    {
        self::isExists();

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $tables = $wpdb->get_results(
            "SELECT id, title FROM {$wpdb->prefix}wpdatatables ORDER BY id ASC",
            ARRAY_A
        );

        $options = array_map(static function ($table) {
            return ['label' => $table['title'], 'value' => (string) $table['id']];
        }, $tables ?? []);

        wp_send_json_success($options);
    }

    public static function wpDataTablesGetTableColumns($requestParams)
    {
        self::isExists();

        $tableId = $requestParams->table_id ?? null;

        if (empty($tableId) || !is_numeric($tableId)) {
            wp_send_json_error(__('Table ID is required', 'bit-integrations'), 400);
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $table = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT table_type, content FROM {$wpdb->prefix}wpdatatables WHERE id = %d",
                (int) $tableId
            ),
            ARRAY_A
        );

        if (empty($table)) {
            wp_send_json_error(__('Table not found', 'bit-integrations'), 404);
        }

        if ($table['table_type'] === 'manual') {
            wp_send_json_success(self::getManualTableColumns((int) $tableId));
        }

        $fields = [];
        $tableContent = json_decode($table['content'], true) ?? [];
        $columnLength = isset($tableContent['colNumber']) ? (int) $tableContent['colNumber'] : \count($tableContent['colHeaders'] ?? []);

        for ($i = 0; $i < $columnLength; $i++) {
            $fields[] = [
                'key'      => (string) $i,
                'label'    => $tableContent['colHeaders'][$i] ?? 'Column ' . ($i + 1),
                'required' => false,
            ];
        }

        wp_send_json_success($fields);
    }

    private static function getManualTableColumns($tableId)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $columns = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT orig_header, display_header FROM {$wpdb->prefix}wpdatatables_columns
                WHERE table_id = %d AND id_column = 0 AND column_type <> 'formula' AND orig_header NOT LIKE %s
                ORDER BY pos ASC",
                $tableId,
                $wpdb->esc_like('wdt_') . '%'
            ),
            ARRAY_A
        );

        return array_map(static function ($column) {
            return [
                'key'      => $column['orig_header'],
                'label'    => $column['display_header'] ?: $column['orig_header'],
                'required' => false,
            ];
        }, $columns ?? []);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
