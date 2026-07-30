<?php

/**
 * WooCommerce Integration
 */

namespace BitApps\Integrations\Actions\WooCommerce;

use BitApps\Integrations\Log\LogHandler;
use WC_Data_Store;
use WP_Error;

class WooCommerceController
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function refreshFields($queryParams)
    {
        if (empty($queryParams->module)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $metabox = WooCommerceMetaFields::metaBoxFields($queryParams->module);

        $uploadFields = [];

        if ($queryParams->module === 'product') {
            $productFields = WooCommerceMetaFields::getProductModuleFields($queryParams->module);
            $fields = $productFields['fields'];
            $uploadFields = $productFields['upload_fields'];
            $required = $productFields['required'];
        }

        if ($queryParams->module === 'customer') {
            $fields = [
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

            $required = ['user_login', 'user_email'];
        }

        if ($queryParams->module === 'order') {
            wp_send_json_success(WooCommerceMetaFields::getOrderModuleFields($queryParams->module), 200);
        }

        if ($queryParams->module === 'changestatus') {
            $fields = [
                'Order ID' => (object) [
                    'fieldKey'  => 'order_id',
                    'fieldName' => __('Order ID', 'bit-integrations'),
                    'required'  => true
                ],
                'Order Status' => (object) [
                    'fieldKey'  => 'order_status',
                    'fieldName' => __('Order Status', 'bit-integrations'),
                    'required'  => true
                ],
                'Customer Email' => (object) [
                    'fieldKey'  => 'email',
                    'fieldName' => __('Customer Email', 'bit-integrations'),
                    'required'  => true
                ],
                'From Date' => (object) [
                    'fieldKey'  => 'from_date',
                    'fieldName' => __('From Date', 'bit-integrations'),
                    'required'  => true
                ],
                'To Date' => (object) [
                    'fieldKey'  => 'to_date',
                    'fieldName' => __('To Date', 'bit-integrations'),
                    'required'  => true
                ],
                'N Days' => (object) [
                    'fieldKey'  => 'n_days',
                    'fieldName' => __('N Days', 'bit-integrations'),
                    'required'  => true
                ],
                'N Weeks' => (object) [
                    'fieldKey'  => 'n_weeks',
                    'fieldName' => __('N Weeks', 'bit-integrations'),
                    'required'  => true
                ],
                'N Months' => (object) [
                    'fieldKey'  => 'n_months',
                    'fieldName' => __('N Months', 'bit-integrations'),
                    'required'  => true
                ],

            ];
            $required = [];
            $response = [
                'fields'       => $fields,
                'uploadFields' => $uploadFields,
                'required'     => $required
            ];

            wp_send_json_success($response, 200);
        }

        uksort($fields, 'strnatcasecmp');
        uksort($uploadFields, 'strnatcasecmp');
        $fields = array_merge($fields, $metabox['meta_fields']);
        $response = [
            'fields'       => $fields,
            'uploadFields' => $uploadFields,
            'required'     => $required
        ];

        wp_send_json_success($response, 200);
    }

    public function searchProjects($queryParams)
    {
        include_once \dirname(WC_PLUGIN_FILE) . '/includes/class-wc-product-functions.php';
        $data_store = WC_Data_Store::load('product');
        $search_results = $data_store->search_products($queryParams->searchTxt);
        $products = [];
        foreach ($search_results as $res) {
            if ($res) {
                $product = wc_get_product($res);
                $products[] = [
                    'id'   => $res,
                    'name' => $product->get_name(),
                ];
            }
        }

        wp_send_json_success($products, 200);
    }

    public static function allSubscriptionsProducts()
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- Complex query for subscription products
        $allSubscriptions = $wpdb->get_results(
            "SELECT posts.ID, posts.post_title FROM {$wpdb->posts} as posts
        	    LEFT JOIN {$wpdb->term_relationships} as rel ON (posts.ID = rel.object_id)
        	    WHERE rel.term_taxonomy_id IN (SELECT term_id FROM {$wpdb->terms} WHERE slug IN ('subscription','variable-subscription'))
        	    AND posts.post_type = 'product'
        	    AND posts.post_status = 'publish'
        	    UNION ALL
        	    SELECT ID, post_title FROM {$wpdb->posts}
        	    WHERE post_type = 'shop_subscription'
        	    AND post_status = 'publish'
        	    ORDER BY post_title"
        );

        $subscriptions[] = [
            'product_id'   => 'any',
            'product_name' => __('Any Product', 'bit-integrations'),
        ];

        foreach ($allSubscriptions as $key => $val) {
            $subscriptions[] = [
                'product_id'   => $val->ID,
                'product_name' => $val->post_title,
            ];
        }
        wp_send_json_success($subscriptions, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $module = $integrationDetails->module;
        $fieldMap = $integrationDetails->{$module}->field_map;
        $uploadFieldMap = $integrationDetails->{$module}->upload_field_map;
        $required = $integrationDetails->default->fields->{$module}->required;

        if (
            empty($module)
        ) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('module and field map are required for woocommerce', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }

        $recordApiHelper = new RecordApiHelper($this->_integrationID);

        $wcApiResponse = $recordApiHelper->execute(
            $module,
            $fieldValues,
            $fieldMap,
            $uploadFieldMap,
            $required,
            $integrationDetails
        );

        if (is_wp_error($wcApiResponse)) {
            return $wcApiResponse;
        }

        return $wcApiResponse;
    }
}
