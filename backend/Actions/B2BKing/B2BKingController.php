<?php

namespace BitApps\Integrations\Actions\B2BKing;

use WP_Error;

class B2BKingController
{
    public static function isExists()
    {
        if (!\defined('B2BKINGCORE_DIR')) {
            wp_send_json_error(
                __('B2BKing is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function b2bKingAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshGroups()
    {
        self::isExists();

        $posts = get_posts(
            [
                'post_type'   => 'b2bking_group',
                'numberposts' => -1,
                'post_status' => 'publish',
            ]
        );

        $groups = array_map(
            function ($post) {
                return (object) [
                    'value' => $post->ID,
                    'label' => $post->post_title,
                ];
            },
            $posts
        );

        wp_send_json_success(['groups' => $groups]);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : (object) [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $b2bKingResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($b2bKingResponse)) {
            return $b2bKingResponse;
        }

        return $b2bKingResponse;
    }
}
