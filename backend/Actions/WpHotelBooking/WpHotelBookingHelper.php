<?php

namespace BitApps\Integrations\Actions\WpHotelBooking;

class WpHotelBookingHelper
{
    public static function isExists()
    {
        if (!self::isPluginActive()) {
            wp_send_json_error(
                __('WP Hotel Booking is not active. Install and activate WP Hotel Booking.', 'bit-integrations'),
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

    public static function isPluginActive()
    {
        return \defined('WPHB_VERSION') && \function_exists('hb_get_booking');
    }

    private static function getPostOptions($postType)
    {
        $posts = get_posts(
            [
                'post_type'   => $postType,
                'post_status' => 'publish',
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
