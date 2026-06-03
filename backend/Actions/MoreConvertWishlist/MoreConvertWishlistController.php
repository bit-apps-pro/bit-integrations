<?php

/**
 * MoreConvert Wishlist Integration
 */

namespace BitApps\Integrations\Actions\MoreConvertWishlist;

use WP_Error;

/**
 * Provide functionality for MoreConvert Wishlist integration
 */
class MoreConvertWishlistController
{
    public static function isExists()
    {
        if (!class_exists('WLFMC') || !class_exists('WLFMC_Wishlist_Factory')) {
            wp_send_json_error(
                __(
                    'MoreConvert Wishlist for WooCommerce is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function moreConvertWishlistAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshCustomers()
    {
        self::isExists();

        $customers = [];

        $allCustomers = \WLFMC_Wishlist_Factory::search_customer(
            [
                'user_id'    => false,
                'session_id' => false,
                'has_items'  => false,
            ]
        );

        foreach (\is_array($allCustomers) ? $allCustomers : [] as $customer) {
            $id = \is_object($customer) && method_exists($customer, 'get_id') ? $customer->get_id() : ($customer['id'] ?? 0);

            if (!$id) {
                continue;
            }

            $email = \is_object($customer) && method_exists($customer, 'get_email') ? $customer->get_email() : ($customer['email'] ?? '');
            $first = \is_object($customer) && method_exists($customer, 'get_first_name') ? $customer->get_first_name() : ($customer['first_name'] ?? '');
            $last  = \is_object($customer) && method_exists($customer, 'get_last_name') ? $customer->get_last_name() : ($customer['last_name'] ?? '');

            $name  = trim($first . ' ' . $last);
            $label = $email ? $email : ($name ? $name : __('Customer', 'bit-integrations'));

            $customers[] = (object) [
                'value' => (int) $id,
                'label' => $label . ' (#' . $id . ')',
            ];
        }

        wp_send_json_success(['customers' => $customers], 200);
    }

    public static function refreshUsers()
    {
        self::isExists();

        $users = array_map(
            function ($user) {
                $label = $user->display_name ? $user->display_name : $user->user_email;

                return (object) [
                    'value' => (int) $user->ID,
                    'label' => $label . ' (' . $user->user_email . ')',
                ];
            },
            get_users(['fields' => ['ID', 'display_name', 'user_email']])
        );

        wp_send_json_success(['users' => $users], 200);
    }

    public static function refreshWishlists()
    {
        self::isExists();

        $wishlists = [];

        $allWishlists = \WLFMC_Wishlist_Factory::get_wishlists(
            [
                'show_empty'       => false,
                'orderby'          => 'ID',
                'order'            => 'ASC',
                'return_wishlists' => true,
            ]
        );

        foreach (\is_array($allWishlists) ? $allWishlists : [] as $wishlist) {
            $id = \is_object($wishlist) && method_exists($wishlist, 'get_id') ? $wishlist->get_id() : ($wishlist['id'] ?? 0);

            if (!$id) {
                continue;
            }

            $name = '';
            if (\is_object($wishlist) && method_exists($wishlist, 'get_data')) {
                $data = $wishlist->get_data();
                $name = $data['formatted_name'] ?? '';
            } elseif (\is_array($wishlist)) {
                $name = $wishlist['formatted_name'] ?? '';
            }

            $label = ($name ? $name : __('Wishlist', 'bit-integrations')) . ' (#' . $id . ')';

            $wishlists[] = (object) [
                'value' => (int) $id,
                'label' => $label,
            ];
        }

        wp_send_json_success(['wishlists' => $wishlists], 200);
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
        $moreConvertWishlistResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($moreConvertWishlistResponse)) {
            return $moreConvertWishlistResponse;
        }

        return $moreConvertWishlistResponse;
    }
}
