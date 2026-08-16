<?php

/**
 * Directorist Integration
 */

namespace BitApps\Integrations\Actions\Directorist;

use WP_Error;

/**
 * Provide functionality for Directorist integration
 */
class DirectoristController
{
    public const POST_TYPE = 'at_biz_dir';

    public const CATEGORY_TAXONOMY = 'at_biz_dir-category';

    public const LOCATION_TAXONOMY = 'at_biz_dir-location';

    public const TAG_TAXONOMY = 'at_biz_dir-tags';

    public const DIRECTORY_TAXONOMY = 'atbdp_listing_types';

    public static function isExists()
    {
        if (!\defined('ATBDP_VERSION')) {
            wp_send_json_error(
                __(
                    'Directorist is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function directoristAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshDirectories()
    {
        self::isExists();

        wp_send_json_success(['directories' => self::termOptions(self::DIRECTORY_TAXONOMY)], 200);
    }

    public function refreshCategories()
    {
        self::isExists();

        wp_send_json_success(['categories' => self::termOptions(self::CATEGORY_TAXONOMY)], 200);
    }

    public function refreshLocations()
    {
        self::isExists();

        wp_send_json_success(['locations' => self::termOptions(self::LOCATION_TAXONOMY)], 200);
    }

    public function refreshTags()
    {
        self::isExists();

        wp_send_json_success(['tags' => self::termOptions(self::TAG_TAXONOMY)], 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = array_map(
            function ($user) {
                return (object) [
                    'value' => $user->ID,
                    'label' => $user->display_name . ' (' . $user->user_email . ')',
                ];
            },
            get_users(['number' => -1])
        );

        wp_send_json_success(['users' => $users], 200);
    }

    public function refreshListingStatuses()
    {
        self::isExists();

        $statuses = [];

        foreach (['publish', 'pending', 'draft', 'private', 'expired', 'rejected', 'trash'] as $status) {
            $statuses[] = (object) [
                'value' => $status,
                'label' => ucfirst($status),
            ];
        }

        wp_send_json_success(['statuses' => $statuses], 200);
    }

    public function refreshOrderStatuses()
    {
        self::isExists();

        $statuses = [];

        foreach (['created', 'pending', 'completed', 'failed', 'cancelled', 'refunded'] as $status) {
            $statuses[] = (object) [
                'value' => $status,
                'label' => ucfirst($status),
            ];
        }

        wp_send_json_success(['statuses' => $statuses], 200);
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

    /**
     * Dropdown options of a Directorist taxonomy.
     *
     * @param string $taxonomy
     *
     * @return array
     */
    private static function termOptions($taxonomy)
    {
        $terms = get_terms(
            [
                'taxonomy'   => $taxonomy,
                'hide_empty' => false,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]
        );

        if (is_wp_error($terms)) {
            return [];
        }

        return array_map(
            function ($term) {
                return (object) [
                    'value' => $term->term_id,
                    'label' => $term->name,
                ];
            },
            $terms
        );
    }
}
