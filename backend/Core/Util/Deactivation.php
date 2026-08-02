<?php

namespace BitApps\Integrations\Core\Util;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;

/**
 * Class handling plugin deactivation.
 *
 * @since 1.0.0
 *
 * @access private
 *
 * @ignore
 */
final class Deactivation
{
    /**
     * Registers functionality through WordPress hooks.
     *
     * @since 1.0.0
     */
    public function register()
    {
        add_action('btcbi_deactivation', [$this, 'remove_capability_to_administrator']);
        add_action('btcbi_deactivation', [$this, 'deactive']);
    }

    public function remove_capability_to_administrator()
    {
        $role = get_role('administrator');
        $role->remove_cap(Config::withPrefix('manage_integrations'));
        $role->remove_cap(Config::withPrefix('view_integrations'));
        $role->remove_cap(Config::withPrefix('create_integrations'));
        $role->remove_cap(Config::withPrefix('edit_integrations'));
        $role->remove_cap(Config::withPrefix('delete_integrations'));
    }

    public function deactive()
    {
        wp_clear_scheduled_hook('btcbi_delete_integ_log');

        // Drops the OAuth callback rewrite rule, which would otherwise keep
        // resolving to a pagename nothing handles. Clearing the lock lets a
        // reactivation restore the rule without waiting it out.
        delete_transient(Config::withPrefix(RewriteRuleProvider::FLUSH_LOCK));
        flush_rewrite_rules();
    }
}
