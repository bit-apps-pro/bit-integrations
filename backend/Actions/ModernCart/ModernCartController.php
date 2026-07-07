<?php

/**
 * ModernCart Integration
 */

namespace BitApps\Integrations\Actions\ModernCart;

/**
 * Provide functionality for ModernCart integration
 */
class ModernCartController
{
    public static function isExists()
    {
        if (!\defined('MODERNCART_VER') && !class_exists('\ModernCart\Plugin_Loader')) {
            wp_send_json_error(__('Modern Cart is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function modernCartAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshProducts()
    {
        self::isExists();

        $products = [];

        if (\function_exists('wc_get_products')) {
            $allProducts = wc_get_products(
                [
                    'limit'  => -1,
                    'return' => 'objects',
                    'status' => ['publish', 'private'],
                ]
            );

            foreach ($allProducts as $product) {
                if (!$product instanceof \WC_Product) {
                    continue;
                }

                $products[] = (object) [
                    'product_id'   => $product->get_id(),
                    'product_name' => $product->get_name() ?: '#' . $product->get_id(),
                    'product_type' => $product->get_type(),
                ];
            }
        }

        wp_send_json_success(['products' => $products], 200);
    }

    public static function refreshProductVariations($request)
    {
        self::isExists();

        $productId = isset($request->productId) ? (int) $request->productId : 0;

        if (empty($productId)) {
            wp_send_json_error(__('Product ID is required', 'bit-integrations'), 400);
        }

        $product = \function_exists('wc_get_product') ? wc_get_product($productId) : null;
        $variations = [];

        if ($product instanceof \WC_Product && method_exists($product, 'get_children')) {
            foreach ($product->get_children() as $variationId) {
                $variation = wc_get_product((int) $variationId);

                if (!$variation instanceof \WC_Product) {
                    continue;
                }

                $variations[] = (object) [
                    'variation_id'   => $variation->get_id(),
                    'variation_name' => self::variationLabel($variation),
                ];
            }
        }

        wp_send_json_success(['variations' => $variations], 200);
    }

    public static function refreshCartItems()
    {
        self::isExists();

        if (!self::isWooCommerceAvailable()) {
            wp_send_json_error(__('WooCommerce cart is not available', 'bit-integrations'), 400);
        }

        $items = [];

        foreach (WC()->cart->get_cart() as $cartItemKey => $cartItem) {
            $product = $cartItem['data'] ?? null;
            $productName = $product instanceof \WC_Product ? $product->get_name() : '';
            $quantity = isset($cartItem['quantity']) ? (int) $cartItem['quantity'] : 0;

            $items[] = (object) [
                'cart_item_key' => (string) $cartItemKey,
                'cart_item_name' => ($productName ?: '#' . ($cartItem['product_id'] ?? $cartItemKey)) . ' x ' . $quantity,
            ];
        }

        wp_send_json_success(['cartItems' => $items], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map ?? [];

        return (new RecordApiHelper($integrationDetails, $integId))->execute($fieldValues, $fieldMap);
    }

    private static function isWooCommerceAvailable()
    {
        if (!\function_exists('WC')) {
            return false;
        }

        $wooCommerce = WC();

        if ($wooCommerce && empty($wooCommerce->cart) && \function_exists('wc_load_cart')) {
            wc_load_cart();
        }

        return $wooCommerce && !empty($wooCommerce->cart);
    }

    private static function variationLabel(\WC_Product $variation)
    {
        if (method_exists($variation, 'get_formatted_name')) {
            return wp_strip_all_tags($variation->get_formatted_name());
        }

        return $variation->get_name() ?: '#' . $variation->get_id();
    }
}
