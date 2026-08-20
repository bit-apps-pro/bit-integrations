<?php

namespace BitApps\Integrations\Triggers\WC;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\Hooks;

class WCStaticFields
{
    public static function getWCOrderFields($id)
    {
        $fields = array_merge(static::checkoutBasicFields(), static::getOrderACFFields(['shop_order']), static::getCheckoutCustomFields(), static::getFlexibleCheckoutFields());

        if (\defined('WC_VERSION') && version_compare(WC_VERSION, '8.5.1', '>=')) {
            $fields = array_merge($fields, static::checkoutUpgradeFields());
        }

        if ($id == WCController::ORDER_SPECIFIC_PRODUCT) {
            $fields = array_merge($fields, static::specificOrderProductFields());
        } elseif ($id == WCController::ORDER_SPECIFIC_CATEGORY) {
            $fields = array_merge([
                'specified_product_by_category' => (object) [
                    'fieldKey'  => 'specified_product_by_category',
                    'fieldName' => __('Specified Product By Category', 'bit-integrations')
                ],
            ], $fields);
        }

        return $fields;
    }

    public static function getWCProductFields($metabox)
    {
        return array_merge(static::wcProductFields(), static::getOrderACFFields(['product']), $metabox['meta_fields']);
    }

    public static function getWCProductUploadFields($metabox)
    {
        return array_merge($metabox['upload_fields'], [
            'Product Image' => (object) [
                'fieldKey'  => '_product_image',
                'fieldName' => 'Product Image'
            ],
            'Product Gallery' => (object) [
                'fieldKey'  => '_product_gallery',
                'fieldName' => 'Product Gallery'
            ],
        ]);
    }

    public static function getWCCustomerFields($id)
    {
        return $id === WCController::CUSTOMER_CREATED ? self::wcUserFields() : self::wcCustomerFields();
    }

    public static function getReviewFields()
    {
        return [
            'Product Id' => (object) [
                'fieldKey'  => 'product_id',
                'fieldName' => __('Product Id', 'bit-integrations')
            ],
            'Product Title' => (object) [
                'fieldKey'  => 'product_title',
                'fieldName' => __('Product Title', 'bit-integrations')
            ],
            'Product Url' => (object) [
                'fieldKey'  => 'product_url',
                'fieldName' => __('Product Url', 'bit-integrations')
            ],
            'Product Price' => (object) [
                'fieldKey'  => 'product_price',
                'fieldName' => __('Product Price', 'bit-integrations')
            ],
            'Product Review' => (object) [
                'fieldKey'  => 'product_review',
                'fieldName' => __('Product Review', 'bit-integrations')
            ],
            'Product Sku' => (object) [
                'fieldKey'  => 'product_sku',
                'fieldName' => __('Product Sku', 'bit-integrations')
            ],
            'Product Tags' => (object) [
                'fieldKey'  => 'product_tags',
                'fieldName' => __('Product Tags', 'bit-integrations')
            ],
            'Product Categories' => (object) [
                'fieldKey'  => 'product_categories',
                'fieldName' => __('Product Categories', 'bit-integrations')
            ],
            'Product Rating' => (object) [
                'fieldKey'  => 'product_rating',
                'fieldName' => __('Product Rating', 'bit-integrations')
            ],
            'Review Id' => (object) [
                'fieldKey'  => 'review_id',
                'fieldName' => __('Review Id', 'bit-integrations')
            ],
            'Review Date' => (object) [
                'fieldKey'  => 'review_date',
                'fieldName' => __('Review Date', 'bit-integrations')
            ],
            'Author Id' => (object) [
                'fieldKey'  => 'author_id',
                'fieldName' => __('Author Id', 'bit-integrations')
            ],
            'Review Author Name' => (object) [
                'fieldKey'  => 'review_author_name',
                'fieldName' => __('Review Author Name', 'bit-integrations')
            ],
            'Author Email' => (object) [
                'fieldKey'  => 'author_email',
                'fieldName' => __('Author Email', 'bit-integrations')
            ],
        ];
    }

