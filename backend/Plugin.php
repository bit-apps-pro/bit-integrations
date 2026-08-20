<?php

namespace BitApps\Integrations;

/**
 * Main class for the plugin.
 *
 * @since 1.0.0-alpha
 */

use BitApps\Integrations\Admin\Admin_Bar;
use BitApps\Integrations\Core\Database\DB;
use BitApps\Integrations\Core\Hooks\HookService;
use BitApps\Integrations\Core\Http\OauthCallbackController;
use BitApps\Integrations\Core\Util\Activation;
use BitApps\Integrations\Core\Util\Capabilities;
use BitApps\Integrations\Core\Util\Deactivation;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\Request;
use BitApps\Integrations\Core\Util\RewriteRuleProvider;
use BitApps\Integrations\Core\Util\UnInstallation;
use BitApps\Integrations\Log\LogHandler;

final class Plugin
{
    /**
     * Main instance of the plugin.
     *
     * @since 1.0.0-alpha
     *
     * @var Plugin|null
     */
    private static $_instance;

    /**
     * Initialize the hooks
     *
     * @return void
     */
    public function initialize()
    {
        Hooks::add('plugins_loaded', [$this, 'init_plugin'], 12);

        $this->registerOauthCallbackRoute();

        (new Activation())->activate();
        (new Deactivation())->register();
        (new UnInstallation())->register();
    }

    public function init_plugin()
    {
        Hooks::add('init', [$this, 'init_classes'], 8);
        Hooks::add(Config::withPrefix('delete_log'), [$this, 'deleteIntegrationLog'], PHP_INT_MAX);
        Hooks::filter('plugin_action_links_' . plugin_basename(BIT_INTEGRATIONS_PLUGIN_FILE), [$this, 'plugin_action_links']);
        Hooks::filter('cron_schedules', [$this, 'every_week_time_cron']);

        new HookService();

        $this->deleteLogScheduler();
    }

    /**
     * @return void
     */
    public function registerOauthCallbackRoute()
    {
        if (Request::Check('ajax') || Request::Check('cron') || Request::isRest()) {
            return;
        }

        Hooks::add('parse_request', [new OauthCallbackController(), 'handle']);

        if (get_option('permalink_structure') === '') {
            return;
        }

        (new RewriteRuleProvider(OauthCallbackController::ROUTE))->register();
    }

    public function every_week_time_cron($schedules)
    {
        $schedules['every_week'] = [
            'interval' => 604800, // 604800 seconds in 1 week
            'display'  => (\function_exists('is_textdomain_loaded') && is_textdomain_loaded('bit-integrations')) ? esc_html__('Every Week', 'bit-integrations') : 'Every Week'
        ];

        return $schedules;
    }

    public function deleteLogScheduler()
    {
        if (!wp_next_scheduled(Config::withPrefix('delete_log'))) {
            wp_schedule_event(time(), 'every_week', Config::withPrefix('delete_log'));
        }
    }

    /**
     * Instantiate the required classes
     *
     * @return void
     */
    public function init_classes()
    {
        static::update_tables();
        if (Request::Check('admin')) {
            (new Admin_Bar())->register();
        }
    }

    /**
     * Plugin action links
     *
     * @param array $links
     *
     * @return array
     */
    public function plugin_action_links($links)
    {
        $docs = (\function_exists('is_textdomain_loaded') && is_textdomain_loaded('bit-integrations')) ? __('Docs', 'bit-integrations') : 'Docs';

        $links[] = '<a href="https://docs.bit-integrations.bitapps.pro" target="_blank">' . $docs . '</a>';

        return $links;
    }

    /**
     * Retrieves the main instance of the plugin.
     *
     * @since 1.0.0-alpha
     *
     * @return Plugin main instance.
     */
    public static function instance()
    {
        return static::$_instance;
    }

    public static function update_tables()
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('edit_integrations')))) {
            return;
        }
        $installed_db_version = Config::getOption('db_version', get_site_option('btcbi_db_version'));
        if ($installed_db_version != Config::DB_VERSION) {
            DB::migrate();
        }
    }

    /**
     * Loads the plugin main instance and initializes it.
     *
     * @since 1.0.0-alpha
     *
     * @param string $main_file Absolute path to the plugin main file.
     *
     * @return bool True if the plugin main instance could be loaded, false otherwise./
     */
    public static function deleteIntegrationLog()
    {
        $option = Config::getOption('app_conf', get_option('btcbi_app_conf', []));
        if (isset($option->enable_log_del, $option->day)) {
            LogHandler::logAutoDelte($option->day);
        }
    }

    public static function load($main_file)
    {
        if (null !== static::$_instance) {
            return false;
        }
        static::$_instance = new static($main_file);
        static::$_instance->initialize();

        return true;
    }
}
