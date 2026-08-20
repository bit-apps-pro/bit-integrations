<?php

namespace BitApps\Integrations\Triggers\WC;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\Hooks;
use WC_Product_Booking;

class WCHelper
{
    public static function accessBookingProductData($product)
    {
        if (!$product instanceof WC_Product_Booking) {
            return [];
        }

        return $product->get_data();
    }

    public static function process_booking_data($productData, $userData, $customer_id)
    {
        return [
            'product_id'   => $productData['id'],
            'product_name' => $productData['name'],
            'product_slug' => $productData['slug'],
            'product_status'            => $productData['status'],
            'product_featured'          => $productData['featured'],
            'product_description'       => $productData['description'],
            'product_short_description' => $productData['short_description'],
            'product_price'             => $productData['price'],
            'product_regular_price'     => $productData['regular_price'],
            'product_sale_price'        => $productData['sale_price'],
            'total_sales'               => $productData['total_sales'],
            'product_sku'          => $productData['sku'],
            'product_category_ids' => $productData['category_ids'],
            'stock_status'         => $productData['stock_status'],
            'image_url'           => wp_get_attachment_image_url((int) $productData['image_id'], 'full'),
            'cost'                => $productData['cost'],
            'display_cost'        => $productData['display_cost'],
            'qty'                 => $productData['qty'],
            'customer_id'         => $customer_id,
            'customer_email'      => $userData['user_email'],
            'customer_first_name' => $userData['first_name'],
            'customer_last_name'  => $userData['last_name'],
            'customer_nickname'   => $userData['nickname'],
            'avatar_url'          => $userData['avatar_url'],
        ];
    }

    public static function getAllWcProducts($id)
    {
        $products = wc_get_products(['status' => 'publish', 'limit' => -1]);

        $allProducts = [];
        foreach ($products as $product) {
            $productId = $product->get_id();
            $productTitle = $product->get_title();
            $productType = $product->get_type();
            $productSku = $product->get_sku();

            $allProducts[] = (object) [
                'product_id'    => $productId,
                'product_title' => $productTitle,
                'product_type'  => $productType,
                'product_sku'   => $productSku,
            ];

            if ($id == WCController::USER_REVIEWS_A_PRODUCT) {
                $allProducts = [['product_id' => 'any', 'product_title' => __('Any Product', 'bit-integrations'), 'product_type' => '', 'product_sku' => '']] + $allProducts;
            }
        }

        return $allProducts;
    }