    public static function getCouponFields()
    {
        return [
            'Coupon Id' => (object) [
                'fieldKey'  => 'coupon_id',
                'fieldName' => __('Coupon Id', 'bit-integrations')
            ],
            'Coupon Code' => (object) [
                'fieldKey'  => 'coupon_code',
                'fieldName' => __('Coupon Code', 'bit-integrations')
            ],
            'Coupon Amount' => (object) [
                'fieldKey'  => 'coupon_amount',
                'fieldName' => __('Coupon Amount', 'bit-integrations')
            ],
            'Coupon Status' => (object) [
                'fieldKey'  => 'coupon_status',
                'fieldName' => __('Coupon Status', 'bit-integrations')
            ],
            'Discount Type' => (object) [
                'fieldKey'  => 'discount_type',
                'fieldName' => __('Discount Type', 'bit-integrations')
            ],
            'Description' => (object) [
                'fieldKey'  => 'description',
                'fieldName' => __('Description', 'bit-integrations')
            ],
            'Date Created' => (object) [
                'fieldKey'  => 'date_created',
                'fieldName' => __('Date Created', 'bit-integrations')
            ],
            'Website' => (object) [
                'fieldKey'  => 'date_modified',
                'fieldName' => __('Website', 'bit-integrations')
            ],
            'Date Expires' => (object) [
                'fieldKey'  => 'date_expires',
                'fieldName' => __('Date Expires', 'bit-integrations')
            ],
            'Usage Count' => (object) [
                'fieldKey'  => 'usage_count',
                'fieldName' => __('Usage Count', 'bit-integrations')
            ],
            'Usage Limit' => (object) [
                'fieldKey'  => 'usage_limit',
                'fieldName' => __('Usage Limit', 'bit-integrations')
            ],
            'Usage Limit Per User' => (object) [
                'fieldKey'  => 'usage_limit_per_user',
                'fieldName' => __('Usage Limit Per User', 'bit-integrations')
            ],
            'Limit Usage To x Items' => (object) [
                'fieldKey'  => 'limit_usage_to_x_items',
                'fieldName' => __('Limit Usage To x Items', 'bit-integrations')
            ],
            'Free Shipping' => (object) [
                'fieldKey'  => 'free_shipping',
                'fieldName' => __('Free Shipping', 'bit-integrations')
            ],
            'Exclude Sale Items' => (object) [
                'fieldKey'  => 'exclude_sale_items',
                'fieldName' => __('Exclude Sale Items', 'bit-integrations')
            ],
            'Minimum Amount' => (object) [
                'fieldKey'  => 'minimum_amount',
                'fieldName' => __('Minimum Amount', 'bit-integrations')
            ],
            'Maximum Amount' => (object) [
                'fieldKey'  => 'maximum_amount',
                'fieldName' => __('Maximum Amount', 'bit-integrations')
            ],
            'Virtual' => (object) [
                'fieldKey'  => 'virtual',
                'fieldName' => __('Virtual', 'bit-integrations')
            ],
        ];
    }

    public static function getAddToCartFields()
    {
        return [
            'Cart Item Key' => (object) [
                'fieldKey'  => 'cart_item_key',
                'fieldName' => __('Cart Item Key', 'bit-integrations')
            ],
            'Product Id' => (object) [
                'fieldKey'  => 'product_id',
                'fieldName' => __('Product Id', 'bit-integrations')
            ],
            'Quantity' => (object) [
                'fieldKey'  => 'quantity',
                'fieldName' => __('Quantity', 'bit-integrations')
            ],
            'Variation Id' => (object) [
                'fieldKey'  => 'variation_id',
                'fieldName' => __('Variation Id', 'bit-integrations')
            ],
            'Variation' => (object) [
                'fieldKey'  => 'variation',
                'fieldName' => __('Variation', 'bit-integrations')
            ],
            'Cart Item Data' => (object) [
                'fieldKey'  => 'cart_item_data',
                'fieldName' => __('Cart Item Data', 'bit-integrations')
            ],
            'Cart Total' => (object) [
                'fieldKey'  => 'cart_total',
                'fieldName' => __('Cart Total', 'bit-integrations')
            ],
            'Cart Line Items' => (object) [
                'fieldKey'  => 'cart_line_items',
                'fieldName' => __('Cart Line Items', 'bit-integrations')
            ]
        ];
    }

