<?php

/**
 * NinjaTables Integration
 */

namespace BitApps\Integrations\Actions\NinjaTables;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Post;
use WP_Error;

/**
 * Provide functionality for NinjaTables integration
 */
class NinjaTablesController
{
    private const POST_TYPE = 'ninja-table';

    private const POST_STATUS = 'publish';

    private const META_KEY_COLUMNS = '_ninja_table_columns';

    private const TABLE_NAME_ITEMS = 'ninja_table_items';

    private const CACHE_GROUP = Config::VAR_PREFIX;

    /**
     * Check if Ninja Tables plugin is installed and activated
     *
     * @return bool
     */
    public static function isExists()
    {
        if (!\defined('NINJA_TABLES_VERSION')) {
            wp_send_json_error(
                __('Ninja Tables is not activated or not installed', 'bit-integrations'),
                400
            );
        }

        return true;
    }

    /**
     * Get all published Ninja Tables
     *
     * @return void
     */
    public function refreshTables()
    {
        self::isExists();

        $tables = $this->fetchAllTables();
        $formattedTables = $this->formatTables($tables);

        wp_send_json_success(['tables' => $formattedTables], 200);
    }

    /**
     * Get rows for a specific table
     *
     * @param object $requestParams Request parameters
     *
     * @return void
     */
    public function refreshRows($requestParams)
    {
        self::isExists();

        $tableId = $this->validateAndGetTableId($requestParams);
        $rows = $this->fetchTableRows($tableId);
        $formattedRows = $this->formatRows($rows);

        wp_send_json_success(['rows' => $formattedRows], 200);
    }

    /**
     * Get all WordPress users
     *
     * @return void
     */
    public function refreshUsers()
    {
        self::isExists();

        $users = $this->fetchUsers();
        $formattedUsers = $this->formatUsers($users);

        wp_send_json_success(['users' => $formattedUsers], 200);
    }

    /**
     * Get columns for a specific table
     *
     * @param object $requestParams Request parameters
     *
     * @return void
     */
    public function refreshColumns($requestParams)
    {
        self::isExists();

        $tableId = $this->validateAndGetTableId($requestParams);
        $columns = $this->fetchTableColumns($tableId);
        $formattedColumns = $this->formatColumns($columns);

        wp_send_json_success(['columns' => $formattedColumns], 200);
    }

