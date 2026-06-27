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

    public static function wpDataTablesAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
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
                "SELECT content FROM {$wpdb->prefix}wpdatatables WHERE id = %d",
                (int) $tableId
            ),
            ARRAY_A
        );

        if (empty($table)) {
            wp_send_json_error(__('Table not found', 'bit-integrations'), 404);
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