    public static function getRemoveFromCartFields()
    {
        return [
            'Cart Item Key' => (object) [
                'fieldKey'  => 'cart_item_key',
                'fieldName' => __('Cart Item Key', 'bit-integrations')
            ],
            'Applied Coupons' => (object) [
                'fieldKey'  => 'applied_coupons',
                'fieldName' => __('Applied Coupons', 'bit-integrations')
            ],
            'Cart Session Data' => (object) [
                'fieldKey'  => 'cart_session_data',
                'fieldName' => __('Cart Session Data', 'bit-integrations')
            ],
            'Removed Cart Contents' => (object) [
                'fieldKey'  => 'removed_cart_contents',
                'fieldName' => __('Removed Cart Contents', 'bit-integrations')
            ]
        ];
    }

    private static function getOrderACFFields($type = [])
    {
        if (!class_exists('ACF')) {
            return [];
        }

        $fields = [];
        $acfFieldGroups = Helper::acfGetFieldGroups($type);

        foreach ($acfFieldGroups as $group) {
            $acfFields = acf_get_fields($group['ID']);

            foreach ($acfFields as $field) {
                $fields[$field['label']] = (object) [
                    'fieldKey'  => $field['_name'],
                    'fieldName' => $field['label']
                ];
            }
        }

        return $fields;
    }

    private static function getCheckoutCustomFields()
    {
        $fields = [];
        $checkoutFields = WC()->checkout()->get_checkout_fields();

        foreach ($checkoutFields as $groupKey => $group) {
            foreach ($group as $fieldKey => $field) {
                if (strpos($fieldKey, "{$groupKey}_wcj_checkout_field_") !== false) {
                    $fieldName = $field['name'] ?? $fieldKey;

                    $fields[$fieldName] = (object) [
                        'fieldKey'  => $fieldName,
                        'fieldName' => $field['label']
                    ];

                    continue;
                }

                if (!empty($field['custom']) && $field['custom']) {
                    $fields[$field['name']] = (object) [
                        'fieldKey'  => $field['name'],
                        'fieldName' => $field['label']
                    ];
                }
            }
        }

        return $fields;
    }

    private static function getFlexibleCheckoutFields()
    {
        $fields = Hooks::apply(Config::withPrefix('woocommerce_flexible_checkout_fields'), []);

        if (empty($fields)) {
            /**
             * @deprecated 2.7.8 Use `bit_integrations_woocommerce_flexible_checkout_fields` filter instead.
             * @since 2.7.8
             */
            $fields = Hooks::apply('btcbi_woocommerce_flexible_checkout_fields', []);
        }

        return $fields;
    }