    /**
     * Execute the integration
     *
     * @param object $integrationData Integration data
     * @param array  $fieldValues     Field values
     *
     * @return mixed
     */
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integrationData->id);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    /**
     * Fetch all Ninja Tables from database
     *
     * @return array
     */
    private function fetchAllTables()
    {
        $cache_key = Config::withPrefix('ninjatables_tables');
        $tables = wp_cache_get($cache_key, self::CACHE_GROUP);

        if (false === $tables) {
            $tables = Post::all(
                [
                    'post_type'      => self::POST_TYPE,
                    'post_status'    => self::POST_STATUS,
                    'orderby'        => 'title',
                    'order'          => 'ASC',
                    'posts_per_page' => -1,
                ]
            );

            wp_cache_set($cache_key, $tables, self::CACHE_GROUP, 10 * MINUTE_IN_SECONDS);
        }

        return $tables ?? [];
    }

    /**
     * Format tables data for response
     *
     * @param array $tables Raw table data
     *
     * @return array
     */
    private function formatTables(array $tables)
    {
        return array_map([$this, 'formatTableItem'], $tables);
    }

    /**
     * Format single table item
     *
     * @param object|array $table Table data
     *
     * @return object
     */
    private function formatTableItem($table)
    {
        $table_id = \is_object($table) ? ($table->ID ?? '') : ($table['ID'] ?? '');
        $table_name = \is_object($table) ? ($table->post_title ?? '') : ($table['post_title'] ?? '');

        return (object) [
            'table_id'   => $table_id,
            'table_name' => $table_name,
        ];
    }

    /**
     * Validate request parameters and get table ID
     *
     * @param object $requestParams Request parameters
     *
     * @return int
     */
    private function validateAndGetTableId($requestParams)
    {
        if (empty($requestParams->table_id)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $tableId = absint($requestParams->table_id);

        if (empty($tableId)) {
            wp_send_json_error(__('Table ID is required', 'bit-integrations'), 400);
        }

        return $tableId;
    }

    /**
     * Fetch rows for a specific table
     *
     * @param int $tableId Table ID
     *
     * @return array
     */
    private function fetchTableRows($tableId)
    {
        global $wpdb;

        $cache_key = Config::withPrefix('ninjatables_rows_' . $tableId);
        $rows = wp_cache_get($cache_key, self::CACHE_GROUP);

        if (false !== $rows) {
            return $rows;
        }

        $table_name = esc_sql($wpdb->prefix . self::TABLE_NAME_ITEMS);

        $query = 'SELECT id, table_id, owner_id FROM ' . $table_name . ' WHERE table_id = %d ORDER BY id DESC';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter -- Dynamic plugin table name is runtime-derived from the WordPress prefix.
        $rows = $wpdb->get_results($wpdb->prepare($query, $tableId), ARRAY_A) ?? [];

        wp_cache_set($cache_key, $rows, self::CACHE_GROUP, 10 * MINUTE_IN_SECONDS);

        return $rows;
    }

    /**
     * Format rows data for response
     *
     * @param array $rows Raw rows data
     *
     * @return array
     */
    private function formatRows(array $rows)
    {
        return array_map([$this, 'formatRowItem'], $rows);
    }

    /**
     * Format single row item
     *
     * @param array $row Row data
     *
     * @return object
     */
    private function formatRowItem(array $row)
    {
        return (object) [
            'row_id'   => $row['id'] ?? '',
            'row_name' => 'Row #' . ($row['id'] ?? ''),
        ];
    }

    /**
     * Fetch WordPress users
     *
     * @return array
     */
    private function fetchUsers()
    {
        return get_users(['fields' => ['ID', 'display_name', 'user_email']]) ?? [];
    }

    /**
     * Format users data for response
     *
     * @param array $users Raw users data
     *
     * @return array
     */
    private function formatUsers(array $users)
    {
        return array_map([$this, 'formatUserItem'], $users);
    }

    /**
     * Format single user item
     *
     * @param object $user User data
     *
     * @return object
     */
    private function formatUserItem($user)
    {
        return (object) [
            'user_id'   => $user->ID,
            'user_name' => $user->display_name . ' (' . $user->user_email . ')',
        ];
    }

    /**
     * Fetch columns for a specific table
     *
     * @param int $tableId Table ID
     *
     * @return array
     */
    private function fetchTableColumns($tableId)
    {
        $cache_key = Config::withPrefix('ninjatables_columns_' . $tableId);
        $columns = wp_cache_get($cache_key, self::CACHE_GROUP);

        if (false !== $columns) {
            return $columns;
        }

        $columns = get_post_meta($tableId, self::META_KEY_COLUMNS, true);

        if (empty($columns)) {
            return [];
        }

        $columns = \is_array($columns) ? $columns : [];

        wp_cache_set($cache_key, $columns, self::CACHE_GROUP, 10 * MINUTE_IN_SECONDS);

        return $columns;
    }

    /**
     * Format columns data for response
     *
     * @param array $columns Raw columns data
     *
     * @return array
     */
    private function formatColumns(array $columns)
    {
        return array_map([$this, 'formatColumnItem'], $columns);
    }

    /**
     * Format single column item
     *
     * @param array $column Column data
     *
     * @return object
     */
    private function formatColumnItem(array $column)
    {
        return (object) [
            'key'  => $column['key'] ?? '',
            'name' => $column['name'] ?? '',
            'type' => $column['data_type'] ?? 'text',
        ];
    }
}