    public static function getReviewRating($comment_ID)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for WC review rating
        $rating = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT meta_value FROM {$wpdb->prefix}commentmeta WHERE comment_id = %d AND meta_key = 'rating'",
                $comment_ID
            )
        );

        return $rating[0]->meta_value;
    }

    public static function getAllWcVariableProduct()
    {
        $products = wc_get_products(['status' => 'publish', 'limit' => -1, 'type' => 'variable']);
        $finalProduct = [['product_id' => 'any', 'product_title' => __('Any Product', 'bit-integrations')]];
        $allProducts = [];
        foreach ($products as $product) {
            $productId = $product->get_id();
            $productTitle = $product->get_title();

            $allProducts[] = (object) [
                'product_id'    => $productId,
                'product_title' => $productTitle,
            ];
        }

        foreach ($allProducts as $product) {
            $finalProduct[] = [
                'product_id'    => $product->product_id,
                'product_title' => $product->product_title,
            ];
        }

        return $finalProduct;
    }

    public static function getAllVariations($product_id)
    {
        if ($product_id === 'any') {
            $allVariations[] = (object) [
                'variation_id'    => 'any',
                'variation_title' => __('Any Variation', 'bit-integrations'),
            ];
        } elseif ($product_id !== '') {
            $product = wc_get_product($product_id);
            $variationType = array_key_first($product->get_attributes());

            $variations = $product->get_available_variations();
            $allVariations = [];
            foreach ($variations as $variation) {
                $variationId = $variation['variation_id'];
                $variationTitle = $variationType . ' ' . $variation['attributes']["attribute_{$variationType}"];

                $allVariations[] = (object) [
                    'variation_id'    => $variationId,
                    'variation_title' => $variationTitle,
                ];
            }
        }

        return $allVariations;
    }

    public static function processProductData($postId, $extra = [])
    {
        $product = wc_get_product($postId);
        $productData = self::accessProductData($product);
        $acfFieldGroups = Helper::acfGetFieldGroups(['product']);
        $acfFielddata = Helper::getAcfFieldData($acfFieldGroups, $postId);

        return array_merge($productData, $acfFielddata, $extra);
    }

    public static function processOrderData($orderId, $order = null, $extra = [])
    {
        $order = empty($order) ? wc_get_order($orderId) : $order;
        $orderData = self::accessOrderData($order);
        $acfFieldGroups = Helper::acfGetFieldGroups(['shop_order']);
        $acfFielddata = Helper::getAcfFieldData($acfFieldGroups, $orderId);
        $checkoutFields = Helper::getWCCustomCheckoutData($order);

        $flexibleFields = Hooks::apply(Config::withPrefix('woocommerce_flexible_checkout_fields_value'), (array) $order);

        if (empty($flexibleFields)) {
            /**
             * @deprecated 2.7.8 Use `bit_integrations_woocommerce_flexible_checkout_fields_value` filter instead.
             * @since 2.7.8
             */
            $flexibleFields = Hooks::apply('btcbi_woocommerce_flexible_checkout_fields_value', (array) $order);
        }

        return array_merge(
            $orderData,
            self::filteredEmptyValues($acfFielddata),
            self::filteredEmptyValues($checkoutFields),
            self::filteredEmptyValues($flexibleFields),
            self::filteredEmptyValues($extra)
        );
    }

    public static function accessOrderData($order)
    {
        $data = [
            'id'                          => $order->get_id() ?? '',
            'order_key'                   => $order->get_order_key() ?? '',
            'cart_tax'                    => $order->get_cart_tax() ?? '',
            'currency'                    => $order->get_currency() ?? '',
            'discount_tax'                => $order->get_discount_tax() ?? '',
            'discount_to_display'         => $order->get_discount_to_display() ?? '',
            'discount_total'              => $order->get_discount_total() ?? '',
            'fees'                        => $order->get_fees() ?? '',
            'shipping_tax'                => $order->get_shipping_tax() ?? '',
            'shipping_total'              => $order->get_shipping_total() ?? '',
            'tax_totals'                  => $order->get_tax_totals() ?? '',
            'total'                       => $order->get_total() ?? '',
            'total_refunded'              => $order->get_total_refunded() ?? '',
            'total_tax_refunded'          => $order->get_total_tax_refunded() ?? '',
            'total_shipping_refunded'     => $order->get_total_shipping_refunded() ?? '',
            'total_qty_refunded'          => $order->get_total_qty_refunded() ?? '',
            'remaining_refund_amount'     => $order->get_remaining_refund_amount() ?? '',
            'shipping_method'             => $order->get_shipping_method() ?? '',
            'date_created'                => \is_null($order->get_date_created()) ? $order->get_date_created() : $order->get_date_created()->format('Y-m-d H:i:s'),
            'date_modified'               => \is_null($order->get_date_modified()) ? $order->get_date_modified() : $order->get_date_modified()->format('Y-m-d H:i:s'),
            'date_completed'              => \is_null($order->get_date_completed()) ? $order->get_date_completed() : $order->get_date_completed()->format('Y-m-d H:i:s'),
            'date_paid'                   => \is_null($order->get_date_paid()) ? $order->get_date_paid() : $order->get_date_paid()->format('Y-m-d H:i:s'),
            'customer_id'                 => $order->get_customer_id() ?? '',
            'created_via'                 => $order->get_created_via() ?? '',
            'customer_note'               => $order->get_customer_note() ?? '',
            'billing_first_name'          => $order->get_billing_first_name() ?? '',
            'billing_last_name'           => $order->get_billing_last_name() ?? '',
            'billing_company'             => $order->get_billing_company() ?? '',
            'billing_address_1'           => $order->get_billing_address_1() ?? '',
            'billing_address_2'           => $order->get_billing_address_2() ?? '',
            'billing_city'                => $order->get_billing_city() ?? '',
            'billing_state'               => $order->get_billing_state() ?? '',
            'billing_postcode'            => $order->get_billing_postcode() ?? '',
            'billing_country'             => $order->get_billing_country() ?? '',
            'billing_email'               => $order->get_billing_email() ?? '',
            'billing_phone'               => $order->get_billing_phone() ?? '',
            'shipping_first_name'         => $order->get_shipping_first_name() ?? '',
            'shipping_last_name'          => $order->get_shipping_last_name() ?? '',
            'shipping_company'            => $order->get_shipping_company() ?? '',
            'shipping_address_1'          => $order->get_shipping_address_1() ?? '',
            'shipping_address_2'          => $order->get_shipping_address_2() ?? '',
            'shipping_city'               => $order->get_shipping_city() ?? '',
            'shipping_state'              => $order->get_shipping_state() ?? '',
            'shipping_postcode'           => $order->get_shipping_postcode() ?? '',
            'shipping_country'            => $order->get_shipping_country() ?? '',
            'payment_method'              => $order->get_payment_method() ?? '',
            'payment_method_title'        => $order->get_payment_method_title() ?? '',
            'status'                      => $order->get_status() ?? '',
            'checkout_order_received_url' => $order->get_checkout_order_received_url() ?? '',
            'line_items'                  => [],
            'product_names'               => '',
            'line_items_quantity'         => 0
        ];
        if (\defined('WC_VERSION') && version_compare(WC_VERSION, '8.5.1', '>=')) {
            $data += [
                '_wc_order_attribution_referrer'           => $order->get_meta('_wc_order_attribution_referrer'),
                '_wc_order_attribution_user_agent'         => $order->get_meta('_wc_order_attribution_user_agent'),
                '_wc_order_attribution_utm_source'         => $order->get_meta('_wc_order_attribution_utm_source'),
                '_wc_order_attribution_device_type'        => $order->get_meta('_wc_order_attribution_device_type'),
                '_wc_order_attribution_source_type'        => $order->get_meta('_wc_order_attribution_source_type'),
                '_wc_order_attribution_session_count'      => $order->get_meta('_wc_order_attribution_session_count'),
                '_wc_order_attribution_session_entry'      => $order->get_meta('_wc_order_attribution_session_entry'),
                '_wc_order_attribution_session_pages'      => $order->get_meta('_wc_order_attribution_session_pages'),
                '_wc_order_attribution_session_start_time' => $order->get_meta('_wc_order_attribution_session_start_time'),
            ];
        }

        foreach ($order->get_items() as $item) {
            if (empty($item)) {
                continue;
            }

            $productId = $item->get_product_id();
            $product = $item->get_product();

            $itemData = [
                'product_id'         => $productId,
                'variation_id'       => $item->get_variation_id() ?? '',
                'product_name'       => $item->get_name() ?? '',
                'quantity'           => $item->get_quantity() ?? '',
                'subtotal'           => $item->get_subtotal() ?? '',
                'total'              => $item->get_total() ?? '',
                'subtotal_tax'       => $item->get_subtotal_tax() ?? '',
                'tax_class'          => $item->get_tax_class() ?? '',
                'tax_status'         => $item->get_tax_status() ?? '',
                'product_sku'        => $product && $product->get_sku() ? $product->get_sku() : '',
                'product_unit_price' => $product && $product->get_price() ? $product->get_price() : '',
            ];

            $acfFieldGroups = Helper::acfGetFieldGroups(['product']);
            $acfFielddata = Helper::getAcfFieldData($acfFieldGroups, $productId);

            $data['line_items'][] = (object) array_merge($itemData, $acfFielddata);
        }

        $data['product_names'] = implode(', ', array_column($data['line_items'], 'product_name'));
        $data['line_items_quantity'] = \count($data['line_items']);

        return $data;
    }

    public static function accessProductData($product)
    {
        if (empty($product)) {
            return [];
        }

        $productId = $product->get_id();
        $imageUrl = wp_get_attachment_image_url($product->get_image_id(), 'full');
        $imageIds = $product->get_gallery_image_ids();
        $galleryImages = [];

        if (\count($imageIds)) {
            foreach ($imageIds as $id) {
                $galleryImages[] = wp_get_attachment_image_url($id, 'full');
            }
        }

        return [
            'post_id'                => $productId,
            'post_title'             => $product->get_name(),
            'post_content'           => $product->get_description(),
            'post_excerpt'           => $product->get_short_description(),
            'post_date'              => $product->get_date_created(),
            'post_date_gmt'          => $product->get_date_modified(),
            'post_status'            => $product->get_status(),
            'tags_input'             => $product->get_tag_ids(),
            'post_category'          => wc_get_product_category_list($productId),
            '_visibility'            => $product->get_catalog_visibility(),
            '_featured'              => $product->get_featured(),
            '_regular_price'         => $product->get_regular_price(),
            '_sale_price'            => $product->get_sale_price(),
            '_sale_price_dates_from' => $product->get_date_on_sale_from(),
            '_sale_price_dates_to'   => $product->get_date_on_sale_to(),
            '_sku'                   => $product->get_sku(),
            '_manage_stock'          => $product->get_manage_stock(),
            '_stock'                 => $product->get_stock_quantity(),
            '_backorders'            => $product->get_backorders(),
            '_low_stock_amount'      => 1,
            '_stock_status'          => $product->get_stock_status(),
            '_sold_individually'     => $product->get_sold_individually(),
            '_weight'                => $product->get_weight(),
            '_length'                => $product->get_length(),
            '_width'                 => $product->get_width(),
            '_height'                => $product->get_height(),
            '_purchase_note'         => $product->get_purchase_note(),
            'menu_order'             => $product->get_menu_order(),
            'comment_status'         => $product->get_reviews_allowed(),
            '_virtual'               => $product->get_virtual(),
            '_downloadable'          => $product->get_downloadable(),
            '_download_limit'        => $product->get_download_limit(),
            '_download_expiry'       => $product->get_download_expiry(),
            'product_type'           => $product->get_type(),
            '_product_url'           => get_permalink($productId),
            '_tax_status'            => $product->get_tax_status(),
            '_tax_class'             => $product->get_tax_class(),
            '_product_image'         => $imageUrl,
            '_product_gallery'       => $galleryImages,
        ];
    }

    private static function filteredEmptyValues($data)
    {
        return array_filter((array) $data, function ($v) {
            return $v !== '' && $v !== null && $v !== [];
        });
    }
}
