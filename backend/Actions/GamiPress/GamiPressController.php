<?php

/**
 * LearnDesh Integration
 */

namespace BitApps\Integrations\Actions\GamiPress;

use BitApps\Integrations\Config;
use WP_Error;

/**
 * Provide functionality for LearnDesh integration
 */
class GamiPressController
{
    // private $_integrationID;

    // public function __construct($integrationID)
    // {
    //     $this->_integrationID = $integrationID;
    // }

    public static function pluginActive($option = null)
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        if (is_plugin_active('gamipress/gamipress.php')) {
            return $option === 'get_name' ? 'gamipress/gamipress.php' : true;
        }

        return false;
    }

    public static function getCourses()
    {
        $courses = [];

        $course_query_args = [
            'post_type'      => 'sfwd-courses',
            'post_status'    => 'publish',
            'orderby'        => 'post_title',
            'order'          => 'ASC',
            'posts_per_page' => -1,
        ];

        $courseList = get_posts($course_query_args);

        foreach ($courseList as $key => $val) {
            $courses[] = [
                'course_id'    => $val->ID,
                'course_title' => $val->post_title,
            ];
        }

        return $courses;
    }

    public static function fetchAllRankType()
    {
        global $wpdb;
        $cache_key = Config::withPrefix('gamipress_rank_types');
        $cache_group = Config::VAR_PREFIX;
        $rank_types = wp_cache_get($cache_key, $cache_group);

        if (false !== $rank_types) {
            return $rank_types;
        }

        $posts_table = esc_sql($wpdb->posts);

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
        $rank_types = $wpdb->get_results(
            'SELECT ID, post_name, post_title, post_type FROM ' . $posts_table . " where post_type = 'rank-type' AND post_status = 'publish'"
        );
        // phpcs:enable

        wp_cache_set($cache_key, $rank_types, $cache_group, 10 * MINUTE_IN_SECONDS);

        return $rank_types;
    }

    public static function fetchAllRankBYType($query_params)
    {
        $selectRankType = $query_params->domainName;

        global $wpdb;
        $cache_key = Config::withPrefix('gamipress_ranks_') . md5((string) $selectRankType);
        $cache_group = Config::VAR_PREFIX;
        $ranks = wp_cache_get($cache_key, $cache_group);

        if (false === $ranks) {
            $posts_table = esc_sql($wpdb->posts);
            // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
            $ranks = $wpdb->get_results(
                $wpdb->prepare('SELECT ID, post_name, post_title, post_type FROM ' . $posts_table . " where post_type like %s AND post_status = 'publish'", $selectRankType)
            );
            // phpcs:enable
            wp_cache_set($cache_key, $ranks, $cache_group, 10 * MINUTE_IN_SECONDS);
        }

        wp_send_json_success($ranks);
    }

    public static function fetchAllAchievementType()
    {
        global $wpdb;
        $cache_key = Config::withPrefix('gamipress_achievement_types');
        $cache_group = Config::VAR_PREFIX;
        $achievement_types = wp_cache_get($cache_key, $cache_group);

        if (false !== $achievement_types) {
            return $achievement_types;
        }

        $posts_table = esc_sql($wpdb->posts);

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
        $achievement_types = $wpdb->get_results(
            'SELECT ID, post_name, post_title, post_type FROM ' . $posts_table . " WHERE post_type = 'achievement-type' AND post_status = 'publish' ORDER BY post_title ASC"
        );
        // phpcs:enable

        wp_cache_set($cache_key, $achievement_types, $cache_group, 10 * MINUTE_IN_SECONDS);

        return $achievement_types;
    }

    public static function fetchAllAchievementBYType($query_params)
    {
        $selectAchievementType = $query_params->achievementType;

        global $wpdb;
        $cache_key = Config::withPrefix('gamipress_achievements_') . md5((string) $selectAchievementType);
        $cache_group = Config::VAR_PREFIX;
        $awards = wp_cache_get($cache_key, $cache_group);

        if (false === $awards) {
            $posts_table = esc_sql($wpdb->posts);
            // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
            $awards = $wpdb->get_results(
                $wpdb->prepare('SELECT ID, post_name, post_title, post_type FROM ' . $posts_table . " where post_type like %s AND post_status = 'publish'", $selectAchievementType)
            );
            // phpcs:enable
            wp_cache_set($cache_key, $awards, $cache_group, 10 * MINUTE_IN_SECONDS);
        }

        array_unshift($awards, ['ID' => 'Any', 'post_name' => 'any_achievement', 'post_title' => 'Any Achievement']);

        wp_send_json_success($awards);
    }

    public static function fetchAllPointType()
    {
        global $wpdb;
        $cache_key = Config::withPrefix('gamipress_point_types');
        $cache_group = Config::VAR_PREFIX;
        $points = wp_cache_get($cache_key, $cache_group);

        if (false === $points) {
            $posts_table = esc_sql($wpdb->posts);
            // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
            $points = $wpdb->get_results(
                'SELECT ID, post_name, post_title, post_type FROM ' . $posts_table . " WHERE post_type = 'points-type' AND post_status = 'publish' ORDER BY post_title ASC"
            );
            // phpcs:enable
            wp_cache_set($cache_key, $points, $cache_group, 10 * MINUTE_IN_SECONDS);
        }

        wp_send_json_success($points);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        // $defaultDataConf = $integrationDetails->default;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            return new WP_Error('REQ_FIELD_EMPTY', __('module, select action are require for GamiPress api', 'bit-integrations'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $gamiPressApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData,
            $fieldMap
        );

        if (is_wp_error($gamiPressApiResponse)) {
            return $gamiPressApiResponse;
        }

        return $gamiPressApiResponse;
    }
}
