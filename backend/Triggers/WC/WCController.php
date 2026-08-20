<?php

namespace BitApps\Integrations\Triggers\WC;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Flow\Flow;
use WC_Booking;
use WC_Checkout;
use WC_Subscriptions_Product;

final class WCController
{
    public const CUSTOMER_CREATED = 1;

    public const CUSTOMER_UPDATED = 2;

    public const CUSTOMER_DELETED = 3;

    public const PRODUCT_CREATED = 4;

    public const PRODUCT_UPDATED = 5;

    public const PRODUCT_DELETED = 6;

    public const ORDER_CREATED = 7;

    public const ORDER_UPDATED = 8;

    public const ORDER_DELETED = 9;

    public const ORDER_SPECIFIC_PRODUCT = 10;

    public const ORDER_STATUS_CHANGED_TO_SPECIFIC_STATUS = 11;

    public const ORDER_SPECIFIC_CATEGORY = 17;

    public const USER_REVIEWS_A_PRODUCT = 19;

    public const USER_PURCHASES_A_VARIABLE_PRODUCT = 20;

    public const RESTORE_ORDER = 21;

    public const RESTORE_PRODUCT = 22;

    public const NEW_COUPON_CREATED = 23;

    public const PRODUCT_STATUS_CHANGED = 24;

    public const PRODUCT_ADD_TO_CART = 25;

    public const PRODUCT_REMOVE_FROM_CART = 26;

    public const ORDER_STATUS_SET_TO_PENDING = 27;

    public const ORDER_STATUS_SET_TO_FAILED = 28;

    public const ORDER_STATUS_SET_TO_ON_HOLD = 29;

    public const ORDER_STATUS_SET_TO_PROCESSING = 30;

    public const ORDER_STATUS_SET_TO_COMPLETED = 31;

    public const ORDER_STATUS_SET_TO_REFUNDED = 32;

    public const ORDER_STATUS_SET_TO_CANCELLED = 33;

    public const USER_SUBSCRIBE_PRODUCT = 12;

    public const USER_CANCELLED_SUBSCRIPTION_PRODUCT = 13;

    public const PRODUCT_SUBSCRIPTION_EXPIRED = 14;

    public const SUBSCRIPTION_PRODUCT_STATUS_CHANGED = 15;

    public const END_SUBSCRIPTION_TRIAL_PERIOD = 16;

    public const BOOKING_CREATED = 18;

    private static $_product_update_trigger_count = 0;

    private static $_product_create_trigger_count = 0;

    public static function info()
    {
        $plugin_path = 'woocommerce/woocommerce.php';

        return [
            'name'              => 'WooCommerce',
            'slug'              => $plugin_path,
            'pro'               => 'woocommerce/woocommerce.php',
            'type'              => 'form',
            'is_active'         => static::isActivate(),
            'documentation_url' => 'https://bit-integrations.com/wp-docs/trigger/woocommerce-integrations-as-a-trigger/',
            'tutorial_url'      => 'https://youtube.com/playlist?list=PL7c6CDwwm-AIjBabvB9-BmttQmFQGVd7_&si=Z8QEFEsoNl4FIUo0',
            'list'              => [
                'action' => 'wc/get',
                'method' => 'get',
            ],
            'fields' => [
                'action' => 'wc/get/form',
                'method' => 'post',
                'data'   => ['id']
            ],
            'isPro' => false
        ];
    }