    private static function checkoutBasicFields()
    {
        return [
            'Id' => (object) [
                'fieldKey'  => 'id',
                'fieldName' => __('Order Id', 'bit-integrations')
            ],
            'Order key' => (object) [
                'fieldKey'  => 'order_key',
                'fieldName' => __('Order Key', 'bit-integrations')
            ],
            'cart_tax' => (object) [
                'fieldKey'  => 'cart_tax',
                'fieldName' => __('Cart Tax', 'bit-integrations')
            ],
            'Currency' => (object) [
                'fieldKey'  => 'currency',
                'fieldName' => __('Currency', 'bit-integrations')
            ],
            'discount tax' => (object) [
                'fieldKey'  => 'discount_tax',
                'fieldName' => __('Discount Tax', 'bit-integrations')
            ],
            'discount_to_display' => (object) [
                'fieldKey'  => 'discount_to_display',
                'fieldName' => __('Discount To Display', 'bit-integrations')
            ],
            'discount total' => (object) [
                'fieldKey'  => 'discount_total',
                'fieldName' => __('Discount Total', 'bit-integrations')
            ],
            'shipping_tax' => (object) [
                'fieldKey'  => 'shipping_tax',
                'fieldName' => __('Shipping Tax', 'bit-integrations')
            ],
            'shipping total' => (object) [
                'fieldKey'  => 'shipping_total',
                'fieldName' => __('Shipping Total', 'bit-integrations')
            ],
            'total_tax' => (object) [
                'fieldKey'  => 'total_tax',
                'fieldName' => __('Total Tax', 'bit-integrations')
            ],
            'total' => (object) [
                'fieldKey'  => 'total',
                'fieldName' => __('Total', 'bit-integrations')
            ],
            'total_refunded' => (object) [
                'fieldKey'  => 'total_refunded',
                'fieldName' => __('Total Refunded', 'bit-integrations')
            ],
            'tax_refunded' => (object) [
                'fieldKey'  => 'tax_refunded',
                'fieldName' => __('Tax Refunded', 'bit-integrations')
            ],
            'total_shipping_refunded' => (object) [
                'fieldKey'  => 'total_shipping_refunded',
                'fieldName' => __('Total Shipping Refunded', 'bit-integrations')
            ],
            'total_qty_refunded' => (object) [
                'fieldKey'  => 'total_qty_refunded',
                'fieldName' => __('Total Qty Refunded', 'bit-integrations')
            ],
            'remaining_refund_amount' => (object) [
                'fieldKey'  => 'remaining_refund_amount',
                'fieldName' => __('remaining_refund_amount', 'bit-integrations')
            ],
            'Status' => (object) [
                'fieldKey'  => 'status',
                'fieldName' => __('Status', 'bit-integrations')
            ],
            'shipping_method' => (object) [
                'fieldKey'  => 'shipping_method',
                'fieldName' => __('shipping method', 'bit-integrations')
            ],
            'Created via' => (object) [
                'fieldKey'  => 'created_via',
                'fieldName' => __('Created Via', 'bit-integrations')
            ],
            'Date created' => (object) [
                'fieldKey'  => 'date_created',
                'fieldName' => __('Date created', 'bit-integrations')
            ],
            'date modified' => (object) [
                'fieldKey'  => 'date_modified',
                'fieldName' => __('Date Modified', 'bit-integrations')
            ],
            'date completed' => (object) [
                'fieldKey'  => 'date_completed',
                'fieldName' => __('Date completed', 'bit-integrations')
            ],
            'date paid' => (object) [
                'fieldKey'  => 'date_paid',
                'fieldName' => __('Date paid', 'bit-integrations')
            ],

            'prices_include_tax' => (object) [
                'fieldKey'  => 'prices_include_tax',
                'fieldName' => __('Prices Include Tax', 'bit-integrations')
            ],
            'customer_id' => (object) [
                'fieldKey'  => 'customer_id',
                'fieldName' => __('Customer Id', 'bit-integrations')
            ],
            'Billing First Name' => (object) [
                'fieldKey'  => 'billing_first_name',
                'fieldName' => __('Billing First Name', 'bit-integrations')
            ],
            'Billing Last Name' => (object) [
                'fieldKey'  => 'billing_last_name',
                'fieldName' => __('Billing Last Name', 'bit-integrations')
            ],
            'Billing Company' => (object) [
                'fieldKey'  => 'billing_company',
                'fieldName' => __('Billing Company', 'bit-integrations')
            ],
            'Billing Address 1' => (object) [
                'fieldKey'  => 'billing_address_1',
                'fieldName' => __('Billing Address 1', 'bit-integrations')
            ],
            'Billing Address 2' => (object) [
                'fieldKey'  => 'billing_address_2',
                'fieldName' => __('Billing Address 2', 'bit-integrations')
            ],
            'Billing City' => (object) [
                'fieldKey'  => 'billing_city',
                'fieldName' => __('Billing City', 'bit-integrations')
            ],
            'Billing Post Code' => (object) [
                'fieldKey'  => 'billing_postcode',
                'fieldName' => __('Billing Post Code', 'bit-integrations')
            ],
            'Billing Country' => (object) [
                'fieldKey'  => 'billing_country',
                'fieldName' => __('Billing Country', 'bit-integrations')
            ],
            'Billing State' => (object) [
                'fieldKey'  => 'billing_state',
                'fieldName' => __('Billing State', 'bit-integrations')
            ],
            'Billing Email' => (object) [
                'fieldKey'  => 'billing_email',
                'fieldName' => __('Billing Email', 'bit-integrations')
            ],
            'Billing Phone' => (object) [
                'fieldKey'  => 'billing_phone',
                'fieldName' => __('Billing Phone', 'bit-integrations')
            ],
            'Shipping First Name' => (object) [
                'fieldKey'  => 'shipping_first_name',
                'fieldName' => __('Shipping First Name', 'bit-integrations')
            ],
            'Shipping Last Name' => (object) [
                'fieldKey'  => 'shipping_last_name',
                'fieldName' => __('Shipping Last Name', 'bit-integrations')
            ],
            'Shipping Company' => (object) [
                'fieldKey'  => 'shipping_company',
                'fieldName' => __('Shipping Company', 'bit-integrations')
            ],
            'Shipping Address 1' => (object) [
                'fieldKey'  => 'shipping_address_1',
                'fieldName' => __('Shipping Address 1', 'bit-integrations')
            ],
            'Shipping Address 2' => (object) [
                'fieldKey'  => 'shipping_address_2',
                'fieldName' => __('Shipping Address 2', 'bit-integrations')
            ],
            'Shipping City' => (object) [
                'fieldKey'  => 'shipping_city',
                'fieldName' => __('Shipping City', 'bit-integrations')
            ],
            'Shipping Post Code' => (object) [
                'fieldKey'  => 'shipping_postcode',
                'fieldName' => __('Shipping Post Code', 'bit-integrations')
            ],
            'Shipping Country' => (object) [
                'fieldKey'  => 'shipping_country',
                'fieldName' => __('Shipping Country', 'bit-integrations')
            ],
            'Payment Method' => (object) [
                'fieldKey'  => 'payment_method',
                'fieldName' => __('Payment Method', 'bit-integrations')
            ],
            'Payment Method Title' => (object) [
                'fieldKey'  => 'payment_method_title',
                'fieldName' => __('Payment Method Title', 'bit-integrations')
            ],
            'Line Items' => (object) [
                'fieldKey'  => 'line_items',
                'fieldName' => __('Line Items', 'bit-integrations')
            ],
            'Line Items Quantity' => (object) [
                'fieldKey'  => 'line_items_quantity',
                'fieldName' => __('Line Items Quantity', 'bit-integrations')
            ],
            'Product Names' => (object) [
                'fieldKey'  => 'product_names',
                'fieldName' => __('Product Names', 'bit-integrations')
            ],
            'Order Receive URl' => (object) [
                'fieldKey'  => 'order_received_url',
                'fieldName' => __('order_received_url', 'bit-integrations')
            ],
            'Customer Note' => (object) [
                'fieldKey'  => 'customer_note',
                'fieldName' => __('Customer Note', 'bit-integrations')
            ],
        ];
    }

