<?php

/**
 * Plugin Name: Bit Integrations
 * Plugin URI:  https://bitapps.pro/bit-integrations
 * Description: Bit Integrations is a platform that integrates with over 300+ different platforms to help with various tasks on your WordPress site, like WooCommerce, Form builder, Page builder, LMS, Sales funnels, Bookings, CRM, Webhooks, Email marketing, Social media and Spreadsheets, etc
 * Version:     2.8.3
 * Author:      Automation & Integration Plugin - Bit Apps
 * Author URI:  https://bitapps.pro
 * Text Domain: bit-integrations
 * Requires PHP: 7.4
 * Requires at least: 5.1
 * Tested up to: 6.9
 * Domain Path: /languages
 * License:  GPLv2 or later
 */

use BitApps\Integrations\Config;

// If try to direct access  plugin folder it will Exit
if (!defined('ABSPATH')) {
    exit;
}
/**
 * @deprecated since version 2.7.8. use Config::DB_VERSION instead.
 */
global $btcbi_db_version;
$btcbi_db_version = '1.1';

// Define most essential constants.
/**
 * deprecated since version 2.7.8.
 *
 * @deprecated 2.7.8 Use Config::VERSION instead.
 */
define('BTCBI_VERSION', '2.8.3');
/**
 * deprecated since version 2.7.8.
 *
 * @deprecated 2.7.8 Use `BIT_INTEGRATIONS_PLUGIN_FILE` instead.
 */
define('BTCBI_PLUGIN_MAIN_FILE', __FILE__);

define('BIT_INTEGRATIONS_PLUGIN_FILE', __FILE__);

require_once plugin_dir_path(__FILE__) . 'backend/loader.php';

if (!class_exists(Config::class)) {
    return;
}
/**
 * @deprecated since version 2.7.8. Use `bit_integrations_activate_plugin()` instead.
 *
 * @param mixed $network_wide
 */
function btcbi_activate_plugin($network_wide)
{
    bit_integrations_activate_plugin($network_wide);
}
function bit_integrations_activate_plugin($network_wide)
{
    global $wp_version;
    if (version_compare($wp_version, '5.1', '<')) {
        wp_die(
            esc_html__('This plugin requires WordPress version 5.1 or higher.', 'bit-integrations'),
            esc_html__('Error Activating', 'bit-integrations')
        );
    }
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        wp_die(
            esc_html__('Bit Integrations requires PHP version 7.4.', 'bit-integrations'),
            esc_html__('Error Activating', 'bit-integrations')
        );
    }
    // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
    do_action(Config::withPrefix('activation'), $network_wide);
}
register_activation_hook(__FILE__, 'bit_integrations_activate_plugin');
/**
 * @deprecated since version 2.7.8. Use `bit_integrations_deactivate_plugin()` instead.
 *
 * @param mixed $network_wide
 */
function btcbi_deactivate_plugin($network_wide)
{
    bit_integrations_deactivate_plugin($network_wide);
}

function bit_integrations_deactivate_plugin($network_wide)
{
    global $wp_version;
    if (version_compare($wp_version, '5.1', '<')) {
        wp_die(
            esc_html__('This plugin requires WordPress version 5.1 or higher.', 'bit-integrations'),
            esc_html__('Error Deactivating', 'bit-integrations')
        );
    }
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        wp_die(
            esc_html__('Bit Integrations requires PHP version 7.4.', 'bit-integrations'),
            esc_html__('Error Deactivating', 'bit-integrations')
        );
    }
    // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
    do_action(Config::withPrefix('deactivation'), $network_wide);
}
register_deactivation_hook(__FILE__, 'bit_integrations_deactivate_plugin');

/**
 * @deprecated since version 2.7.8. Use `bit_integrations_uninstall_plugin()` instead.
 */
function btcbi_uninstall_plugin()
{
    bit_integrations_uninstall_plugin();
}

function bit_integrations_uninstall_plugin()
{
    // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
    do_action(Config::withPrefix('uninstall'));
}
register_uninstall_hook(__FILE__, 'bit_integrations_uninstall_plugin');
