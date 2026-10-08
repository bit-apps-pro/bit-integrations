<?php

namespace BitApps\Integrations\Actions\WooCommerce;

if (!defined('ABSPATH')) {
    exit;
}

class WooCommerceActionModules
{
    public static function exists($module)
    {
        return \array_key_exists($module, self::definitions());
    }

    public static function fields($module)
    {
        $definitions = self::definitions();

        if (!isset($definitions[$module])) {
            return;
        }

        $fields = [];
        $required = [];

        foreach ($definitions[$module] as [$fieldKey, $fieldName, $isRequired]) {
            $fields[$fieldName] = (object) [
                'fieldKey'  => $fieldKey,
                'fieldName' => $fieldName,
                'required'  => $isRequired,
            ];

            if ($isRequired) {
                $required[] = $fieldKey;
            }
        }

        return [
            'fields'       => $fields,
            'uploadFields' => [],
            'required'     => $required,
        ];
    }

    private static function definitions()
    {
        return [
            'add_order_note' => [
                ['order_id', __('Order ID', 'bit-integrations'), true],
                ['note', __('Note', 'bit-integrations'), true],
            ],
            'update_order_meta' => [
                ['order_id', __('Order ID', 'bit-integrations'), true],
                ['meta_key', __('Meta Key', 'bit-integrations'), true],
                ['meta_value', __('Meta Value', 'bit-integrations'), false],
            ],
            'update_customer' => array_merge(
                [
                    ['customer_id', __('Customer ID', 'bit-integrations'), true],
                    ['first_name', __('First Name', 'bit-integrations'), false],
                    ['last_name', __('Last Name', 'bit-integrations'), false],
                    ['display_name', __('Display Name', 'bit-integrations'), false],
                    ['email', __('Email', 'bit-integrations'), false],
                ],
                self::addressFields()
            ),
            'delete_customer' => [
                ['customer_id', __('Customer ID', 'bit-integrations'), true],
            ],
            'update_product' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
                ['name', __('Name', 'bit-integrations'), false],
                ['slug', __('Slug', 'bit-integrations'), false],
                ['short_description', __('Short Description', 'bit-integrations'), false],
                ['description', __('Description', 'bit-integrations'), false],
                ['regular_price', __('Regular Price', 'bit-integrations'), false],
                ['sale_price', __('Sale Price', 'bit-integrations'), false],
                ['date_on_sale_from', __('Sale Start Date (YYYY-MM-DD)', 'bit-integrations'), false],
                ['date_on_sale_to', __('Sale End Date (YYYY-MM-DD)', 'bit-integrations'), false],
                ['sku', __('SKU', 'bit-integrations'), false],
                ['stock_quantity', __('Stock Quantity', 'bit-integrations'), false],
                ['low_stock_amount', __('Low Stock Threshold', 'bit-integrations'), false],
                ['tax_class', __('Tax Class', 'bit-integrations'), false],
                ['weight', __('Weight', 'bit-integrations'), false],
                ['length', __('Length', 'bit-integrations'), false],
                ['width', __('Width', 'bit-integrations'), false],
                ['height', __('Height', 'bit-integrations'), false],
                ['external_url', __('External Product URL', 'bit-integrations'), false],
                ['button_text', __('External Product Button Text', 'bit-integrations'), false],
                ['purchase_note', __('Purchase Note', 'bit-integrations'), false],
                ['menu_order', __('Menu Order', 'bit-integrations'), false],
                ['featured_image', __('Featured Image URL', 'bit-integrations'), false],
                ['gallery_images', __('Gallery Image URLs (comma separated)', 'bit-integrations'), false],
            ],
            'update_product_stock' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
                ['stock_quantity', __('Stock Quantity', 'bit-integrations'), true],
            ],
            'update_product_status' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
            ],
            'update_product_price' => [
                ['product_id_or_sku', __('Product ID or SKU', 'bit-integrations'), true],
                ['regular_price', __('Regular Price', 'bit-integrations'), false],
                ['sale_price', __('Sale Price', 'bit-integrations'), false],
            ],
            'delete_product' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
            ],
            'create_product_variation' => array_merge(
                [
                    ['product_id', __('Parent Product ID', 'bit-integrations'), true],
                    ['attributes', __('Attributes (e.g. Color: Red, Size: Large)', 'bit-integrations'), true],
                    ['regular_price', __('Regular Price', 'bit-integrations'), true],
                ],
                self::variationFields()
            ),
            'update_product_variation' => array_merge(
                [
                    ['variation_id', __('Variation ID', 'bit-integrations'), true],
                    ['attributes', __('Attributes (e.g. Color: Red, Size: Large)', 'bit-integrations'), false],
                    ['regular_price', __('Regular Price', 'bit-integrations'), false],
                ],
                self::variationFields()
            ),
            'create_product_term' => [
                ['name', __('Name', 'bit-integrations'), true],
                ['slug', __('Slug', 'bit-integrations'), false],
                ['description', __('Description', 'bit-integrations'), false],
                ['parent', __('Parent Term ID', 'bit-integrations'), false],
            ],
            'update_product_term' => [
                ['term_id', __('Term ID', 'bit-integrations'), true],
                ['name', __('Name', 'bit-integrations'), false],
                ['slug', __('Slug', 'bit-integrations'), false],
                ['description', __('Description', 'bit-integrations'), false],
                ['parent', __('Parent Term ID', 'bit-integrations'), false],
            ],
            'delete_product_term' => [
                ['term_id', __('Term ID', 'bit-integrations'), true],
            ],
            'create_attribute' => [
                ['name', __('Name', 'bit-integrations'), true],
                ['slug', __('Slug', 'bit-integrations'), false],
            ],
            'update_attribute' => [
                ['attribute_id', __('Attribute ID', 'bit-integrations'), true],
                ['name', __('Name', 'bit-integrations'), false],
                ['slug', __('Slug', 'bit-integrations'), false],
            ],
            'delete_attribute' => [
                ['attribute_id', __('Attribute ID', 'bit-integrations'), true],
            ],
            'add_attribute_terms' => [
                ['attribute_id', __('Attribute ID', 'bit-integrations'), true],
                ['terms', __('Terms (comma separated)', 'bit-integrations'), true],
            ],
            'add_product_attribute' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
                ['attribute_name', __('Attribute Name', 'bit-integrations'), true],
                ['attribute_values', __('Attribute Values (comma separated)', 'bit-integrations'), true],
            ],
            'remove_product_attribute' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
                ['attribute_names', __('Attribute Names (comma separated)', 'bit-integrations'), true],
            ],
            'add_product_to_cart' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
                ['quantity', __('Quantity', 'bit-integrations'), true],
                ['variation_id', __('Variation ID', 'bit-integrations'), false],
            ],
            'remove_product_from_cart' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
            ],
            'apply_coupon_to_cart' => [
                ['coupon_code', __('Coupon Code', 'bit-integrations'), true],
            ],
            'remove_coupon_from_cart' => [
                ['coupon_code', __('Coupon Code', 'bit-integrations'), true],
            ],
            'send_abandoned_cart_email' => [
                ['email', __('Email', 'bit-integrations'), true],
                ['subject', __('Subject', 'bit-integrations'), false],
                ['body', __('Body (HTML allowed)', 'bit-integrations'), false],
            ],
            'create_coupon' => array_merge(
                [
                    ['coupon_code', __('Coupon Code', 'bit-integrations'), true],
                    ['amount', __('Amount', 'bit-integrations'), true],
                ],
                self::couponFields()
            ),
            'update_coupon' => array_merge(
                [
                    ['coupon_code_or_id', __('Coupon Code or ID', 'bit-integrations'), true],
                    ['amount', __('Amount', 'bit-integrations'), false],
                ],
                self::couponFields()
            ),
            'update_coupon_code' => [
                ['coupon_id', __('Coupon ID', 'bit-integrations'), true],
                ['new_coupon_code', __('New Coupon Code', 'bit-integrations'), true],
            ],
            'add_emails_to_coupon' => [
                ['coupon_code_or_id', __('Coupon Code or ID', 'bit-integrations'), true],
                ['emails', __('Emails (comma separated)', 'bit-integrations'), true],
            ],
            'delete_coupon' => [
                ['coupon_code_or_id', __('Coupon Code or ID', 'bit-integrations'), true],
            ],
            'create_product_review' => [
                ['product_id', __('Product ID', 'bit-integrations'), true],
                ['reviewer_name', __('Reviewer Name', 'bit-integrations'), true],
                ['reviewer_email', __('Reviewer Email', 'bit-integrations'), true],
                ['rating', __('Rating (1-5)', 'bit-integrations'), true],
                ['review', __('Review', 'bit-integrations'), true],
            ],
            'update_product_review' => [
                ['review_id', __('Review ID', 'bit-integrations'), true],
                ['reviewer_name', __('Reviewer Name', 'bit-integrations'), false],
                ['reviewer_email', __('Reviewer Email', 'bit-integrations'), false],
                ['rating', __('Rating (1-5)', 'bit-integrations'), false],
                ['review', __('Review', 'bit-integrations'), false],
            ],
            'approve_product_review' => [
                ['review_id', __('Review ID', 'bit-integrations'), true],
            ],
            'delete_product_review' => [
                ['review_id', __('Review ID', 'bit-integrations'), true],
            ],
        ];
    }

    private static function addressFields()
    {
        $fields = [];

        foreach (array_merge(WooCommerceStaticFields::billingFields(), WooCommerceStaticFields::shippingFields()) as $field) {
            if ($field->fieldKey !== 'shipping_email') {
                $fields[] = [$field->fieldKey, $field->fieldName, false];
            }
        }

        return $fields;
    }

    private static function variationFields()
    {
        return [
            ['sale_price', __('Sale Price', 'bit-integrations'), false],
            ['date_on_sale_from', __('Sale Start Date (YYYY-MM-DD)', 'bit-integrations'), false],
            ['date_on_sale_to', __('Sale End Date (YYYY-MM-DD)', 'bit-integrations'), false],
            ['sku', __('SKU', 'bit-integrations'), false],
            ['stock_quantity', __('Stock Quantity', 'bit-integrations'), false],
            ['description', __('Description', 'bit-integrations'), false],
            ['weight', __('Weight', 'bit-integrations'), false],
            ['length', __('Length', 'bit-integrations'), false],
            ['width', __('Width', 'bit-integrations'), false],
            ['height', __('Height', 'bit-integrations'), false],
            ['variation_image', __('Variation Image URL', 'bit-integrations'), false],
        ];
    }

    private static function couponFields()
    {
        return [
            ['expiry_date', __('Expiry Date (YYYY-MM-DD)', 'bit-integrations'), false],
            ['description', __('Description', 'bit-integrations'), false],
            ['minimum_amount', __('Minimum Spend', 'bit-integrations'), false],
            ['maximum_amount', __('Maximum Spend', 'bit-integrations'), false],
            ['allowed_emails', __('Allowed Emails (comma separated)', 'bit-integrations'), false],
            ['usage_limit', __('Usage Limit Per Coupon', 'bit-integrations'), false],
            ['usage_limit_per_user', __('Usage Limit Per User', 'bit-integrations'), false],
            ['limit_usage_to_x_items', __('Limit Usage to X Items', 'bit-integrations'), false],
        ];
    }
}
