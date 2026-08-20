<?php

/**
 * Class For Database Migration
 *
 * @category Database
 *
 * @author   BitApps Developer <developer@bitcode.pro>
 */

namespace BitApps\Integrations\Core\Database;

use BitApps\Integrations\Config;

final class DB
{
    public static function migrate()
    {
        global $wpdb;
        $collate = '';

        if ($wpdb->has_cap('collation')) {
            if (!empty($wpdb->charset)) {
                $collate .= "DEFAULT CHARACTER SET {$wpdb->charset}";
            }
            if (!empty($wpdb->collate)) {
                $collate .= " COLLATE {$wpdb->collate}";
            }
        }
        $table_schema = [
            "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}btcbi_log` (
                `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                `flow_id` bigint(20) DEFAULT NULL,
                `job_id` bigint(20) DEFAULT NULL,
                `api_type` varchar(255) DEFAULT NULL,
                `response_type` varchar(50) DEFAULT NULL,
                `response_obj` LONGTEXT DEFAULT NULL,
                `field_data` LONGTEXT DEFAULT NULL,
                `parent_id` bigint(20) DEFAULT NULL,
                `created_at` DATETIME NOT NULL,
                PRIMARY KEY (`id`),
                KEY `flow_id` (`flow_id`),
                KEY `parent_id` (`parent_id`)
            ) {$collate};",

            "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}btcbi_flow` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `name` varchar(255) DEFAULT NULL,
                `triggered_entity` varchar(50)  NOT NULL,
                `triggered_entity_id` varchar(100) DEFAULT NULL, /* form_id = 0 means all/app */
                `flow_details` longtext DEFAULT NULL,
                `status` tinyint(1) DEFAULT 1,/* 0 disabled, 1 enabled,  2 trashed */
                `user_id` bigint(20) unsigned DEFAULT NULL,
                `user_ip` int(11) unsigned DEFAULT NULL,
                `created_at` datetime DEFAULT NULL,
                `updated_at` datetime DEFAULT NULL,
                PRIMARY KEY (`id`)
            ) {$collate};",

            "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}btcbi_connections` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `app_slug` varchar(191) NOT NULL,
                `auth_type` varchar(50) NOT NULL DEFAULT 'oauth2',
                `connection_name` varchar(255) DEFAULT NULL,
                `account_name` varchar(255) DEFAULT NULL,
                `encrypt_keys` text DEFAULT NULL,
                `auth_details` longtext DEFAULT NULL,
                `status` tinyint(1) DEFAULT 1,
                `user_id` bigint(20) unsigned DEFAULT NULL,
                `created_at` datetime DEFAULT NULL,
                `updated_at` datetime DEFAULT NULL,
                PRIMARY KEY (`id`),
                KEY `app_slug` (`app_slug`),
                KEY `account_name` (`account_name`),
                KEY `status` (`status`)
            ) {$collate};"
        ];

        include_once ABSPATH . 'wp-admin/includes/upgrade.php';
        foreach ($table_schema as $table) {
            dbDelta($table);
        }

        self::addFieldDataColumn();
        self::addParentIdColumn();
        self::addParentIdIndex();

        if (self::logColumnsExist()) {
            Config::updateOption('log_columns_ready', '2');
        }

        update_option(
            'btcbi_db_version',
            Config::DB_VERSION
        );
    }

    public static function addFieldDataColumn()
    {
        self::addLogColumnIfMissing('field_data');
    }

    public static function addParentIdColumn()
    {
        self::addLogColumnIfMissing('parent_id');
    }

    public static function addParentIdIndex()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'btcbi_log';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Schema check for migration, not cacheable
        $index_exists = $wpdb->get_results(
            $wpdb->prepare(
                'SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND INDEX_NAME = %s',
                DB_NAME,
                $table_name,
                'parent_id'
            )
        );

        if (empty($index_exists) && self::logColumnHasParentId()) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- One-time schema migration; $table_name from $wpdb->prefix, index/column names are constants (no user input)
            $wpdb->query("ALTER TABLE `{$table_name}` ADD INDEX `parent_id` (`parent_id`)");
        }
    }

    private static function logColumnHasParentId()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'btcbi_log';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Schema check for migration, not cacheable
        $exists = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = 'parent_id'",
                DB_NAME,
                $table_name
            )
        );

        return !empty($exists);
    }

    private static function addLogColumnIfMissing($column)
    {
        $allowed = [
            'field_data' => ['definition' => 'LONGTEXT DEFAULT NULL', 'after' => 'response_obj'],
            'parent_id'  => ['definition' => 'bigint(20) DEFAULT NULL', 'after' => 'field_data'],
        ];

        if (!isset($allowed[$column])) {
            return;
        }

        $definition = $allowed[$column]['definition'];
        $after = $allowed[$column]['after'];

        global $wpdb;
        $table_name = $wpdb->prefix . 'btcbi_log';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Schema check for migration, not cacheable
        $column_exists = $wpdb->get_results(
            $wpdb->prepare(
                'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s',
                DB_NAME,
                $table_name,
                $column
            )
        );

        if (empty($column_exists)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- One-time schema migration; $table_name from $wpdb->prefix and column/definition come from a hard-coded allow-list, not user input
            $wpdb->query("ALTER TABLE `{$table_name}` ADD COLUMN `{$column}` {$definition} AFTER `{$after}`");
        }
    }

    public static function logColumnsExist()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'btcbi_log';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Schema check for migration, not cacheable
        $columns = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME IN ('field_data', 'parent_id')",
                DB_NAME,
                $table_name
            )
        );

        return \is_array($columns) && \count($columns) >= 2;
    }

    public static function fallbackDB()
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.NotPrepared -- Database migration for plugin rename
        $wpdb->query("RENAME TABLE `{$wpdb->prefix}btcfi_log` TO `{$wpdb->prefix}btcbi_log`,
                                   `{$wpdb->prefix}btcfi_flow` TO `{$wpdb->prefix}btcbi_flow`;");
        $options = [
            'btcfi_db_version' => 'btcbi_db_version',
            'btcfi_installed'  => 'btcbi_installed',
            'btcfi_version'    => 'btcbi_version'
        ];

        foreach ($options as $key => $option) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->query($wpdb->prepare("UPDATE `{$wpdb->prefix}options` SET `option_name` = %s WHERE `option_name` = %s", $option, $key));
        }
    }
}
