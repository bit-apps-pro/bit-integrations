<?php

namespace BitApps\Integrations\Core\Util;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Database\DB;
use WP_Role;
use WP_Site;

/**
 * Class handling plugin activation.
 *
 * @since 1.0.0
 */
final class Activation
{
    private string $oldVersion;

    private string $newVersion;

    public function activate()
    {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
        add_action(Config::withPrefix('activation'), [$this, 'install']);

        Hooks::add(Config::withPrefix('activation'), [$this, 'add_capability_to_administrator']);
    }

    public function add_capability_to_administrator()
    {
        $role = get_role('administrator');

        // membership and role plugins can remove or rename the role, and activation
        // is fatal here without it
        if (!$role instanceof WP_Role) {
            return;
        }

        $role->add_cap(Config::withPrefix('manage_integrations'));
        $role->add_cap(Config::withPrefix('view_integrations'));
        $role->add_cap(Config::withPrefix('create_integrations'));
        $role->add_cap(Config::withPrefix('edit_integrations'));
        $role->add_cap(Config::withPrefix('delete_integrations'));
    }

    public function install($network_wide)
    {
        if ($network_wide && \function_exists('is_multisite') && is_multisite()) {
            $sites = Multisite::all_blog_ids();

            foreach ($sites as $site) {
                switch_to_blog($site);

                $this->installAsSingleSite();

                if ($network_wide) {
                    // activate_plugin(plugin_basename(BTCBI_PLUGIN_MAIN_FILE));
                }

                restore_current_blog();
            }
        } else {
            $this->installAsSingleSite();
        }
    }

    public function installAsSingleSite()
    {
        $installed = Config::getOption('installed', get_option('btcbi_installed'));

        if ($installed) {
            $oldVersion = Config::getOption('version', get_option('btcbi_version'));
        }

        $this->oldVersion = $oldVersion ?? '0.0.0';
        $this->newVersion = Config::VERSION;
        if (!$installed || version_compare($oldVersion, Config::VERSION, '!=')) {
            DB::migrate();
            Config::updateOption('installed', time());
        }

        $this->runVersionUpgradeTask();

        Config::updateOption('version', Config::VERSION);
    }

    public static function handle_new_site(WP_Site $new_site)
    {
        switch_to_blog($new_site->blog_id);

        $plugin = plugin_basename(BIT_INTEGRATIONS_PLUGIN_FILE);

        if (is_plugin_active_for_network($plugin)) {
            // activate_plugin($plugin);
        } else {
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
            do_action(Config::withPrefix('activation'));
        }

        restore_current_blog();
    }

    public function runVersionUpgradeTask()
    {
        switch (true) {
            case version_compare($this->oldVersion, '2.7.8', '<'):
                return $this->upgradeTo278();
            default:
                return;
        }
    }

    private function upgradeTo278()
    {
        delete_option('btcbi_db_version');
        delete_option('btcbi_installed');
        delete_option('btcbi_version');

        wp_clear_scheduled_hook('btcbi_delete_integ_log');
    }
}
