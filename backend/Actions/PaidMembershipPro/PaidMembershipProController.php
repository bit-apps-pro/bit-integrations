<?php

namespace BitApps\Integrations\Actions\PaidMembershipPro;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\ActionUser;
use BitApps\Integrations\Core\Util\Hooks;
use WP_Error;

class PaidMembershipProController
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

        wp_send_json_success($allLevels);
    }

    public static function getProfileFields()
    {
        if (!self::pluginActive()) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated', 'bit-integrations'), 'Paid Memberships Pro'));
        }

        wp_send_json_success(Hooks::apply(Config::withPrefix('paid_membership_pro_profile_fields'), []));
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction ?? '';
        $selectedMembership = $integrationDetails->selectedMembership ?? '';

        if (empty($integId) || empty($mainAction)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('module, There is an some error.', 'bit-integrations'));
        }

        if (\in_array($mainAction, [RecordApiHelper::ADD_MEMBERSHIP, RecordApiHelper::REMOVE_MEMBERSHIP], true) && empty($selectedMembership)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Membership level is required.', 'bit-integrations'));
        }

        if ($mainAction === RecordApiHelper::DIRECTORY_VISIBILITY && empty($integrationDetails->directoryVisibility)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Directory visibility is required.', 'bit-integrations'));
        }

        $userId = ActionUser::resolve($integrationDetails, $fieldValues);

        if (is_wp_error($userId)) {
            return $userId;
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute(
            $mainAction,
            $selectedMembership,
            $userId,
            $fieldValues
        );
    }
}
