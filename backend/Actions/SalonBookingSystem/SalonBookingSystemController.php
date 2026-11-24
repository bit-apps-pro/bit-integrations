<?php

namespace BitApps\Integrations\Actions\SalonBookingSystem;

use SLN_Enum_BookingStatus;
use WP_Error;

class SalonBookingSystemController
{
    private const SERVICE_POST_TYPE = 'sln_service';

    private const ASSISTANT_POST_TYPE = 'sln_attendant';

    private const SERVICE_CATEGORY_TAXONOMY = 'sln_service_category';

    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(__('Salon Booking System is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public function refreshServices()
    {
        self::isExists();

        wp_send_json_success(['services' => self::getPostOptions(self::SERVICE_POST_TYPE)], 200);
    }

    public function refreshAssistants()
    {
        self::isExists();

        wp_send_json_success(['assistants' => self::getPostOptions(self::ASSISTANT_POST_TYPE)], 200);
    }

    public function refreshStatuses()
    {
        self::isExists();

        $statuses = [];

        foreach (SLN_Enum_BookingStatus::toBackendWrapper() as $status => $label) {
            $statuses[] = (object) ['value' => $status, 'label' => $label];
        }

        wp_send_json_success(['statuses' => $statuses], 200);
    }

    public function refreshServiceCategories()
    {
        self::isExists();

        $terms = get_terms(['taxonomy' => self::SERVICE_CATEGORY_TAXONOMY, 'hide_empty' => false]);
        $categories = [];

        foreach (is_wp_error($terms) ? [] : $terms as $term) {
            $categories[] = (object) ['value' => (int) $term->term_id, 'label' => $term->name];
        }

        wp_send_json_success(['categories' => $categories], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    public static function isPluginActive()
    {
        return \defined('SLN_VERSION') && class_exists('SLN_Plugin');
    }

    private static function getPostOptions($postType)
    {
        $options = [];

        $posts = get_posts(
            [
                'post_type'      => $postType,
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'          => 'ASC',
            ]
        );

        foreach ($posts as $post) {
            $options[] = (object) ['value' => (int) $post->ID, 'label' => $post->post_title . ' (#' . $post->ID . ')'];
        }

        return $options;
    }
}
