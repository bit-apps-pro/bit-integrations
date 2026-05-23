<?php

namespace BitApps\Integrations\Actions\SureDash;

use WP_Error;

class SureDashController
{
    public static function isExists()
    {
        if (!\defined('SUREDASHBOARD_POST_TYPE')) {
            wp_send_json_error(
                __('SureDash is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function sureDashAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshSpaces()
    {
        self::isExists();

        $posts = get_posts(
            [
                'post_type'      => SUREDASHBOARD_POST_TYPE,
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'          => 'ASC',
            ]
        );

        $spaces = array_map(
            static function ($post) {
                return (object) [
                    'label' => $post->post_title,
                    'value' => $post->ID,
                ];
            },
            $posts
        );

        wp_send_json_success(['spaces' => $spaces], 200);
    }

    public function refreshPosts()
    {
        if (!\defined('SUREDASHBOARD_FEED_POST_TYPE')) {
            wp_send_json_error(__('SureDash is not activated or not installed', 'bit-integrations'), 400);
        }

        $posts = get_posts(
            [
                'post_type'      => SUREDASHBOARD_FEED_POST_TYPE,
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'date',
                'order'          => 'DESC',
            ]
        );

        $formatted = array_map(
            static function ($post) {
                return (object) [
                    'label' => $post->post_title ?: '(Untitled #' . $post->ID . ')',
                    'value' => $post->ID,
                ];
            },
            $posts
        );

        wp_send_json_success(['posts' => $formatted], 200);
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
        $sureDashResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($sureDashResponse)) {
            return $sureDashResponse;
        }

        return $sureDashResponse;
    }
}