    private static function checkoutUpgradeFields()
    {
        return [
            'Device Type' => (object) [
                'fieldKey'  => '_wc_order_attribution_device_type',
                'fieldName' => __('Device Type', 'bit-integrations')
            ],
            'Referring source' => (object) [
                'fieldKey'  => '_wc_order_attribution_referrer',
                'fieldName' => __('Referring source', 'bit-integrations')
            ],
            'Session Count' => (object) [
                'fieldKey'  => '_wc_order_attribution_session_count',
                'fieldName' => __('Session Count', 'bit-integrations')
            ],
            'Session Entry' => (object) [
                'fieldKey'  => '_wc_order_attribution_session_entry',
                'fieldName' => __('Session Entry', 'bit-integrations')
            ],
            'Session page views' => (object) [
                'fieldKey'  => '_wc_order_attribution_session_pages',
                'fieldName' => __('Session page views', 'bit-integrations')
            ],
            'Session Start Time' => (object) [
                'fieldKey'  => '_wc_order_attribution_session_start_time',
                'fieldName' => __('Session Start Time', 'bit-integrations')
            ],
            'Source Type' => (object) [
                'fieldKey'  => '_wc_order_attribution_source_type',
                'fieldName' => __('Source Type', 'bit-integrations')
            ],
            'User Agent' => (object) [
                'fieldKey'  => '_wc_order_attribution_user_agent',
                'fieldName' => __('User Agent', 'bit-integrations')
            ],
            'Origin' => (object) [
                'fieldKey'  => '_wc_order_attribution_utm_source',
                'fieldName' => __('Origin', 'bit-integrations')
            ],
        ];
    }

