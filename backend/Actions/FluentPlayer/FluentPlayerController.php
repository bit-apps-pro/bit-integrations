<?php

/**
 * FluentPlayer Integration
 */

namespace BitApps\Integrations\Actions\FluentPlayer;

use WP_Error;

/**
 * Provide functionality for FluentPlayer integration
 */
class FluentPlayerController
{
    public static function isExists()
    {
        if (!\defined('FLUENT_PLAYER')) {
            wp_send_json_error(
                __('FluentPlayer is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function fluentPlayerAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshMedia()
    {
        self::isExists();

        $media = array_map(
            function ($post) {
                return (object) [
                    'value' => $post->ID,
                    'label' => $post->post_title !== '' ? $post->post_title : "(no title) #{$post->ID}",
                ];
            },
            get_posts(
                [
                    'post_type'      => 'fluent_player_media',
                    'posts_per_page' => -1,
                    'post_status'    => ['publish', 'private', 'draft'],
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                ]
            )
        );

        $response['media'] = $media;
        wp_send_json_success($response, 200);
    }

    public function refreshTags()
    {
        self::isExists();

        $terms = get_terms(
            [
                'taxonomy'   => 'flp_media_tag',
                'hide_empty' => false,
                'number'     => 0,
            ]
        );

        $tags = is_wp_error($terms) ? [] : array_map(
            function ($term) {
                return (object) ['value' => $term->name, 'label' => $term->name];
            },
            $terms
        );

        $response['tags'] = $tags;
        wp_send_json_success($response, 200);
    }

    public function refreshPresets()
    {
        self::isExists();

        $presets = [];

        if (class_exists('\FluentPlayer\App\Services\PresetService')) {
            $allPresets = \FluentPlayer\App\Services\PresetService::all();

            if (\is_array($allPresets)) {
                foreach ($allPresets as $slug => $preset) {
                    $presets[] = (object) [
                        'value' => $slug,
                        'label' => \is_array($preset) && !empty($preset['name']) ? $preset['name'] : $slug,
                    ];
                }
            }
        }

        $response['presets'] = $presets;
        wp_send_json_success($response, 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = array_map(
            function ($user) {
                return (object) [
                    'value' => $user->ID,
                    'label' => $user->user_email . ' - ' . $user->display_name,
                ];
            },
            get_users(['fields' => ['ID', 'user_email', 'display_name']])
        );

        $response['users'] = $users;
        wp_send_json_success($response, 200);
    }

    public function refreshAttachments()
    {
        self::isExists();

        $attachments = array_map(
            function ($attachment) {
                return (object) [
                    'value' => $attachment->ID,
                    'label' => $attachment->post_title !== '' ? $attachment->post_title : "#{$attachment->ID}",
                ];
            },
            get_posts(
                [
                    'post_type'      => 'attachment',
                    'post_status'    => 'inherit',
                    'post_mime_type' => ['video', 'audio'],
                    'posts_per_page' => -1,
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                ]
            )
        );

        $response['attachments'] = $attachments;
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
}
