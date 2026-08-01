<?php

/**
 * FluentCart Integration
 */

namespace BitApps\Integrations\Actions\FluentCart;

use WP_Error;

/**
 * Provide functionality for FluentCart integration
 */
class FluentCartController
{
    public static function isExists()
    {
        if (!\defined('FLUENTCART_PLUGIN_PATH')) {
            wp_send_json_error(
                __(
                    'FluentCart is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshProducts()
    {
        self::isExists();

        $products = [];

        if (class_exists('\FluentCart\App\Models\Product')) {
            $allProducts = \FluentCart\App\Models\Product::all();

            $products = array_map(
                function ($product) {
                    return (object) [
                        'product_id'   => $product['id'] ?? $product['ID'] ?? '',
                        'product_name' => $product['title'] ?? $product['post_title'] ?? '',
                    ];
                },
                $allProducts->toArray()
            );
        }

        $response['products'] = $products;
        wp_send_json_success($response, 200);
    }

    public function refreshCustomers()
    {
        self::isExists();

        $customers = [];

        if (class_exists('\FluentCart\App\Models\Customer')) {
            $allCustomers = \FluentCart\App\Models\Customer::all();

            $customers = array_map(
                function ($customer) {
                    return (object) [
                        'customer_id'   => $customer->id ?? $customer['id'],
                        'customer_name' => ($customer->first_name ?? '') . ' ' . ($customer->last_name ?? ''),
                        'email'         => $customer->email ?? $customer['email']
                    ];
                },
                $allCustomers->toArray()
            );
        }

        $response['customers'] = $customers;
        wp_send_json_success($response, 200);
    }

    public function refreshProductCategories()
    {
        self::isExists();

        $categories = get_terms(
            [
                'taxonomy'   => 'product-categories',
                'hide_empty' => false,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]
        );

        $allCategories = array_map(
            function ($category) {
                return (object) [
                    'value' => $category->term_id,
                    'label' => $category->name
                ];
            },
            $categories ?? []
        );

        $response['categories'] = $allCategories;
        wp_send_json_success($response, 200);
    }

    public function refreshProductBrands()
    {
        self::isExists();

        $brands = get_terms(
            [
                'taxonomy'   => 'product-brands',
                'hide_empty' => false,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]
        );

        $allBrands = array_map(
            function ($brand) {
                return (object) [
                    'value' => $brand->term_id,
                    'label' => $brand->name
                ];
            },
            $brands ?? []
        );

        $response['brands'] = $allBrands;
        wp_send_json_success($response, 200);
    }

    public function refreshProductShippingClasses()
    {
        self::isExists();

        $shippingClasses = [];

        if (class_exists('\\FluentCart\\App\\Models\\ShippingClass')) {
            $shippingClasses = array_map(
                function (array $shippingClass) {
                    return [
                        'value' => $shippingClass['id'],
                        'label' => $shippingClass['name'],
                    ];
                },
                \FluentCart\App\Models\ShippingClass::all()->toArray() ?? []
            );
        }

        $response['shippingClasses'] = $shippingClasses;
        wp_send_json_success($response, 200);
    }

    public function refreshOrderStatuses()
    {
        $statuses = [];

        if (class_exists('\\FluentCart\\App\\Helpers\\Status')) {
            $allStatuses = \FluentCart\App\Helpers\Status::getOrderStatuses();
        } else {
            $allStatuses = [
                'pending'    => 'Pending',
                'processing' => 'Processing',
                'completed'  => 'Completed',
                'cancelled'  => 'Cancelled',
                'on-hold'    => 'On Hold',
            ];
        }

        foreach ($allStatuses as $key => $label) {
            $statuses[] = (object) [
                'value' => $key,
                'label' => $label
            ];
        }

        $response['statuses'] = $statuses;
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
        $fluentCartResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($fluentCartResponse)) {
            return $fluentCartResponse;
        }

        return $fluentCartResponse;
    }
}
