<?php

namespace BitApps\Integrations\Core\Util;

use BitApps\Integrations\Config;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class handling plugin uninstallation.
 *
 * @since 1.0.0
 *
 * @access private
 *
 * @ignore
 */
final class UnInstallation
{
    /**
     * Registers functionality through WordPress hooks.
     *
     * @since 1.0.0-alpha
     */
    public function register()
    {
        $option = Config::getOption('app_conf', get_option('btcbi_app_conf', []));
        if (isset($option->erase_db)) {
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
            add_action(Config::withPrefix('uninstall'), [$this, 'uninstall']);
        }
    }

    public function uninstall()
    {
        global $wpdb;
        $freeVersionInstalled = Config::getOption('installed', get_option('btcbi_installed'));
        $columns = [
            'btcbi_db_version',
            'btcbi_installed',
            'btcbi_version',
            Config::withPrefix('db_version'),
            Config::withPrefix('installed'),
            Config::withPrefix('version'),
            Config::withPrefix('selected_trigger'),
        ];

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

        if (!$freeVersionInstalled) {
            $tableArray = [
                $wpdb->prefix . 'btcbi_flow',
                $wpdb->prefix . 'btcbi_log',
                // Legacy credential store (removed). Drop any leftover rows so old
                // plaintext OAuth tokens do not linger after uninstall.
                $wpdb->prefix . 'btcbi_auth',
            ];
            foreach ($tableArray as $tablename) {
                $wpdb->query(
                    "DROP TABLE IF EXISTS `{$tablename}`" // phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name cannot be parameterized
                );
            }

            $columns = $columns + ['btcbi_app_conf'];
        }

        foreach ($columns as $column) {
            $wpdb->query(
                $wpdb->prepare(
                    "DELETE FROM `{$wpdb->prefix}options` WHERE option_name = %s",
                    $column
                )
            );
        }

        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE %s",
                '%' . Config::withPrefix('webhook_') . '%'
            )
        );

        // phpcs:enable
    }
}
