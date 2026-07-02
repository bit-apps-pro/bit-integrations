<?php

namespace BitApps\Integrations\Actions\LifterLms;

use BitApps\Integrations\Config;
use WP_Error;

class LifterLmsController
{
    public static function pluginActive($option = null)
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        if (is_plugin_active('lifterlms/lifterlms.php')) {
            return $option === 'get_name' ? 'lifterlms/lifterlms.php' : true;
        }

        return false;
    }

    public static function getAllLesson()
    {
        $lessonParams = [
            'post_type'      => 'lesson',
            'posts_per_page' => 9999,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'post_status'    => 'publish',
        ];

        $lessonList = get_posts($lessonParams);

        foreach ($lessonList as $key => $val) {
            $allLesson[] = [
                'lesson_id'    => $val->ID,
                'lesson_title' => $val->post_title,
            ];
        }

        return $allLesson;
    }

    public static function getAllSection()
    {
        $sectionParams = [
            'post_type'      => 'section',
            'posts_per_page' => 9999,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'post_status'    => 'publish',
        ];

        $sectionList = get_posts($sectionParams);

        foreach ($sectionList as $key => $val) {
            $allSection[] = [
                'section_id'    => $val->ID,
                'section_title' => $val->post_title,
            ];
        }

        return $allSection;
    }

    public static function getAllLifterLmsCourse()
    {
        global $wpdb;
        $cache_key = Config::withPrefix('lifterlms_courses');
        $cache_group = Config::VAR_PREFIX;
        $allCourse = wp_cache_get($cache_key, $cache_group);

        if (false !== $allCourse) {
            return $allCourse;
        }

        $posts_table = esc_sql($wpdb->posts);

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
        $allCourse = $wpdb->get_results(
            'SELECT ID, post_title FROM ' . $posts_table . ' WHERE ' . $posts_table . ".post_status = 'publish' AND " . $posts_table . ".post_type = 'course' ORDER BY post_title"
        );
        // phpcs:enable

        wp_cache_set($cache_key, $allCourse, $cache_group, 10 * MINUTE_IN_SECONDS);

        return $allCourse;
    }

    public static function getAllLifterLmsMembership()
    {
        global $wpdb;
        $cache_key = Config::withPrefix('lifterlms_memberships');
        $cache_group = Config::VAR_PREFIX;
        $allMembership = wp_cache_get($cache_key, $cache_group);

        if (false !== $allMembership) {
            return $allMembership;
        }

        $posts_table = esc_sql($wpdb->posts);

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
        $allMembership = $wpdb->get_results(
            'SELECT ID, post_title FROM ' . $posts_table . ' WHERE ' . $posts_table . ".post_status = 'publish' AND " . $posts_table . ".post_type = 'llms_membership' ORDER BY post_title"
        );
        // phpcs:enable

        wp_cache_set($cache_key, $allMembership, $cache_group, 10 * MINUTE_IN_SECONDS);

        return $allMembership;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            // translators: %s: Integration name
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('Some important info are missing those are required for %s', 'bit-integrations'), 'LifterLms'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $lifterLmsApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData
        );

        if (is_wp_error($lifterLmsApiResponse)) {
            return $lifterLmsApiResponse;
        }

        return $lifterLmsApiResponse;
    }
}
