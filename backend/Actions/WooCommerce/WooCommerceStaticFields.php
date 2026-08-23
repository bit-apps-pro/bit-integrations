<?php

/**
 * WooCommerce Static Fields.
 */

namespace BitApps\Integrations\Actions\WooCommerce;

class WooCommerceStaticFields
{
    public static function checkoutBasicFields()
    {
        return [
            'status' => (object) [
                'fieldKey'  => 'status',
                'fieldName' => __('Status', 'bit-integrations')
            ],
            'customer_note' => (object) [
                'fieldKey'  => 'customer_note',
                'fieldName' => __('Customer Note', 'bit-integrations')
            ],
            'Payment Method' => (object) [
                'fieldKey'  => 'payment_method',
                'fieldName' => __('Payment Method', 'bit-integrations')
            ],
            'Payment Method Title' => (object) [
                'fieldKey'  => 'payment_method_title',
                'fieldName' => __('Payment Method Title', 'bit-integrations')
            ],
            'coupon_code' => (object) [
                'fieldKey'  => 'coupon_code',
                'fieldName' => __('Coupon Code', 'bit-integrations')
            ],
        ];
    }

    public static function customerFields()
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
                'fieldName' => __('Email', 'bit-integrations'),
                'required'  => true
            ],
            'Username' => (object) [
                'fieldKey'  => 'user_login',
                'fieldName' => __('Username', 'bit-integrations'),
                'required'  => true
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
            'Description' => (object) [
                'fieldKey'  => 'description',
                'fieldName' => __('Description', 'bit-integrations')
            ],
            'Locale' => (object) [
                'fieldKey'  => 'locale',
                'fieldName' => __('Locale', 'bit-integrations')
            ],
            'Website' => (object) [
                'fieldKey'  => 'user_url',
                'fieldName' => __('Website', 'bit-integrations')
            ],
        ];
    }

    public static function lineItemsFields()
    {
        return [
            'Product Name' => (object) [
                'fieldKey'  => 'name',
                'fieldName' => __('Product Name', 'bit-integrations'),
                'required'  => true
            ],
            'Sku' => (object) [
                'fieldKey'  => 'sku',
                'fieldName' => __('Sku', 'bit-integrations'),
                'required'  => true
            ],
            'Quantity' => (object) [
                'fieldKey'  => 'quantity',
                'fieldName' => __('Quantity', 'bit-integrations'),
                'required'  => true
            ],
            'Price' => (object) [
                'fieldKey'  => 'price',
                'fieldName' => __('Price', 'bit-integrations'),
                'required'  => true
            ],
            'Tax Class' => (object) [
                'fieldKey'  => 'tax_class',
                'fieldName' => __('Tax Class', 'bit-integrations')
            ],
            'Line Subtotal' => (object) [
                'fieldKey'  => 'subtotal',
                'fieldName' => __('Line Subtotal', 'bit-integrations')
            ],
            'Line Subtotal Tax' => (object) [
                'fieldKey'  => 'line_subtotal_tax',
                'fieldName' => __('Line Subtotal Tax', 'bit-integrations')
            ],
            'Line Total' => (object) [
                'fieldKey'  => 'total',
                'fieldName' => __('Line Total', 'bit-integrations')
            ],
        ];
    }

    public static function billingFields()
    {
        return [
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
        ];
    }

    public static function shippingFields()
    {
        return [
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
            'Shipping Email' => (object) [
                'fieldKey'  => 'shipping_email',
                'fieldName' => __('Shipping Email', 'bit-integrations')
            ],
            'Shipping Phone' => (object) [
                'fieldKey'  => 'shipping_phone',
                'fieldName' => __('Shipping Phone', 'bit-integrations')
            ],
        ];
    }

    public static function productBasicFields()
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
            'Post Password' => (object) [
                'fieldKey'  => 'post_password',
                'fieldName' => __('Post Password', 'bit-integrations')
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
                'fieldName' => __('SKU', 'bit-integrations'),
                'required'  => true,
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
            ],
            'Button Text' => (object) [
                'fieldKey'  => '_button_text',
                'fieldName' => __('Button Text', 'bit-integrations')
            ],
        ];
    }

    public static function productUploadFields()
    {
        return [
            'Product Image' => (object) [
                'fieldKey'  => 'product_image',
                'fieldName' => __('Product Image', 'bit-integrations')
            ],
            'Product Gallery' => (object) [
                'fieldKey'  => 'product_gallery',
                'fieldName' => __('Product Gallery', 'bit-integrations')
            ],
            'Downloadable Files' => (object) [
                'fieldKey'  => 'downloadable_files',
                'fieldName' => __('Downloadable Files', 'bit-integrations')
            ],
        ];
    }
}