    private static function specificOrderProductFields()
    {
        return [
            'product_id' => (object) [
                'fieldKey'  => 'product_id',
                'fieldName' => __('Product Id', 'bit-integrations')
            ],
            'variation_id' => (object) [
                'fieldKey'  => 'variation_id',
                'fieldName' => __('Variation Id', 'bit-integrations')
            ],
            'product_name' => (object) [
                'fieldKey'  => 'product_name',
                'fieldName' => __('Product Name', 'bit-integrations')
            ],
            'quantity' => (object) [
                'fieldKey'  => 'quantity',
                'fieldName' => __('Quantity', 'bit-integrations')
            ],
            'subtotal' => (object) [
                'fieldKey'  => 'subtotal',
                'fieldName' => __('Subtotal', 'bit-integrations')
            ],
            'total' => (object) [
                'fieldKey'  => 'total',
                'fieldName' => __('Total', 'bit-integrations')
            ],
            'subtotal_tax' => (object) [
                'fieldKey'  => 'subtotal_tax',
                'fieldName' => __('Subtotal Tax', 'bit-integrations')
            ],
            'tax_class' => (object) [
                'fieldKey'  => 'tax_class',
                'fieldName' => __('Tax Class', 'bit-integrations')
            ],
            'tax_status' => (object) [
                'fieldKey'  => 'tax_status',
                'fieldName' => __('Tax Status', 'bit-integrations')
            ],
        ];
    }

    private static function wcProductFields()
    {
        return [
            'Product Name' => (object) [
                'fieldKey'  => 'post_title',
                'fieldName' => __('Product Name', 'bit-integrations'),
                'required'  => true
            ],
            'Product Description' => (object) [
                'fieldKey'  => 'post_content',
                'fieldName' => __('Product Description', 'bit-integrations')
            ],
            'Product Short Description' => (object) [
                'fieldKey'  => 'post_excerpt',
                'fieldName' => __('Product Short Description', 'bit-integrations')
            ],
            'Product ID' => (object) [
                'fieldKey'  => 'post_id',
                'fieldName' => __('Product ID', 'bit-integrations')
            ],
            'Post Date' => (object) [
                'fieldKey'  => 'post_date',
                'fieldName' => __('Post Date', 'bit-integrations')
            ],
            'Post Date GMT' => (object) [
                'fieldKey'  => 'post_date_gmt',
                'fieldName' => __('Post Date GMT', 'bit-integrations')
            ],
            'Product Status' => (object) [
                'fieldKey'  => 'post_status',
                'fieldName' => __('Product Status', 'bit-integrations')
            ],
            'Product Tag' => (object) [
                'fieldKey'  => 'tags_input',
                'fieldName' => __('Product Tag', 'bit-integrations')
            ],
            'Product Category' => (object) [
                'fieldKey'  => 'post_category',
                'fieldName' => __('Product Category', 'bit-integrations')
            ],
            'Catalog Visibility' => (object) [
                'fieldKey'  => '_visibility',
                'fieldName' => __('Catalog Visibility', 'bit-integrations')
            ],
            'Featured Product' => (object) [
                'fieldKey'  => '_featured',
                'fieldName' => __('Featured Product', 'bit-integrations')
            ],
            'Regular Price' => (object) [
                'fieldKey'  => '_regular_price',
                'fieldName' => __('Regular Price', 'bit-integrations')
            ],
            'Sale Price' => (object) [
                'fieldKey'  => '_sale_price',
                'fieldName' => __('Sale Price', 'bit-integrations')
            ],
            'Sale Price From Date' => (object) [
                'fieldKey'  => '_sale_price_dates_from',
                'fieldName' => __('Sale Price From Date', 'bit-integrations')
            ],
            'Sale Price To Date' => (object) [
                'fieldKey'  => '_sale_price_dates_to',
                'fieldName' => __('Sale Price To Date', 'bit-integrations')
            ],
            'SKU' => (object) [
                'fieldKey'  => '_sku',
                'fieldName' => __('SKU', 'bit-integrations')
            ],
            'Manage Stock' => (object) [
                'fieldKey'  => '_manage_stock',
                'fieldName' => __('Manage Stock', 'bit-integrations')
            ],
            'Stock Quantity' => (object) [
                'fieldKey'  => '_stock',
                'fieldName' => __('Stock Quantity', 'bit-integrations')
            ],
            'Allow Backorders' => (object) [
                'fieldKey'  => '_backorders',
                'fieldName' => __('Allow Backorders', 'bit-integrations')
            ],
            'Low Stock Threshold' => (object) [
                'fieldKey'  => '_low_stock_amount',
                'fieldName' => __('Low Stock Threshold', 'bit-integrations')
            ],
            'Stock Status' => (object) [
                'fieldKey'  => '_stock_status',
                'fieldName' => __('Stock Status', 'bit-integrations')
            ],
            'Sold Individually' => (object) [
                'fieldKey'  => '_sold_individually',
                'fieldName' => __('Sold Individually', 'bit-integrations')
            ],
            'Weight' => (object) [
                'fieldKey'  => '_weight',
                'fieldName' => __('Weight', 'bit-integrations')
            ],
            'Length' => (object) [
                'fieldKey'  => '_length',
                'fieldName' => __('Length', 'bit-integrations')
            ],
            'Width' => (object) [
                'fieldKey'  => '_width',
                'fieldName' => __('Width', 'bit-integrations')
            ],
            'Height' => (object) [
                'fieldKey'  => '_height',
                'fieldName' => __('Height', 'bit-integrations')
            ],
            'Purchase Note' => (object) [
                'fieldKey'  => '_purchase_note',
                'fieldName' => __('Purchase Note', 'bit-integrations')
            ],
            'Menu Order' => (object) [
                'fieldKey'  => 'menu_order',
                'fieldName' => __('Menu Order', 'bit-integrations')
            ],
            'Enable Reviews' => (object) [
                'fieldKey'  => 'comment_status',
                'fieldName' => __('Enable Reviews', 'bit-integrations')
            ],
            'Virtual' => (object) [
                'fieldKey'  => '_virtual',
                'fieldName' => __('Virtual', 'bit-integrations')
            ],
            'Downloadable' => (object) [
                'fieldKey'  => '_downloadable',
                'fieldName' => __('Downloadable', 'bit-integrations')
            ],
            'Download Limit' => (object) [
                'fieldKey'  => '_download_limit',
                'fieldName' => __('Download Limit', 'bit-integrations')
            ],
            'Download Expiry' => (object) [
                'fieldKey'  => '_download_expiry',
                'fieldName' => __('Download Expiry', 'bit-integrations')
            ],
            'Product Type' => (object) [
                'fieldKey'  => 'product_type',
                'fieldName' => __('Product Type', 'bit-integrations')
            ],
            'Product URL' => (object) [
                'fieldKey'  => '_product_url',
                'fieldName' => __('Product URL', 'bit-integrations')
            ]
        ];
    }

