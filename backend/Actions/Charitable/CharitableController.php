<?php

/**
 * Charitable Integration
 */

namespace BitApps\Integrations\Actions\Charitable;

use WP_Error;

class CharitableController
{
    public static function isExists()
    {
        if (!class_exists('Charitable')) {
            wp_send_json_error(
                __(
                    'Charitable is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshCampaigns()
    {
        self::isExists();

        $campaigns = array_map(
            function ($campaign) {
                return (object) [
                    'campaign_id'   => $campaign->ID,
                    'campaign_name' => $campaign->post_title,
                ];
            },
            get_posts(['post_type' => 'campaign', 'post_status' => 'any', 'posts_per_page' => -1])
        );

        wp_send_json_success(['campaigns' => $campaigns], 200);
    }

    public function refreshDonationStatuses()
    {
        self::isExists();

        $statuses = [];

        if (\function_exists('charitable_get_valid_donation_statuses')) {
            foreach (charitable_get_valid_donation_statuses() as $key => $label) {
                $statuses[] = (object) ['value' => $key, 'label' => $label];
            }
        }

        wp_send_json_success(['statuses' => $statuses], 200);
    }

    public function refreshDonors()
    {
        self::isExists();

        global $wpdb;

        $tableName = $wpdb->prefix . 'charitable_donors';

        $rows = $wpdb->get_results($wpdb->prepare('SELECT donor_id, email, first_name, last_name FROM ' . $tableName . ' ORDER BY donor_id DESC LIMIT %d', 5000)); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

        $donors = array_map(
            function ($donor) {
                $name = trim($donor->first_name . ' ' . $donor->last_name);

                return (object) [
                    'donor_id'   => (int) $donor->donor_id,
                    'donor_name' => $name === '' ? $donor->email : $name,
                    'email'      => $donor->email,
                ];
            },
            (array) $rows
        );

        wp_send_json_success(['donors' => $donors], 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = array_map(
            function ($user) {
                return (object) [
                    'value' => (int) $user->ID,
                    'label' => $user->display_name . ' (' . $user->user_email . ')',
                ];
            },
            get_users(['fields' => ['ID', 'display_name', 'user_email']])
        );

        wp_send_json_success(['users' => $users], 200);
    }

    public function refreshCampaignCategories()
    {
        self::isExists();

        wp_send_json_success(['categories' => self::getTermOptions('campaign_category')], 200);
    }

    public function refreshCampaignTags()
    {
        self::isExists();

        wp_send_json_success(['tags' => self::getTermOptions('campaign_tag')], 200);
    }

    public function refreshUserRoles()
    {
        self::isExists();

        $roles = [];

        foreach (wp_roles()->get_names() as $key => $label) {
            $roles[] = (object) ['value' => $key, 'label' => translate_user_role($label)];
        }

        wp_send_json_success(['roles' => $roles], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    private static function getTermOptions($taxonomy)
    {
        $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false, 'orderby' => 'name', 'order' => 'ASC']);

        if (is_wp_error($terms)) {
            return [];
        }

        return array_map(
            function ($term) {
                return (object) ['value' => (int) $term->term_id, 'label' => $term->name];
            },
            $terms
        );
    }
}
