<?php

namespace BitApps\Integrations\Actions\PaidMembershipPro;

use BitApps\Integrations\Config;

class PaidMembershipProHelper
{
    public static function pluginActive($option = null)
    {
        if (is_plugin_active('paid-memberships-pro/paid-memberships-pro.php')) {
            return $option === 'get_name' ? 'paid-memberships-pro/paid-memberships-pro.php' : true;
        }

        return false;
    }

    public static function getAllPaidMembershipProLevel()
    {
        global $wpdb;
        $cache_key = Config::withPrefix('pmpro_membership_levels');
        $cache_group = Config::VAR_PREFIX;

        $levels = wp_cache_get($cache_key, $cache_group);
        if (false === $levels) {
            $membership_table = esc_sql($wpdb->pmpro_membership_levels);

            // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
            $levels = $wpdb->get_results(
                'SELECT * FROM ' . $membership_table . ' ORDER BY id ASC'
            );
            // phpcs:enable

            wp_cache_set($cache_key, $levels, $cache_group, 10 * MINUTE_IN_SECONDS);
        }

        $allLevels = [];

        if ($levels) {
            foreach ($levels as $level) {
                $allLevels[] = [
                    'membershipId'    => $level->id,
                    'membershipTitle' => $level->name,
                ];
            }
        }

        // $allLevels = array_merge($allLevels, [[
        //     'membershipId' => 'any',
        //     'membershipTitle' => 'Any Membership Level',
        // ]]);
        wp_send_json_success($allLevels);
    }
}