    private static function wcUserFields()
    {
        return [
            'First Name' => (object) [
                'fieldKey'  => 'first_name',
                'fieldName' => __('First Name', 'bit-integrations')
            ],
            'Last Name' => (object) [
                'fieldKey'  => 'last_name',
                'fieldName' => __('Last Name', 'bit-integrations')
            ],
            'Email' => (object) [
                'fieldKey'  => 'user_email',
                'fieldName' => __('Email', 'bit-integrations')
            ],
            'Username' => (object) [
                'fieldKey'  => 'user_login',
                'fieldName' => __('Username', 'bit-integrations')
            ],
            'Password' => (object) [
                'fieldKey'  => 'user_pass',
                'fieldName' => __('Password', 'bit-integrations')
            ],
            'Display Name' => (object) [
                'fieldKey'  => 'display_name',
                'fieldName' => __('Display Name', 'bit-integrations')
            ],
            'Nickname' => (object) [
                'fieldKey'  => 'nickname',
                'fieldName' => __('Nickname', 'bit-integrations')
            ],
            'Website' => (object) [
                'fieldKey'  => 'user_url',
                'fieldName' => __('Website', 'bit-integrations')
            ],
        ];
    }

    private static function wcCustomerFields()
    {
        return [
            'Customer ID' => (object) [
                'fieldKey'  => 'customer_id',
                'fieldName' => __('Customer Id', 'bit-integrations')
            ],
            'First Name' => (object) [
                'fieldKey'  => 'first_name',
                'fieldName' => __('First Name', 'bit-integrations')
            ],
            'Last Name' => (object) [
                'fieldKey'  => 'last_name',
                'fieldName' => __('Last Name', 'bit-integrations')
            ],
            'Email' => (object) [
                'fieldKey'  => 'user_email',
                'fieldName' => __('Email', 'bit-integrations')
            ],
            'Username' => (object) [
                'fieldKey'  => 'user_login',
                'fieldName' => __('Username', 'bit-integrations')
            ],
            'Password' => (object) [
                'fieldKey'  => 'user_pass',
                'fieldName' => __('Password', 'bit-integrations')
            ],
            'Display Name' => (object) [
                'fieldKey'  => 'display_name',
                'fieldName' => __('Display Name', 'bit-integrations')
            ],
            'Nickname' => (object) [
                'fieldKey'  => 'nickname',
                'fieldName' => __('Nickname', 'bit-integrations')
            ],
            'Locale' => (object) [
                'fieldKey'  => 'locale',
                'fieldName' => __('Locale', 'bit-integrations')
            ],
            'Website' => (object) [
                'fieldKey'  => 'user_url',
                'fieldName' => __('Website', 'bit-integrations')
            ],
            'Billing First Name' => (object) [
                'fieldKey'  => 'billing_first_name',
                'fieldName' => __('Billing First Name', 'bit-integrations')
            ],
            'Billing Last Name' => (object) [
                'fieldKey'  => 'billing_last_name',
                'fieldName' => __('Billing Last Name', 'bit-integrations')
            ],
            'Billing Company' => (object) [
                'fieldKey'  => 'billing_company',
                'fieldName' => __('Billing Company', 'bit-integrations')
            ],
            'Billing Address 1' => (object) [
                'fieldKey'  => 'billing_address_1',
                'fieldName' => __('Billing Address 1', 'bit-integrations')
            ],
            'Billing Address 2' => (object) [
                'fieldKey'  => 'billing_address_2',
                'fieldName' => __('Billing Address 2', 'bit-integrations')
            ],
            'Billing City' => (object) [
                'fieldKey'  => 'billing_city',
                'fieldName' => __('Billing City', 'bit-integrations')
            ],
            'Billing Post Code' => (object) [
                'fieldKey'  => 'billing_postcode',
                'fieldName' => __('Billing Post Code', 'bit-integrations')
            ],
            'Billing Country' => (object) [
                'fieldKey'  => 'billing_country',
                'fieldName' => __('Billing Country', 'bit-integrations')
            ],
            'Billing State' => (object) [
                'fieldKey'  => 'billing_state',
                'fieldName' => __('Billing State', 'bit-integrations')
            ],
            'Billing Email' => (object) [
                'fieldKey'  => 'billing_email',
                'fieldName' => __('Billing Email', 'bit-integrations')
            ],
            'Billing Phone' => (object) [
                'fieldKey'  => 'billing_phone',
                'fieldName' => __('Billing Phone', 'bit-integrations')
            ],
            'Shipping First Name' => (object) [
                'fieldKey'  => 'shipping_first_name',
                'fieldName' => __('Shipping First Name', 'bit-integrations')
            ],
            'Shipping Last Name' => (object) [
                'fieldKey'  => 'shipping_last_name',
                'fieldName' => __('Shipping Last Name', 'bit-integrations')
            ],
            'Shipping Company' => (object) [
                'fieldKey'  => 'shipping_company',
                'fieldName' => __('Shipping Company', 'bit-integrations')
            ],
            'Shipping Address 1' => (object) [
                'fieldKey'  => 'shipping_address_1',
                'fieldName' => __('Shipping Address 1', 'bit-integrations')
            ],
            'Shipping Address 2' => (object) [
                'fieldKey'  => 'shipping_address_2',
                'fieldName' => __('Shipping Address 2', 'bit-integrations')
            ],
            'Shipping City' => (object) [
                'fieldKey'  => 'shipping_city',
                'fieldName' => __('Shipping City', 'bit-integrations')
            ],
            'Shipping Post Code' => (object) [
                'fieldKey'  => 'shipping_postcode',
                'fieldName' => __('Shipping Post Code', 'bit-integrations')
            ],
            'Shipping Country' => (object) [
                'fieldKey'  => 'shipping_country',
                'fieldName' => __('Shipping Country', 'bit-integrations')
            ],
            'Shipping State' => (object) [
                'fieldKey'  => 'shipping_state',
                'fieldName' => __('Shipping State', 'bit-integrations')
            ],
        ];
    }
}
