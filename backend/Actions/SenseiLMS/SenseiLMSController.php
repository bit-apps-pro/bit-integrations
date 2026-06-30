<?php

/**
 * Sensei LMS Integration
 */

namespace BitApps\Integrations\Actions\SenseiLMS;

use WP_Error;

/**
 * Provide functionality for Sensei LMS integration
 */
class SenseiLMSController
{
    public static function isExists()
    {
        if (!class_exists('Sensei_Main')) {
            wp_send_json_error(
                __('Sensei LMS is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function senseiLMSAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshCourses()
    {
        self::isExists();

        $response['courses'] = self::postOptions('course');
        wp_send_json_success($response, 200);
    }

    public function refreshLessons()
    {
        self::isExists();

        $response['lessons'] = self::postOptions('lesson');
        wp_send_json_success($response, 200);
    }

    public function refreshQuizzes()
    {
        self::isExists();

        $response['quizzes'] = self::postOptions('quiz');
        wp_send_json_success($response, 200);
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

    private static function postOptions($postType)
    {
        $options = [];

        $posts = get_posts(
            [
                'post_type'   => $postType,
                'post_status' => 'publish',
                'numberposts' => -1,
            ]
        );

        foreach ($posts as $post) {
            $options[] = (object) [
                'value' => $post->ID,
                'label' => $post->post_title,
            ];
        }

        return $options;
    }
}
