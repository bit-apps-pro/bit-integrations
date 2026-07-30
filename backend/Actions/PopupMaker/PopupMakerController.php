<?php

/**
 * Popup Maker Integration
 */

namespace BitApps\Integrations\Actions\PopupMaker;

use WP_Error;

/**
 * Provide functionality for Popup Maker integration
 */
class PopupMakerController
{
    public static function isExists()
    {
        if (!\defined('POPMAKE_VERSION')) {
            wp_send_json_error(
                __(
                    'Popup Maker is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshPopups()
    {
        self::isExists();

        $response['popups'] = self::postDropdown('popup');

        wp_send_json_success($response, 200);
    }

    public function refreshThemes()
    {
        self::isExists();

        $response['themes'] = self::postDropdown('popup_theme');

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

    private static function postDropdown($postType)
    {
        $options = [];

        $posts = get_posts(
            [
                'post_type'      => $postType,
                'post_status'    => ['publish', 'draft', 'pending', 'private'],
                'orderby'        => 'title',
                'order'          => 'ASC',
                'posts_per_page' => -1,
            ]
        );

        foreach ($posts as $post) {
            $options[] = (object) [
                'id'    => $post->ID,
                'title' => $post->post_title !== '' ? $post->post_title : \sprintf('#%d', $post->ID),
            ];
        }

        return $options;
    }
}