    public function getAll()
    {
        static::isPluginActivated();

        $wc_action = [
            (object) ['id' => static::CUSTOMER_CREATED, 'title' => __('Customer-Create', 'bit-integrations')],
            (object) ['id' => static::CUSTOMER_UPDATED, 'title' => __('Customer-Edit', 'bit-integrations')],
            (object) ['id' => static::CUSTOMER_DELETED, 'title' => __('Customer-Delete', 'bit-integrations')],
            (object) ['id' => static::PRODUCT_CREATED, 'title' => __('Product-Create', 'bit-integrations')],
            (object) ['id' => static::PRODUCT_UPDATED, 'title' => __('Product-Edit', 'bit-integrations')],
            (object) ['id' => static::PRODUCT_DELETED, 'title' => __('Product-Delete', 'bit-integrations')],
            (object) ['id' => static::RESTORE_PRODUCT, 'title' => __('Restore Product', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_CREATED, 'title' => __('Order-Create', 'bit-integrations'), 'note' => __('Flexible Checkout Fields are a feature available in the Pro version', 'bit-integrations')],
            (object) ['id' => static::ORDER_UPDATED, 'title' => __('Order-Edit', 'bit-integrations'), 'note' => __('Flexible Checkout Fields are a feature available in the Pro version', 'bit-integrations')],
            (object) ['id' => static::ORDER_DELETED, 'title' => __('Order-Delete', 'bit-integrations'), 'note' => __('Flexible Checkout Fields are a feature available in the Pro version', 'bit-integrations')],
            (object) ['id' => static::RESTORE_ORDER, 'title' => __('Restore Order', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::NEW_COUPON_CREATED, 'title' => __('Coupon Created or Updated', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_STATUS_SET_TO_PENDING, 'title' => __('Order Status Set to Pending', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_STATUS_SET_TO_FAILED, 'title' => __('Order Status Set to Failed', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_STATUS_SET_TO_ON_HOLD, 'title' => __('Order Status Set to On-hold', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_STATUS_SET_TO_PROCESSING, 'title' => __('Order Status Set to Processing', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_STATUS_SET_TO_COMPLETED, 'title' => __('Order Status Set to Completed', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_STATUS_SET_TO_REFUNDED, 'title' => __('Order Status Set to Refunded', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_STATUS_SET_TO_CANCELLED, 'title' => __('Order Status Set to Cancelled', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_STATUS_CHANGED_TO_SPECIFIC_STATUS, 'title' => __('Order-Status-Change-Specific-Status', 'bit-integrations'), 'note' => __('Flexible Checkout Fields are a feature available in the Pro version', 'bit-integrations')],
            (object) ['id' => static::PRODUCT_STATUS_CHANGED, 'title' => __('Product Status Changed', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::ORDER_SPECIFIC_PRODUCT, 'title' => __('Order-Specific-Product', 'bit-integrations'), 'note' => __('Flexible Checkout Fields are a feature available in the Pro version', 'bit-integrations')],
            (object) ['id' => static::ORDER_SPECIFIC_CATEGORY, 'title' => __('Order-Specific-Category', 'bit-integrations'), 'note' => __('Flexible Checkout Fields are a feature available in the Pro version', 'bit-integrations')],
            (object) ['id' => static::PRODUCT_ADD_TO_CART, 'title' => __('Product Added to Cart', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::PRODUCT_REMOVE_FROM_CART, 'title' => __('Product Removed from Cart', 'bit-integrations'), 'isPro' => true],
            (object) ['id' => static::USER_REVIEWS_A_PRODUCT, 'title' => __('User reviews a product', 'bit-integrations')],
            (object) ['id' => static::USER_PURCHASES_A_VARIABLE_PRODUCT, 'title' => __('User purchases a variable product with selected variation', 'bit-integrations'), 'note' => __('Flexible Checkout Fields are a feature available in the Pro version', 'bit-integrations')],
        ];

        wp_send_json_success($wc_action);
    }

    public function get_trigger_field($data)
    {
        static::isPluginActivated();

        if (empty($data->id)) {
            wp_send_json_error(__('Doesn\'t exists', 'bit-integrations'));
        }
        $fields = self::fields($data->id);
        if (empty($fields)) {
            wp_send_json_error(__('Doesn\'t exists any field', 'bit-integrations'));
        }

        $responseData['fields'] = $fields;

        if ($data->id == static::ORDER_SPECIFIC_PRODUCT || $data->id == static::USER_REVIEWS_A_PRODUCT) {
            $responseData['products'] = WCHelper::getAllWcProducts($data->id);
        }

        if ($data->id == static::ORDER_STATUS_CHANGED_TO_SPECIFIC_STATUS) {
            $orderStatuses = wc_get_order_statuses();
            $responseData['orderStatus'] = $orderStatuses;
        }

        if ($data->id == static::ORDER_SPECIFIC_CATEGORY) {
            $orderby = 'name';
            $order = 'asc';
            $hide_empty = false;
            $args = [
                'orderby'    => $orderby,
                'order'      => $order,
                'hide_empty' => $hide_empty,
                'taxonomy'   => 'product_cat',
            ];

            $product_categories_list = get_terms($args);
            if (empty($product_categories_list)) {
                return;
            }
            foreach ($product_categories_list as $key => $category) {
                $product_categories[] = [
                    'term_id' => (string) $category->term_id,
                    'name'    => $category->name,
                ];
            }
            $responseData['allProductCategories'] = $product_categories;
        }
        if ($data->id == 20) {
            $responseData['allVariableProduct'] = WCHelper::getAllWcVariableProduct();
        }

        wp_send_json_success($responseData);
    }

    public static function fields($id)
    {
        $entity = null;
        if ($id <= static::CUSTOMER_DELETED) {
            $entity = 'customer';
        } elseif (
            $id <= static::PRODUCT_DELETED
            || $id == static::RESTORE_PRODUCT
            || $id == static::PRODUCT_STATUS_CHANGED
        ) {
            $entity = 'product';
        } elseif (
            $id <= static::ORDER_STATUS_CHANGED_TO_SPECIFIC_STATUS
            || $id == static::RESTORE_ORDER
            || $id == static::ORDER_SPECIFIC_CATEGORY
            || $id == static::USER_PURCHASES_A_VARIABLE_PRODUCT
            || $id == static::ORDER_STATUS_SET_TO_PENDING
            || $id == static::ORDER_STATUS_SET_TO_FAILED
            || $id == static::ORDER_STATUS_SET_TO_ON_HOLD
            || $id == static::ORDER_STATUS_SET_TO_PROCESSING
            || $id == static::ORDER_STATUS_SET_TO_COMPLETED
            || $id == static::ORDER_STATUS_SET_TO_REFUNDED
            || $id == static::ORDER_STATUS_SET_TO_CANCELLED
        ) {
            $entity = 'order';
        } elseif ($id <= static::USER_REVIEWS_A_PRODUCT) {
            $entity = 'review';
        } elseif ($id == static::NEW_COUPON_CREATED) {
            $entity = 'coupon';
        } elseif ($id == static::PRODUCT_ADD_TO_CART) {
            $entity = 'add_to_cart';
        } elseif ($id == static::PRODUCT_REMOVE_FROM_CART) {
            $entity = 'remove_from_cart';
        }

        if (empty($id)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $metabox = self::metaboxFields($entity);
        switch ($entity) {
            case 'product':
                $fields = WCStaticFields::getWCProductFields($metabox);
                $uploadFields = WCStaticFields::getWCProductUploadFields($metabox);

                break;
            case 'customer':
                $fields = WCStaticFields::getWCCustomerFields($id);

                break;
            case 'order':
                $fields = WCStaticFields::getWCOrderFields($id);

                break;
            case 'review':
                $fields = WCStaticFields::getReviewFields();

                break;
            case 'coupon':
                $fields = WCStaticFields::getCouponFields();

                break;
            case 'add_to_cart':
                $fields = WCStaticFields::getAddToCartFields();

                break;
            case 'remove_from_cart':
                $fields = WCStaticFields::getRemoveFromCartFields();

                break;

            default:
                $fields = [];

                break;
        }

        if ($id == static::PRODUCT_STATUS_CHANGED) {
            $fields = array_merge($fields, [
                'Old Status' => (object) [
                    'fieldKey'  => 'old_status',
                    'fieldName' => __('Old Status', 'bit-integrations')
                ],
                'New Status' => (object) [
                    'fieldKey'  => 'new_status',
                    'fieldName' => __('New Status', 'bit-integrations')
                ],
            ]);
        }

        uksort($fields, 'strnatcasecmp');

        $fieldsNew = [];
        if (isset($uploadFields) && $uploadFields != null) {
            uksort($uploadFields, 'strnatcasecmp');
            foreach ($uploadFields as $field) {
                $fieldsNew[] = [
                    'name'  => $field->fieldKey,
                    'type'  => 'file',
                    'label' => $field->fieldName,
                ];
            }
        }
        $fields = array_merge($fields, $metabox['meta_fields']);
        foreach ($fields as $field) {
            if ($field->fieldKey === 'user_email' || $field->fieldKey === 'shipping_email' || $field->fieldKey === 'billing_email') {
                $fieldsNew[] = [
                    'name'  => $field->fieldKey,
                    'type'  => 'email',
                    'label' => $field->fieldName,
                ];
            } else {
                $fieldsNew[] = [
                    'name'  => $field->fieldKey,
                    'type'  => 'text',
                    'label' => $field->fieldName,
                ];
            }
        }

        return $fieldsNew;
    }

    public static function metaboxFields($module)
    {
        $fileTypes = [
            'image',
            'image_upload',
            'file_advanced',
            'file_upload',
            'single_image',
            'file',
            'image_advanced',
            'video'
        ];

        $metaboxFields = [];
        $metaboxUploadFields = [];

        if (\function_exists('rwmb_meta')) {
            if ($module === 'customer') {
                $field_registry = rwmb_get_registry('field');
                $meta_boxes = $field_registry->get_by_object_type($object_type = 'user');
                $metaFields = isset($meta_boxes['user']) && \is_array($meta_boxes['user']) ? array_values($meta_boxes['user']) : [];
            } else {
                $metaFields = array_values(rwmb_get_object_fields($module));
            }
            foreach ($metaFields as $index => $field) {
                if (!\in_array($field['type'], $fileTypes)) {
                    $metaboxFields[$index] = (object) [
                        'fieldKey'  => $field['id'],
                        'fieldName' => 'Metabox Field - ' . $field['name'],
                        'required'  => $field['required'],
                    ];
                } else {
                    $metaboxUploadFields[$index] = (object) [
                        'fieldKey'  => $field['id'],
                        'fieldName' => 'Metabox Field - ' . $field['name'],
                        'required'  => $field['required'],
                    ];
                }
            }
        }

        return ['meta_fields' => $metaboxFields, 'upload_fields' => $metaboxUploadFields];
    }

    public static function formatUserMetaData($metadata)
    {
        $arr = [];
        foreach ($metadata as $key => $value) {
            $arr[$key] = $value[0];
        }

        return $arr;
    }

    public static function handle_customer_create($customer_id, $importType)
    {
        if (!static::isActivate()) {
            return false;
        }

        if (isset($importType['role']) && $importType['role'] !== 'customer') {
            return false;
        }

        $customer_data = (array) get_userdata($customer_id)->data;
        $customer_metadata = self::formatUserMetaData(get_user_meta($customer_id));
        $customer_values = array_merge_recursive($customer_data, $customer_metadata);

        if (!empty($customer_id) && $flows = Flow::exists('WC', static::CUSTOMER_CREATED)) {
            Flow::execute('WC', static::CUSTOMER_CREATED, $customer_values, $flows);
        }
    }

    public static function handle_customer_update($customer_id, $oldData, $newData)
    {
        if (!static::isActivate()) {
            return false;
        }

        if (isset($newData['role']) && $newData['role'] !== 'customer') {
            return false;
        }
        $customer_data = (array) $newData;
        $customer_metadata = self::formatUserMetaData(get_user_meta($customer_id));
        $newMeta = $customer_metadata;
        foreach ($customer_metadata as $key => $val) {
            if (\array_key_exists($key, $customer_data)) {
                unset($newMeta[$key]);
            }
        }
        $customer_values = array_merge_recursive($customer_data, $newMeta);

        if (!empty($customer_id) && $flows = Flow::exists('WC', static::CUSTOMER_UPDATED)) {
            Flow::execute('WC', static::CUSTOMER_UPDATED, $customer_values, $flows);
        }
    }

    public static function handle_customer_delete($customer_id)
    {
        if (!static::isActivate() || empty($customer_id)) {
            return false;
        }

        $user_meta = get_userdata($customer_id);
        $user_roles = $user_meta->roles;

        if (!\in_array('customer', $user_roles)) {
            return false;
        }

        $customer_data = ['customer_id' => $customer_id];
        if (!empty($customer_id) && $flows = Flow::exists('WC', static::CUSTOMER_DELETED)) {
            Flow::execute('WC', static::CUSTOMER_DELETED, $customer_data, $flows);
        }
    }

    public static function handle_product_action($new_status, $old_status, $post)
    {
        if (!static::isActivate() || $old_status === 'new' || empty($post) || $post->post_type != 'product') {
            return false;
        }

        if (($old_status === 'auto-draft' || $old_status === 'draft') && $new_status === 'publish' && static::$_product_create_trigger_count == 0) {
            static::$_product_create_trigger_count++;
            add_action('save_post', [WCController::class, 'product_create'], 10, 1);
        }

        if ($old_status != 'auto-draft' && $old_status != 'draft' && $new_status === 'publish' && static::$_product_update_trigger_count == 0) {
            static::$_product_update_trigger_count++;
            add_action('save_post', [WCController::class, 'product_update'], 10, 1);
        }

        if ($new_status === 'trash') {
            self::handle_deleted_product($post->ID);
        }
    }

    public static function handle_deleted_product($postId)
    {
        return self::executeProductTriggers($postId, static::PRODUCT_DELETED);
    }

    public static function handle_product_save_post($post_id, $post, $update)
    {
        if (!static::isActivate()) {
            return false;
        }

        if (wc_get_product($post_id) == false || $post->post_type != 'product' || $post->post_status != 'publish') {
            return false;
        }

        if ($update) {
            if (static::$_product_update_trigger_count == 0) {
                static::$_product_update_trigger_count++;
                static::product_update($post_id);
            }
        } elseif (static::$_product_create_trigger_count == 0) {
            static::$_product_create_trigger_count++;
            static::product_create($post_id);
        }
    }

    public static function product_create($post_id)
    {
        $productData = wc_get_product($post_id);
        $data = WCHelper::accessProductData($productData);
        $acfFieldGroups = Helper::acfGetFieldGroups(['product']);
        $acfFielddata = Helper::getAcfFieldData($acfFieldGroups, $post_id);
        $data = array_merge($data, $acfFielddata);

        if (!empty($post_id) && $flows = Flow::exists('WC', static::PRODUCT_CREATED)) {
            Flow::execute('WC', static::PRODUCT_CREATED, $data, $flows);
        }
    }

    public static function product_update($post_id)
    {
        $productData = wc_get_product($post_id);
        $data = WCHelper::accessProductData($productData);
        $acfFieldGroups = Helper::acfGetFieldGroups(['product']);
        $acfFielddata = Helper::getAcfFieldData($acfFieldGroups, $post_id);
        $data = array_merge($data, $acfFielddata);

        if (!empty($post_id) && $flows = Flow::exists('WC', static::PRODUCT_UPDATED)) {
            Flow::execute('WC', static::PRODUCT_UPDATED, $data, $flows);
        }
    }

    public static function handle_order_create($order_id, $fields)
    {
        if (!static::isActivate()) {
            return;
        }

        $data = WCHelper::processOrderData($order_id);
        $triggerd = [
            static::ORDER_UPDATED,
            static::ORDER_DELETED,
            static::ORDER_STATUS_CHANGED_TO_SPECIFIC_STATUS,
            static::USER_SUBSCRIBE_PRODUCT,
            static::USER_CANCELLED_SUBSCRIPTION_PRODUCT,
            static::PRODUCT_SUBSCRIPTION_EXPIRED,
            static::SUBSCRIPTION_PRODUCT_STATUS_CHANGED,
            static::END_SUBSCRIPTION_TRIAL_PERIOD
        ];

        for ($i = static::ORDER_CREATED; $i <= static::ORDER_SPECIFIC_CATEGORY; $i++) {
            if (\in_array($i, $triggerd)) {
                continue;
            }
            if ($i == static::ORDER_CREATED) {
                $flows = Flow::exists('WC', static::ORDER_CREATED);
                if (!empty($order_id) && $flows = Flow::exists('WC', static::ORDER_CREATED)) {
                    $orderedProducts = $data['line_items'];
                    $differId = 1;

                    foreach ($orderedProducts as $orderedProduct) {
                        foreach ((array) $orderedProduct as $keys => $value) {
                            $newItem["{$differId}_{$keys}"] = $value;
                        }
                        $differId = $differId + 1;
                        $data = array_merge($data, (array) $newItem);
                    }
                    Flow::execute('WC', static::ORDER_CREATED, $data, $flows);
                }
            } elseif ($i == static::ORDER_SPECIFIC_PRODUCT) {
                if (!empty($order_id) && $flows = Flow::exists('WC', static::ORDER_SPECIFIC_PRODUCT)) {
                    $flows = Flow::exists('WC', static::ORDER_SPECIFIC_PRODUCT);
                    foreach ($flows as $flow) {
                        $flowsDetailData = $flow->flow_details;
                        $flowsDetail = json_decode($flowsDetailData);
                        $selectedProductId = $flowsDetail->selectedProduct;
                        $orderedProducts = $data['line_items'];
                        $triggerData = $data;

                        foreach ($orderedProducts as $orderedProduct) {
                            if ((int) $selectedProductId == $orderedProduct->product_id) {
                                $triggerData['line_items'] = [$orderedProduct];
                                $triggerData = $triggerData + (array) $orderedProduct;
                                $flowData = [0 => $flow];
                                Flow::execute('WC', static::ORDER_SPECIFIC_PRODUCT, $triggerData, $flowData);

                                break;
                            }
                        }
                    }
                }
            } elseif ($i == static::ORDER_SPECIFIC_CATEGORY) {
                if (!empty($order_id) && $flows = Flow::exists('WC', static::ORDER_SPECIFIC_CATEGORY)) {
                    $flows = Flow::exists('WC', static::ORDER_SPECIFIC_CATEGORY);

                    $flowsDetailData = $flows[0]->flow_details;
                    $flowsDetail = json_decode($flowsDetailData);
                    $selectedProductCategory = $flowsDetail->selectedProductCategory;
                    $orderedProducts = $data['line_items'];
                    $filteredByCategory = [];

                    foreach ($orderedProducts as $orderedProduct) {
                        $productCategory = wc_get_product($orderedProduct->product_id);
                        $productInfo = $productCategory->get_category_ids();
                        if (\in_array((int) $selectedProductCategory, $productInfo)) {
                            $filteredByCategory[] = $orderedProduct;
                        }
                    }

                    $data['specified_product_by_category'] = $filteredByCategory;
                    Flow::execute('WC', static::ORDER_SPECIFIC_CATEGORY, $data, $flows);
                }
            }
        }
    }

    public static function handle_order_update($order_id, $post, $update)
    {
        if (!static::isActivate()) {
            return false;
        }

        $order = wc_get_order($order_id);

        if ($order == false) {
            return false;
        }
        $type = $order->get_type();
        if ($type != 'order' && $type != 'shop_order') {
            return false;
        }

        if (\is_null($order->get_date_created())) {
            return false;
        }
        $post_status = get_post_status($order_id);
        $post_type = get_post_type($order_id);
        if ($post_status === 'trash' || $post_type !== 'shop_order' || !$update) {
            return false;
        }
        $created = $order->get_date_created()->format('Y-m-d H:i:s');
        $modified = $order->get_date_modified()->format('Y-m-d H:i:s');
        $timeFirst = strtotime($created);
        $timeSecond = strtotime($modified);
        $differenceInSeconds = $timeSecond - $timeFirst;
        if ($differenceInSeconds < 15) {
            return false;
        }

        $data = WCHelper::accessOrderData($order);
        $acfFieldGroups = Helper::acfGetFieldGroups(['product', 'shop_order']);
        $acfFielddata = Helper::getAcfFieldData($acfFieldGroups, $order_id);
        $data = array_merge($data, $acfFielddata);

        if (!empty($order_id) && $flows = Flow::exists('WC', static::ORDER_UPDATED)) {
            Flow::execute('WC', static::ORDER_UPDATED, $data, $flows);
        }
    }

    public static function handle_order_delete($order_id)
    {
        if (!static::isActivate() || empty($order_id)) {
            return false;
        }

        $post_type = get_post_type($order_id);
        if ($post_type !== 'shop_order') {
            return false;
        }

        $flows = Flow::exists('WC', static::ORDER_DELETED);
        if (empty($flows)) {
            return false;
        }

        $orderData = WCHelper::processOrderData($order_id);
        Flow::execute('WC', static::ORDER_DELETED, $orderData, $flows);
    }

    public static function handle_order_status_change($order_id, $from_status, $to_status, $this_order)
    {
        if (!static::isActivate()) {
            return false;
        }

        $flows = Flow::exists('WC', static::ORDER_STATUS_CHANGED_TO_SPECIFIC_STATUS);

        if (empty($flows)) {
            return false;
        }

        foreach ($flows as $flow) {
            $flowsDetailData = $flow->flow_details;
            $flowsDetail = json_decode($flowsDetailData);
            $selectedOrderStatus = $flowsDetail->selectedOrderStatus;

            if ($selectedOrderStatus === 'wc-on-hold') {
                $spilited = explode('-', $selectedOrderStatus);
                $selectedStatus = "{$spilited[1]}-{$spilited[2]}";
            } else {
                $selectedStatus = str_replace('wc-', '', $selectedOrderStatus);
            }

            if ($to_status === $selectedStatus) {
                $order = wc_get_order($order_id);

                if ($order == false) {
                    return false;
                }
                $type = $order->get_type();
                if ($type != 'order' && $type != 'shop_order') {
                    return false;
                }

                $post_status = get_post_status($order_id);
                $post_type = get_post_type($order_id);

                if ($post_status == 'trash' || ($post_type != 'shop_order_placehold' && $post_type != 'shop_order')) {
                    return false;
                }

                $data = WCHelper::accessOrderData($order);
                $acfFieldGroups = Helper::acfGetFieldGroups(['product', 'shop_order']);
                $acfFielddata = Helper::getAcfFieldData($acfFieldGroups, $order_id);
                $data = array_merge($data, $acfFielddata);

                if (!empty($order_id)) {
                    Flow::execute('WC', static::ORDER_STATUS_CHANGED_TO_SPECIFIC_STATUS, $data, [$flow]);
                }
            }
        }
    }

    public static function handle_subscription_create($subscription)
    {
        if (!static::isActivate()) {
            return false;
        }

        $flows = Flow::exists('WC', static::USER_SUBSCRIBE_PRODUCT);

        if (empty($flows)) {
            return false;
        }

        $flowsDetailData = $flows[0]->flow_details;
        $flowsDetail = json_decode($flowsDetailData);
        $selectedSubscription = $flowsDetail->selectedSubscription;

        $items = $subscription->get_items();

        if (!\is_array($items)) {
            return;
        }

        $user_id = $subscription->get_user_id();

        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $quantity = $item->get_quantity();

            if ($product_id === 0) {
                continue;
            }
            $data = self::accessSubscription($subscription, $quantity);

            if ($selectedSubscription === 'any') {
                if (!empty($user_id) && $flows = Flow::exists('WC', static::USER_SUBSCRIBE_PRODUCT)) {
                    Flow::execute('WC', static::USER_SUBSCRIBE_PRODUCT, $data, $flows);
                }
            }
            if ($product_id === (int) $selectedSubscription) {
                if (!empty($user_id) && $flows = Flow::exists('WC', static::USER_SUBSCRIBE_PRODUCT)) {
                    Flow::execute('WC', static::USER_SUBSCRIBE_PRODUCT, $data, $flows);
                }
            }
        }
    }

    public static function handle_subscription_cancel($subscription)
    {
        if (!static::isActivate()) {
            return false;
        }

        $flows = Flow::exists('WC', static::USER_CANCELLED_SUBSCRIPTION_PRODUCT);
        $flowsDetailData = $flows[0]->flow_details;
        $flowsDetail = json_decode($flowsDetailData);
        $selectedSubscription = $flowsDetail->selectedSubscription;

        $items = $subscription->get_items();

        if (!\is_array($items)) {
            return;
        }

        $user_id = $subscription->get_user_id();

        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $quantity = $item->get_quantity();

            if ($product_id === 0) {
                continue;
            }
            $data = self::accessSubscription($subscription, $quantity);

            if ($selectedSubscription === 'any') {
                if (!empty($user_id) && $flows = Flow::exists('WC', static::USER_CANCELLED_SUBSCRIPTION_PRODUCT)) {
                    Flow::execute('WC', static::USER_CANCELLED_SUBSCRIPTION_PRODUCT, $data, $flows);
                }
            }
            if ($product_id === (int) $selectedSubscription) {
                if (!empty($user_id) && $flows = Flow::exists('WC', static::USER_CANCELLED_SUBSCRIPTION_PRODUCT)) {
                    Flow::execute('WC', static::USER_CANCELLED_SUBSCRIPTION_PRODUCT, $data, $flows);
                }
            }
        }
    }

    public static function handle_subscription_expired($subscription)
    {
        if (!static::isActivate()) {
            return false;
        }

        $flows = Flow::exists('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED);
        $flowsDetailData = $flows[0]->flow_details;
        $flowsDetail = json_decode($flowsDetailData);
        $selectedSubscription = $flowsDetail->selectedSubscription;

        $items = $subscription->get_items();

        if (!\is_array($items)) {
            return;
        }

        $user_id = $subscription->get_user_id();

        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $quantity = $item->get_quantity();

            if ($product_id === 0) {
                continue;
            }
            $data = self::accessSubscription($subscription, $quantity);

            if ($selectedSubscription === 'any') {
                if (!empty($user_id) && $flows = Flow::exists('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED)) {
                    Flow::execute('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED, $data, $flows);
                }
            }
            if ($product_id === (int) $selectedSubscription) {
                if (!empty($user_id) && $flows = Flow::exists('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED)) {
                    Flow::execute('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED, $data, $flows);
                }
            }
        }
    }

    public static function handle_subscription_status_change($subscription, $new_status, $old_status)
    {
        if (!static::isActivate()) {
            return false;
        }

        $flows = Flow::exists('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED);
        $flowsDetailData = $flows[0]->flow_details;
        $flowsDetail = json_decode($flowsDetailData);
        $selectedSubscription = $flowsDetail->selectedSubscription;
        $selectedSubscriptionStatus = $flowsDetail->selectedSubscriptionStatus;

        $items = $subscription->get_items();

        if (!\is_array($items)) {
            return;
        }

        $user_id = $subscription->get_user_id();

        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $quantity = $item->get_quantity();

            if ($product_id === 0) {
                continue;
            }
            $data = self::accessSubscription($subscription, $quantity);

            if ($selectedSubscription === 'any') {
                if ($selectedSubscriptionStatus === 'any_status') {
                    if (!empty($user_id) && $flows = Flow::exists('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED)) {
                        Flow::execute('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED, $data, $flows);
                    }
                }
                if ($new_status === explode('-', $selectedSubscriptionStatus)[1]) {
                    if (!empty($user_id) && $flows = Flow::exists('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED)) {
                        Flow::execute('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED, $data, $flows);
                    }
                }
            }
            if ($product_id === (int) $selectedSubscription) {
                if ($selectedSubscriptionStatus === 'any_status') {
                    if (!empty($user_id) && $flows = Flow::exists('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED)) {
                        Flow::execute('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED, $data, $flows);
                    }
                }
                if ($new_status === explode('-', $selectedSubscriptionStatus)[1]) {
                    if (!empty($user_id) && $flows = Flow::exists('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED)) {
                        Flow::execute('WC', static::PRODUCT_SUBSCRIPTION_EXPIRED, $data, $flows);
                    }
                }
            }
        }
    }

    public static function handle_subscription_trial_period_end($subscription_id)
    {
        if (!static::isActivate() || !\function_exists('wcs_get_subscription')) {
            return;
        }

        $subscription = wcs_get_subscription($subscription_id);
        $flows = Flow::exists('WC', static::END_SUBSCRIPTION_TRIAL_PERIOD);
        $flowsDetailData = $flows[0]->flow_details;
        $flowsDetail = json_decode($flowsDetailData);
        $selectedSubscription = $flowsDetail->selectedSubscription;

        $items = $subscription->get_items();

        if (!\is_array($items)) {
            return;
        }

        $user_id = $subscription->get_user_id();

        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $quantity = $item->get_quantity();

            if ($product_id === 0) {
                continue;
            }
            $data = self::accessSubscription($subscription, $quantity);

            if ($selectedSubscription === 'any') {
                if (!empty($user_id) && $flows = Flow::exists('WC', static::END_SUBSCRIPTION_TRIAL_PERIOD)) {
                    Flow::execute('WC', static::END_SUBSCRIPTION_TRIAL_PERIOD, $data, $flows);
                }
            }
            if ($product_id === (int) $selectedSubscription) {
                if (!empty($user_id) && $flows = Flow::exists('WC', static::END_SUBSCRIPTION_TRIAL_PERIOD)) {
                    Flow::execute('WC', static::END_SUBSCRIPTION_TRIAL_PERIOD, $data, $flows);
                }
            }
        }
    }

    public static function handle_booking_create($booking_id)
    {
        if (!static::isActivate() || !is_plugin_active('woocommerce-bookings/woocommerce-bookings.php')) {
            return false;
        }
        $booking = new WC_Booking($booking_id);
        $product_id = $booking->get_product_id();
        $customer_id = $booking->get_customer_id();
        $userData = self::getUserInfo($customer_id);
        $productInfo = wc_get_product($product_id);

        $helper = new WCHelper();
        $productData = $helper->accessBookingProductData($productInfo);
        $finalData = $helper->process_booking_data($productData, $userData, $customer_id);

        if (!empty($customer_id) && $flows = Flow::exists('WC', static::BOOKING_CREATED)) {
            Flow::execute('WC', static::BOOKING_CREATED, $finalData, $flows);
        }
    }

    public static function handle_insert_comment($comment_id, $comment_approved, $commentdata)
    {
        if (!static::isActivate() || empty($comment_id)) {
            return false;
        }

        $flows = Flow::exists('WC', static::USER_REVIEWS_A_PRODUCT);
        if (!$flows) {
            return;
        }
        if ('review' !== (string) $commentdata['comment_type']) {
            return;
        }

        $comment = get_comment($comment_id, OBJECT);

        $finalData = [
            'product_id'         => $comment->comment_post_ID ?? '',
            'product_title'      => isset($comment->comment_post_ID) ? get_the_title($comment->comment_post_ID) : '',
            'product_url'        => isset($comment->comment_post_ID) ? get_permalink($comment->comment_post_ID) : '',
            'product_price'      => isset($comment->comment_post_ID) ? get_post_meta($comment->comment_post_ID, '_price', true) : '',
            'product_review'     => $comment->comment_content ?? '',
            'product_sku'        => isset($comment->comment_post_ID) ? get_post_meta($comment->comment_post_ID, '_sku', true) : '',
            'product_tags'       => isset($comment->comment_post_ID) ? get_the_terms($comment->comment_post_ID, 'product_tag') : '',
            'product_categories' => isset($comment->comment_post_ID) ? get_the_terms($comment->comment_post_ID, 'product_cat') : '',
            'product_rating'     => get_comment_meta($comment_id, 'rating', true),
            'review_id'          => $comment->comment_ID ?? '',
            'review_date'        => $comment->comment_date ?? '',
            'author_id'          => $comment->user_id ?? 0,
            'review_author_name' => $comment->comment_author ?? '',
            'author_email'       => $comment->comment_author_email ?? '',
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedProduct = !empty($flowDetails->selectedProduct) ? $flowDetails->selectedProduct : [];
        if ($flows && ($finalData['product_id'] == $selectedProduct || $selectedProduct === 'any')) {
            Flow::execute('WC', static::USER_REVIEWS_A_PRODUCT, $finalData, $flows);
        }
    }

    public static function handle_variable_product_order($order_id, $importType)
    {
        if (!static::isActivate()) {
            return false;
        }

        $flows = Flow::exists('WC', static::USER_PURCHASES_A_VARIABLE_PRODUCT);

        if (!$flows) {
            return false;
        }

        $order = wc_get_order($order_id);
        $data = WCHelper::accessOrderData($order);

        foreach ($flows as $flow) {
            $flowDetails = json_decode($flow->flow_details);
            $selectedVariableProduct = !empty($flowDetails->selectedVariableProduct) ? $flowDetails->selectedVariableProduct : [];
            $selectedVariation = !empty($flowDetails->selectedVariation) ? $flowDetails->selectedVariation : [];

            foreach ($data['line_items'] as $item) {
                if ($item->product_id == $selectedVariableProduct || $selectedVariableProduct === 'any') {
                    if ($item->variation_id == $selectedVariation || $selectedVariation === 'any') {
                        Flow::execute('WC', static::USER_PURCHASES_A_VARIABLE_PRODUCT, $data, [$flow]);
                    }
                }
            }
        }
    }

    public static function handle_order_checkout($order)
    {
        if (!static::isActivate()) {
            return false;
        }

        $checkout = new WC_Checkout();
        self::handle_order_create($order->id, $checkout->get_posted_data());
    }

    public static function accessSubscription($subscription, $quantity)
    {
        $items = $subscription->get_items();
        $product_names = [];
        foreach ($items as $item) {
            $product = $item->get_product();
            if (class_exists('\WC_Subscriptions_Product') && WC_Subscriptions_Product::is_subscription($product)) {
                if (get_post_type($product->get_id()) === 'product_variation') {
                    $variation_product = get_post($product->get_id());
                    $product_names[] = !empty($variation_product->post_excerpt) ? $variation_product->post_excerpt : $variation_product->post_title;
                } else {
                    $product_names[] = $product->get_name();
                }
            }
        }
        $product_name = implode(', ', $product_names);

        $product_names = [];
        foreach ($items as $item) {
            $product = $item->get_product();
            if (class_exists('\WC_Subscriptions_Product') && WC_Subscriptions_Product::is_subscription($product)) {
                $product_names[] = $product->get_id();
            }
        }
        $product_id = implode(', ', $product_names);

        $subscription_id = $subscription->get_id();

        $subscription_status = $subscription->get_status();

        $subscription_end_time = $subscription->get_date('end');
        if (empty($subscription_end_time) || $subscription_end_time == 0) {
            $subscription_end_time = 'N/A';
        }

        $subscription_next_payment_time = $subscription->get_date('next_payment');
        if (empty($subscription_next_payment_time) || $subscription_next_payment_time == 0) {
            $subscription_next_payment_time = 'N/A';
        }

        $subscription_trial_end_time = $subscription->get_date('trial_end');
        if (empty($subscription_trial_end_time) || $subscription_trial_end_time == 0) {
            $subscription_trial_end_time = 'N/A';
        }

        $product_urls = [];
        foreach ($items as $item) {
            $product = $item->get_product();
            if (class_exists('\WC_Subscriptions_Product') && WC_Subscriptions_Product::is_subscription($product)) {
                $product_urls[] = get_permalink(wp_get_post_parent_id($product->get_id()));
            }
        }
        $product_url = implode(', ', $product_urls);

        $product_thumb = [];
        foreach ($items as $item) {
            $product = $item->get_product();
            if (class_exists('\WC_Subscriptions_Product') && WC_Subscriptions_Product::is_subscription($product)) {
                $product_thumb[] = get_post_thumbnail_id(wp_get_post_parent_id($product->get_id()));
            }
        }
        $product_thumb_id = implode(', ', $product_thumb);
        if (empty($product_thumb_id) || $product_thumb_id == 0) {
            $product_thumb_id = 'N/A';
        }

        $product_thumburl = [];
        foreach ($items as $item) {
            $product = $item->get_product();
            if (class_exists('\WC_Subscriptions_Product') && WC_Subscriptions_Product::is_subscription($product)) {
                $product_thumburl[] = get_the_post_thumbnail_url(wp_get_post_parent_id($product->get_id()));
            }
        }
        $product_thumb_url = implode(', ', $product_thumburl);
        if (empty($product_thumb_url)) {
            $product_thumb_url = 'N/A';
        }
        $order_total = $subscription->get_total();
        $user_id = $subscription->get_user_id();

        return $data = [
            'user_id'                        => $user_id,
            'product_id'                     => $product_id,
            'product_title'                  => $product_name,
            'product_url'                    => $product_url,
            'product_featured_image_url'     => $product_thumb_url,
            'product_featured_image_id'      => $product_thumb_id,
            'order_total'                    => $order_total,
            'product_quantity'               => $quantity,
            'subscription_id'                => $subscription_id,
            'subscription_status'            => $subscription_status,
            'subscription_trial_end_date'    => $subscription_trial_end_time,
            'subscription_end_date'          => $subscription_end_time,
            'subscription_next_payment_date' => $subscription_next_payment_time,
        ];
    }

    public static function getOrderStatus()
    {
        $orderStatuses = wc_get_order_statuses();
        wp_send_json_success($orderStatuses);
    }

    public static function getWooCommerceProduct()
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
        }
        wp_send_json_success($allProducts);
    }

    public static function getProductCategories()
    {
        $orderby = 'name';
        $order = 'asc';
        $hide_empty = false;
        $args = [
            'orderby'    => $orderby,
            'order'      => $order,
            'hide_empty' => $hide_empty,
            'taxonomy'   => 'product_cat',
        ];

        $product_categories_list = get_terms($args);
        if (empty($product_categories_list)) {
            return;
        }
        foreach ($product_categories_list as $key => $category) {
            $product_categories[] = [
                'term_id' => (string) $category->term_id,
                'name'    => $category->name,
            ];
        }
        wp_send_json_success($product_categories, 200);
    }

    public static function getUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function getVariationOfProduct($requestPrarams)
    {
        $allVariation = WCHelper::getAllVariations($requestPrarams->product_id);
        wp_send_json_success($allVariation, 200);
    }

    private static function executeProductTriggers($postId, $triggeredEntityId, $extra = [])
    {
        if (empty($postId) || empty($triggeredEntityId)) {
            return;
        }

        $flows = Flow::exists('WC', $triggeredEntityId);
        if (empty($flows)) {
            return;
        }

        $productData = WCHelper::processProductData($postId, $extra);
        Flow::execute('WC', $triggeredEntityId, $productData, $flows);
    }

    private static function isPluginActivated()
    {
        if (!static::isActivate()) {
            // translators: %s: Placeholder value
            wp_send_json_error(\sprintf(__('%s is not installed or activated', 'bit-integrations'), 'WooCommerce'));
        }
    }

    private static function isActivate()
    {
        return class_exists('WooCommerce');
    }
}
