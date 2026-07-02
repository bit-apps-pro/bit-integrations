<?php

/**
 * ConvertForce Integration
 */

namespace BitApps\Integrations\Actions\ConvertForce;

use WP_Error;

/**
 * Provide functionality for ConvertForce integration
 */
class ConvertForceController
{
    public static function isExists()
    {
        if (!\defined('CONVERTFORCE_VERSION')) {
            wp_send_json_error(
                __(
                    'ConvertForce Popup Builder is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function convertForceAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshCampaigns()
    {
        self::isExists();

        $campaigns = array_map(
            static function ($campaign) {
                $title = $campaign->post_title ?: __('Untitled Campaign', 'bit-integrations');

                return (object) [
                    'value' => $campaign->ID,
                    'label' => $title . ' (#' . $campaign->ID . ')',
                ];
            },
            get_posts(
                [
                    'post_type'              => 'convertforce-popup',
                    'post_status'            => ['publish', 'draft', 'pending', 'future', 'private'],
                    'posts_per_page'         => -1,
                    'orderby'                => 'title',
                    'order'                  => 'ASC',
                    'no_found_rows'          => true,
                    'ignore_sticky_posts'    => true,
                    'update_post_meta_cache' => false,
                    'update_post_term_cache' => false,
                ]
            )
        );

        wp_send_json_success(['campaigns' => $campaigns], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];
        $mainAction = $integrationDetails->mainAction ?? '';

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $convertForceResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($convertForceResponse)) {
            return $convertForceResponse;
        }

        return $convertForceResponse;
    }
}
