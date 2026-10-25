<?php

namespace BitApps\Integrations\Actions\WpHotelBooking;

use WP_Error;

class WpHotelBookingController
{
    public static function isExists()
    {
        if (!self::isPluginActive()) {
            wp_send_json_error(
                __(
                    'WP Hotel Booking is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshRooms()
    {
        self::isExists();

        wp_send_json_success(['rooms' => self::getPostOptions('hb_room')], 200);
    }

    public function refreshCoupons()
    {
        self::isExists();

        wp_send_json_success(['coupons' => self::getPostOptions('hb_coupon')], 200);
    }

    public function refreshExtras()
    {
        self::isExists();

        wp_send_json_success(['extras' => self::getPostOptions('hb_extra_room')], 200);
    }

    public function refreshRoomTypes()
    {
        self::isExists();

        $terms = get_terms(['taxonomy' => 'hb_room_type', 'hide_empty' => false]);
        $roomTypes = [];

        foreach (is_wp_error($terms) ? [] : $terms as $term) {
            $roomTypes[] = (object) ['value' => (string) $term->term_id, 'label' => $term->name];
        }

        wp_send_json_success(['roomTypes' => $roomTypes], 200);
    }

    public function refreshPaymentMethods()
    {
        self::isExists();

        $paymentMethods = [];

        foreach (hb_get_payment_gateways() as $slug => $gateway) {
            $paymentMethods[] = (object) ['value' => $slug, 'label' => $gateway->title ?: $slug];
        }

        wp_send_json_success(['paymentMethods' => $paymentMethods], 200);
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

    public static function isPluginActive()
    {
        return \defined('WPHB_VERSION') && \function_exists('hb_get_booking');
    }

    private static function getPostOptions($postType)
    {
        $posts = get_posts(
            [
                'post_type'   => $postType,
                'post_status' => ['publish', 'draft', 'pending', 'private'],
                'numberposts' => -1,
                'orderby'     => 'title',
                'order'       => 'ASC',
            ]
        );

        return array_map(
            static function ($post) {
                return (object) ['value' => (string) $post->ID, 'label' => $post->post_title . ' (#' . $post->ID . ')'];
            },
            $posts
        );
    }
}
