<?php

/**
 * WooCommerce Record Api.
 */

namespace BitApps\Integrations\Actions\WooCommerce;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use WC_Product_Download;
use WP_Error;

/**
 * Provide functionality for Record insert,upsert.
 */
class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integId)
    {
        $this->_integrationID = $integId;
    }

    public function createCustomer($fieldMapCustomer, $required, $module, $fieldValues)
    {
        foreach ($fieldMapCustomer as $fieldPair) {
            if (!empty($fieldPair->wcField) && !empty($fieldPair->formField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldDataCustomer[$fieldPair->wcField] = $fieldPair->customValue;
                } else {
                    $fieldDataCustomer[$fieldPair->wcField] = $fieldValues[$fieldPair->formField];
                }

                if (\in_array($fieldPair->wcField, $required) && empty($fieldValues[$fieldPair->formField])) {
                    // translators: %s: Placeholder value
                    $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%1$s is required for woocommerce %2$s', 'bit-integrations'), $fieldPair->wcField, $module));
                    LogHandler::save($this->_integrationID, ['type' => $module, 'type_name' => 'create'], 'validation', $error);

                    return $error;
                }
            }
        }

        if (!\is_array($fieldDataCustomer) || \count($fieldDataCustomer) === 0) {
            return get_current_user_id();
        }

        $user_fields = ['user_pass', 'user_login', 'user_nicename', 'user_url', 'user_email', 'display_name', 'nickname', 'first_name', 'last_name', 'description', 'locale'];

        $user_inputs = array_intersect_key($fieldDataCustomer, array_flip($user_fields));
        $meta_inputs = array_diff_key($fieldDataCustomer, array_flip($user_fields));

        $fieldData = $user_inputs;
        $fieldData['role'] = 'customer';

        $user_id = wc_create_new_customer(
            $fieldData['user_email'],
            $fieldData['user_login'],
            isset($fieldData['user_pass']) ? $fieldData['user_pass'] : ''
        );

        if (is_wp_error($user_id) || !$user_id) {
            $response = is_wp_error($user_id) ? $user_id->get_error_message() : 'error';

            return LogHandler::save($this->_integrationID, ['type' => 'customer', 'type_name' => 'create'], 'error', $response);
        }
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Using WooCommerce's own hook for compatibility
        do_action('woocommerce_update_customer', $user_id);
        LogHandler::save($this->_integrationID, ['type' => 'customer', 'type_name' => 'create'], 'success', $user_id);

        foreach ($meta_inputs as $metaKey => $metaValue) {
            update_user_meta($user_id, $metaKey, $metaValue);
        }

        return $user_id;
        // }
    }

    public function findCustomer($fieldMapCustomer, $required, $module, $fieldValues)
    {
        foreach ($fieldMapCustomer as $fieldPair) {
            if (!empty($fieldPair->wcField) && !empty($fieldPair->formField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldDataCustomer[$fieldPair->wcField] = $fieldPair->customValue;
                } else {
                    $fieldDataCustomer[$fieldPair->wcField] = $fieldValues[$fieldPair->formField];
                }

                if (\in_array($fieldPair->wcField, $required) && empty($fieldValues[$fieldPair->formField])) {
                    // translators: %s: Placeholder value
                    $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%1$s is required for woocommerce %2$s', 'bit-integrations'), $fieldPair->wcField, $module));
                    LogHandler::save($this->_integrationID, ['type' => $module, 'type_name' => 'create'], 'validation', $error);

                    return $error;
                }
            }
        }

        $existUser = get_user_by('email', $fieldDataCustomer['user_email']);

        return isset($existUser->ID) ? $existUser->ID : false;
    }

    public function changeStatusById($id, $status)
    {
        $order = wc_get_order((int) $id);
        if ($order) {
            if (is_a($order, 'WC_Order_Refund')) {
                return $order;
            }
            $order->update_status($status);
        } else {
            // translators: %s: Placeholder value
            $error = new WP_Error('ORDER_NOT_FOUND', wp_sprintf(__('Order %s not found', 'bit-integrations'), $id));
            LogHandler::save($this->_integrationID, ['type' => 'order status changed', 'type_name' => 'Change Status'], 'validation', $error);

            return $error;
        }

        return $order;
    }

    public function statusChangeByOrderId($fieldData)
    {
        $order = wc_get_order((int) $fieldData['order_id']);

        if ($order) {
            if (is_a($order, 'WC_Order_Refund')) {
                return $order;
            }
            $order->update_status($fieldData['order_status']);
            LogHandler::save($this->_integrationID, ['type' => 'order-status-change', 'type_name' => 'Change Status'], 'success', $fieldData['order_id']);
        } else {
            // translators: %s: Placeholder value
            $error = new WP_Error('wrong order id', wp_sprintf(__('%s is not valid order id', 'bit-integrations'), $fieldData['order_id']));
            LogHandler::save($this->_integrationID, ['type' => 'order status changed', 'type_name' => 'Change Status'], 'validation', $error);

            return $error;
        }
    }

    public function changeStatus($orders, $fieldData)
    {
        $orderIds = [];
        if ($orders) {
            foreach ($orders as $order) {
                if (is_a($order, 'WC_Order_Refund')) {
                    continue;
                }
                $order_id = $order->get_id();
                $order = $this->changeStatusById($order_id, $fieldData['order_status']);
                $orderIds[] = $order_id;
            }
            LogHandler::save($this->_integrationID, ['type' => 'order-status-change', 'type_name' => 'Change Status'], 'success', $orderIds);
        } else {
            // translators: %s: Placeholder value
            $error = new WP_Error('ORDER_NOT_FOUND', wp_sprintf(__('Order %s not found', 'bit-integrations'), $orders));
            LogHandler::save($this->_integrationID, ['type' => 'order-status-change', 'type_name' => 'Change Status'], 'validation', $error);

            return $error;
        }
    }

    public function statusChangeByEmail($fieldData, $orderChange)
    {
        $orderArg = [
            'customer' => $fieldData['email'],
            'limit'    => $orderChange === 'lastest-order' ? 1 : -1,
            'orderby'  => 'id',
            'order'    => 'DESC',
        ];

        if ($orderChange === 'date-order' || $orderChange === 'prev-months-order') {
            $startDate = $orderChange === 'prev-months-order' ? gmdate('Y-m-d', strtotime('first day of previous month')) : gmdate('Y-m-d', strtotime($fieldData['from_date']));
            $endDate = $orderChange === 'prev-months-order' ? gmdate('Y-m-d', strtotime('last day of previous month')) : gmdate('Y-m-d', strtotime($fieldData['to_date']));
            $orderArg['date_created'] = "{$startDate}...{$endDate}";
        } elseif ($orderChange === 'n-prev-months-order') {
            $firstEndDate = gmdate('Y-m-d', strtotime('first day of previous month'));
            $endDate = gmdate('Y-m-d', strtotime('last day of previous month'));
            $targetDate = (int) $fieldData['n_months'] - 1;
            $startDate = gmdate('Y-m-d', strtotime("-{$targetDate} months, {$firstEndDate}"));
            $orderArg['date_created'] = "{$startDate}...{$endDate}";
        } elseif ($orderChange === 'n-days-order' || $orderChange === 'n-weeks-order' || $orderChange === 'n-months-order') {
            $typeString = $orderChange === 'n-days-order' ? 'days' : ($orderChange === 'n-weeks-order' ? 'week' : 'month');
            $orderChange = $orderChange === 'n-days-order' ? 'n_days' : ($orderChange === 'n-weeks-order' ? 'n_weeks' : 'n_months');
            $days = $fieldData[$orderChange];
            $days_ago = gmdate('Y-m-d', strtotime("-{$days} {$typeString}"));
            $orderArg['date_created'] = ">={$days_ago}";
        }

        $orders = wc_get_orders($orderArg);

        return $this->changeStatus($orders, $fieldData);
    }

    public function statusChangeBySpecificDays($fieldData, $type)
    {
        if ($type === 'n-days' || $type === 'n-weeks' || $type === 'n-months') {
            $typeString = $type === 'n-days' ? 'days' : ($type === 'n-weeks' ? 'week' : 'month');
            $type = $type === 'n-days' ? 'n_days' : ($type === 'n-weeks' ? 'n_weeks' : 'n_months');
            $days = (int) $fieldData[$type];
            $days_ago = gmdate('Y-m-d', strtotime("-{$days} {$typeString}"));
        } else {
            if ($type === 'n-prev-months') {
                $firstEndDate = gmdate('Y-m-d', strtotime('first day of previous month'));
                $endDate = gmdate('Y-m-d', strtotime('last day of previous month'));
                $targetDate = $fieldData['n_months'] - 1;
                $startDate = gmdate('Y-m-d', strtotime("-{$targetDate} months, {$firstEndDate}"));
            } else {
                $startDate = $type === 'prev-months' ? gmdate('Y-m-d', strtotime('first day of previous month')) : gmdate('Y-m-d', strtotime($fieldData['from_date']));
                $endDate = $type === 'prev-months' ? gmdate('Y-m-d', strtotime('last day of previous month')) : gmdate('Y-m-d', strtotime($fieldData['to_date']));
            }
        }

        $orderArg = [
            'orderby'      => 'id',
            'order'        => 'DESC',
            'limit'        => -1,
            'date_created' => ($type !== 'prev-months' && $type !== 'date-range' && $type !== 'n-prev-months') ? ">={$days_ago}" : "{$startDate}...{$endDate}",
        ];

        $orders = wc_get_orders($orderArg);

        return $this->changeStatus($orders, $fieldData);
    }

    public function cancelSubscription($product_id)
    {
        if (!\function_exists('wcs_get_users_subscriptions')) {
            return;
        }
        $user_id = get_current_user_id();

        $subscriptions = wcs_get_users_subscriptions($user_id);

        foreach ($subscriptions as $subscription) {
            $items = $subscription->get_items();
            foreach ($items as $index => $item) {
                if ('any' === \intval($product_id) || (absint($item->get_product_id()) === absint($product_id))) {
                    if ($subscription->has_status(['active']) && $subscription->can_be_updated_to('cancelled')) {
                        $subscription->update_status('cancelled');
                        $subscription_cancelled = true;
                    }
                }
            }
        }

        return $subscription_cancelled;
    }

    public function execute($module, $fieldValues, $fieldMap, $uploadFieldMap, $required, $integrationDetails)
    {
        $fieldData = [];
        foreach ($fieldMap as $fieldPair) {
            if (!empty($fieldPair->wcField) && !empty($fieldPair->formField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->wcField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                } else {
                    $fieldData[$fieldPair->wcField] = $fieldValues[$fieldPair->formField];
                }

                if (\in_array($fieldPair->wcField, $required) && empty($fieldValues[$fieldPair->formField])) {
                    // translators: %s: Placeholder value
                    $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%1$s is required for woocommerce %2$s', 'bit-integrations'), $fieldPair->wcField, $module));
                    LogHandler::save($this->_integrationID, ['type' => $module, 'type_name' => 'create'], 'validation', $error);

                    return $error;
                }
            }
        }

        $entry_type = 'create';

        if ($module === 'product') {
            if (!empty($fieldData['tags_input'])) {
                $tags = explode(',', $fieldData['tags_input']);
                unset($fieldData['tags_input']);
            }

            if (!empty($fieldData['post_category'])) {
                $categories = explode(',', $fieldData['post_category']);
                unset($fieldData['post_category']);
            }

            if (!empty($fieldData['_regular_price'])) {
                $price = $fieldData['_regular_price'];
            }

            if (!empty($fieldData['_sale_price'])) {
                $price = $fieldData['_sale_price'];
            }

            if (!empty($fieldData['product_type'])) {
                $product_type = $fieldData['product_type'];
                if ($product_type === 'external' && !empty($fieldData['_product_url'])) {
                    $product_type = 'external';
                } else {
                    $product_type = 'simple';
                    unset($fieldData['_product_url'], $fieldData['_button_text']);
                }
                unset($fieldData['product_type']);
            }

            $post_fields = [
                'post_content',
                'post_title',
                'post_status',
                'post_type',
                'comment_status',
                'post_password',
                'menu_order',
                'post_excerpt',
                'post_date',
                'post_date_gmt',
            ];

            $post_inputs = array_intersect_key($fieldData, array_flip($post_fields));
            $meta_inputs = array_diff_key($fieldData, array_flip($post_fields));

            $fieldData = $post_inputs;
            $fieldData['post_type'] = $module;
            $fieldData['meta_input'] = $meta_inputs;

            if (!empty($fieldData['post_date']) || !empty($fieldData['post_date_gmt'])) {
                $fieldData['post_status'] = 'future';
            }

            $product_id = wp_insert_post($fieldData);

            if (isset($product_type)) {
                wp_set_object_terms($product_id, $product_type, 'product_type');
            }

            if (isset($price)) {
                update_post_meta($product_id, '_price', $price);
            }

            if (isset($categories)) {
                wp_set_object_terms($product_id, $categories, 'product_cat');
            }

            if (isset($tags)) {
                wp_set_object_terms($product_id, $tags, 'product_tag');
            }

            if (is_wp_error($product_id) || !$product_id) {
                $response = is_wp_error($product_id) ? $product_id->get_error_message() : 'error';
                LogHandler::save($this->_integrationID, ['type' => 'product', 'type_name' => $entry_type], 'error', $response);

                return $response;
            }
            LogHandler::save($this->_integrationID, ['type' => 'product', 'type_name' => $entry_type], 'success', $product_id);
        }
        if ($module === 'customer') {
            $user_fields = ['user_pass', 'user_login', 'user_nicename', 'user_url', 'user_email', 'display_name', 'nickname', 'first_name', 'last_name', 'description', 'locale'];

            $user_inputs = array_intersect_key($fieldData, array_flip($user_fields));
            $meta_inputs = array_diff_key($fieldData, array_flip($user_fields));

            $fieldData = $user_inputs;
            $fieldData['role'] = $module;

            if (isset($id)) {
                $fieldData['ID'] = $id;
            }
            $user_id = wp_insert_user($fieldData);

            if (is_wp_error($user_id) || !$user_id) {
                $response = is_wp_error($user_id) ? $user_id->get_error_message() : 'error';

                return LogHandler::save($this->_integrationID, ['type' => 'customer', 'type_name' => $entry_type], 'error', $response);
            }
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Using WooCommerce's own hook for compatibility
            do_action('woocommerce_update_customer', $user_id);
            LogHandler::save($this->_integrationID, ['type' => 'customer', 'type_name' => $entry_type], 'success', $user_id);

            foreach ($meta_inputs as $metaKey => $metaValue) {
                update_user_meta($user_id, $metaKey, $metaValue);
            }
        }

        if ($module === 'order') {
            // Order created : https://gist.github.com/stormwild/7f914183fc18458f6ab78e055538dcf0
            $triggerEntity = $fieldValues['bit-integrator%trigger_data%']['triggered_entity'];
            $fieldMapCustomer = $integrationDetails->customer->field_map;
            $find_customer_id = $this->findCustomer($fieldMapCustomer, $required, $module, $fieldValues);
            $fieldMapLine = $integrationDetails->line_item->field_map;

            if (!empty($find_customer_id)) {
                $customer_id = $find_customer_id;
            } else {
                $customer_id = $this->createCustomer($fieldMapCustomer, $required, $module, $fieldValues);
            }

            $billingAddress = [
                'first_name' => isset($fieldData['billing_first_name']) ? $fieldData['billing_first_name'] : '',
                'last_name'  => isset($fieldData['billing_last_name']) ? $fieldData['billing_last_name'] : '',
                'company'    => isset($fieldData['billing_company']) ? $fieldData['billing_company'] : '',
                'address_1'  => isset($fieldData['billing_address_1']) ? $fieldData['billing_address_1'] : '',
                'address_2'  => isset($fieldData['billing_address_2']) ? $fieldData['billing_address_2'] : '',
                'city'       => isset($fieldData['billing_city']) ? $fieldData['billing_city'] : '',
                'state'      => isset($fieldData['billing_state']) ? $fieldData['billing_state'] : '',
                'postcode'   => isset($fieldData['billing_postcode']) ? $fieldData['billing_postcode'] : '',
                'country'    => isset($fieldData['billing_country']) ? $fieldData['billing_country'] : '',
                'email'      => isset($fieldData['billing_email']) ? $fieldData['billing_email'] : '',
                'phone'      => isset($fieldData['billing_phone']) ? $fieldData['billing_phone'] : '',
            ];
            $shippingAddress = [
                'first_name' => isset($fieldData['shipping_first_name']) ? $fieldData['shipping_first_name'] : '',
                'last_name'  => isset($fieldData['shipping_last_name']) ? $fieldData['shipping_last_name'] : '',
                'company'    => isset($fieldData['shipping_company']) ? $fieldData['shipping_company'] : '',
                'address_1'  => isset($fieldData['shipping_address_1']) ? $fieldData['shipping_address_1'] : '',
                'address_2'  => isset($fieldData['shipping_address_2']) ? $fieldData['shipping_address_2'] : '',
                'city'       => isset($fieldData['shipping_city']) ? $fieldData['shipping_city'] : '',
                'state'      => isset($fieldData['shipping_state']) ? $fieldData['shipping_state'] : '',
                'postcode'   => isset($fieldData['shipping_postcode']) ? $fieldData['shipping_postcode'] : '',
                'country'    => isset($fieldData['shipping_country']) ? $fieldData['shipping_country'] : '',
            ];

            if ($triggerEntity === 'FF') {
                $lineItemsFld = $fieldValues['repeater_field'];
                $fieldDataLineTemp = [];
                $fieldDataLine = [];

                if (!empty($lineItemsFld)) {
                    foreach ($lineItemsFld as $key => $lineItem) {
                        $this->setFieldDataLine($fieldDataLineTemp, $fieldMapLine, $required, $fieldValues, $module, !empty($lineItemsFld), $key);
                        $fieldDataLine[$key] = (object) $fieldDataLineTemp;
                    }
                } else {
                    $this->setFieldDataLine($fieldDataLineTemp, $fieldMapLine, $required, $fieldValues, $module, false);
                    $fieldDataLine[0] = (object) $fieldDataLineTemp;
                }

                $order = $this->product_added_to_order($fieldDataLine, $module, $customer_id);
                if (is_wp_error($order)) {
                    return $order;
                }
            } elseif ($triggerEntity === 'Formidable') {
                $lineTmpLength = strpos($fieldMapLine[0]->formField, '_');
                $lineItemKey = substr($fieldMapLine[0]->formField, 0, $lineTmpLength);
                $lineItemsFld = $fieldValues[$lineItemKey];
                $fieldDataLineTemp = [];
                $fieldDataLine = [];
                $lineItemCnt = 0;

                if (!empty($lineItemsFld)) {
                    foreach ($lineItemsFld as $key => $lineItem) {
                        $this->setFieldDataLine($fieldDataLineTemp, $fieldMapLine, [], $fieldValues, null, false, $key, !empty($lineItemsFld), $lineItemKey, $lineTmpLength);
                        $fieldDataLine[$lineItemCnt] = (object) $fieldDataLineTemp;
                        ++$lineItemCnt;
                    }
                } else {
                    $this->setFieldDataLine($fieldDataLineTemp, $fieldMapLine, [], $fieldValues, null);
                    $fieldDataLine[0] = (object) $fieldDataLineTemp;
                }

                $order = $this->product_added_to_order($fieldDataLine, $module, $customer_id);
                if (is_wp_error($order)) {
                    return $order;
                }
            } elseif ($triggerEntity === 'NF') {
                $lineTmpLength = stripos($fieldMapLine[0]->formField, '.');
                $lineItemKey = substr($fieldMapLine[0]->formField, 0, $lineTmpLength);
                $lineItemsFld = $fieldValues[$lineItemKey];
                $fieldDataLineTemp = [];
                $fieldDataLine = [];

                if (!empty($lineItemsFld)) {
                    foreach ($lineItemsFld as $key => $lineItem) {
                        $this->setFieldDataLine($fieldDataLineTemp, $fieldMapLine, [], $fieldValues, null, false, $key, false, !empty($lineItemsFld));
                        $fieldDataLine[$key] = (object) $fieldDataLineTemp;
                    }
                } else {
                    $this->setFieldDataLine($fieldDataLineTemp, $fieldMapLine, [], $fieldValues, null);
                    $fieldDataLine[0] = (object) $fieldDataLineTemp;
                }

                $order = $this->product_added_to_order($fieldDataLine, $module, $customer_id);
                if (is_wp_error($order)) {
                    return $order;
                }
            } else {
                $this->setFieldDataLine($fieldDataLineTemp, $fieldMapLine, [], $fieldValues, null);
                $fieldDataLine[0] = (object) $fieldDataLineTemp;
                $order = $this->product_added_to_order($fieldDataLine, $module, $customer_id);

                if (is_wp_error($order)) {
                    return $order;
                }
            }

            $order->set_address($billingAddress, 'billing');
            $order->set_address($shippingAddress, 'shipping');

            $fieldKeys = [
                'customer_note',
                'coupon_code',
                'status',
                'payment_method',
                'payment_method_title',
            ];

            foreach ($fieldKeys as $fieldKey) {
                if (isset($fieldData[$fieldKey])) {
                    $method = $fieldKey === 'coupon_code' ? 'apply_coupon' : 'set_' . $fieldKey;

                    $order->{$method}($fieldData[$fieldKey]);
                }
            }

            foreach ($fieldData as $key => $value) {
                if (strpos($key, 'shipping_') != 0 && strpos($key, 'billing_') != 0) {
                    $order->update_meta_data('_' . $key, sanitize_text_field(wp_unslash($value)));
                }
            }

            $order->calculate_totals();
            $order->save();

            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Using WooCommerce's own hook for compatibility
            do_action('woocommerce_checkout_order_processed', $order->ID, [], $order);

            if (is_wp_error($order) || !$order) {
                $response = is_wp_error($order) ? $order->get_error_message() : 'error';
                LogHandler::save($this->_integrationID, ['type' => 'order-create', 'type_name' => 'order'], 'error', $response);

                return $response;
            }
            LogHandler::save($this->_integrationID, ['type' => 'order-create', 'type_name' => 'order'], 'success', wp_json_encode("Your order id is: {$order->get_id()}"));
        }

        if ($module === 'changestatus') {
            $filterStatus = $integrationDetails->filterstatus;
            switch ($filterStatus) {
                case 'order-id':
                    $order = $this->statusChangeByOrderId($fieldData);

                    break;
                case 'email':
                    $orderChange = $integrationDetails->orderchange;
                    $order = $this->statusChangeByEmail($fieldData, $orderChange);

                    break;
                case 'n-days':
                case 'n-weeks':
                case 'n-months':
                case 'prev-months':
                case 'n-prev-months':
                case 'date-range':
                    $order = $this->statusChangeBySpecificDays($fieldData, $filterStatus);

                    break;
            }
        }

        if ($module === 'cancelSubscription') {
            $productId = $integrationDetails->productId;
            $response = $this->cancelSubscription($productId);
            if ($response) {
                LogHandler::save($this->_integrationID, ['type' => 'cancelSubscription', 'type_name' => 'cancelSubscription'], 'success', wp_json_encode(__('Subscription cancelled successfully', 'bit-integrations')));
            } else {
                LogHandler::save($this->_integrationID, ['type' => 'cancelSubscription', 'type_name' => 'cancelSubscription'], 'error', wp_json_encode(__('Subscription not cancelled', 'bit-integrations')));
            }
        }

        if (isset($product_id)) {
            foreach ($uploadFieldMap as $uploadField) {
                if (!empty($uploadField->formField) && !empty($uploadField->wcField)) {
                    if ($uploadField->wcField === 'product_image') {
                        $flag = 0;
                    } elseif ($uploadField->wcField === 'product_gallery') {
                        $flag = 1;
                    } elseif ($uploadField->wcField === 'downloadable_files') {
                        $flag = 2;
                    } else {
                        $flag = 3;
                    }

                    $attach_ids = '';
                    if (!empty($fieldValues[$uploadField->formField])) {
                        $uplaodFiles = $fieldValues[$uploadField->formField];
                        if (\gettype($fieldValues[$uploadField->formField]) === 'string') {
                            $uplaodFiles = json_decode($fieldValues[$uploadField->formField]) ?? $fieldValues[$uploadField->formField];
                        }
                        if (\is_array($uplaodFiles)) {
                            foreach ($uplaodFiles as $file) {
                                if (\is_array($file)) {
                                    foreach ($file as $singleFile) {
                                        $url = $singleFile;
                                        $attach_id = $this->attach_product_attachments($product_id, $flag, $url, $singleFile);
                                        if ($flag === 1 && $attach_id) {
                                            $attach_ids .= ',' . $attach_id;
                                        }
                                    }
                                } else {
                                    $url = $file;
                                    $attach_id = $this->attach_product_attachments($product_id, $flag, $url, $file);
                                    if ($flag === 1 && $attach_id) {
                                        $attach_ids .= ',' . $attach_id;
                                    }
                                }
                            }
                        } else {
                            $filename = $uplaodFiles;
                            $url = $filename;

                            $attach_ids = $this->attach_product_attachments($product_id, $flag, $url, $filename);
                        }
                    }

                    if ($flag === 1) {
                        update_post_meta($product_id, '_product_image_gallery', $attach_ids);
                    } elseif ($flag === 3) {
                        update_post_meta($product_id, $uploadField->wcField, wp_json_encode($attach_ids));
                    }
                }
            }
        }
    }

    public function upload_attachment($product_id, $url)
    {
        include_once ABSPATH . 'wp-admin/includes/image.php';
        $image_url = $url;
        $url_array = explode('/', $url);
        $image_name = $url_array[\count($url_array) - 1];

        $response = wp_remote_get($image_url);
        if (is_wp_error($response)) {
            return false;
        }
        $image_data = wp_remote_retrieve_body($response);
        $upload_dir = wp_upload_dir();
        $unique_file_name = wp_unique_filename($upload_dir['path'], $image_name);
        $filename = basename($unique_file_name);

        if (wp_mkdir_p($upload_dir['path'])) {
            $file = $upload_dir['path'] . '/' . $filename;
        } else {
            $file = $upload_dir['basedir'] . '/' . $filename;
        }
        file_put_contents($file, $image_data);

        $wp_filetype = wp_check_filetype($filename, null);

        $attachment = [
            'post_mime_type' => $wp_filetype['type'],
            'post_title'     => sanitize_file_name($filename),
            'post_content'   => '',
            'post_status'    => 'inherit',
        ];

        $attach_id = wp_insert_attachment($attachment, $file, $product_id);
        $attach_data = wp_generate_attachment_metadata($attach_id, $file);

        wp_update_attachment_metadata($attach_id, $attach_data);

        return $attach_id;
    }

    public function attach_product_attachments($product_id, $flag, $url, $filename)
    {
        if ($flag != 2) {
            $attach_id = $this->upload_attachment($product_id, $url);
            if ($flag === 0) {
                set_post_thumbnail($product_id, $attach_id);
            }

            return $attach_id;
        }
        $this->attach_downloadable_attachments($product_id, $url, $filename);
    }

    public function attach_downloadable_attachments($product_id, $url, $filename)
    {
        if (get_post_meta($product_id, '_downloadable', true) != 'yes' && get_post_meta($product_id, '_downloadable', true) != true) {
            return false;
        }

        include_once \dirname(WC_PLUGIN_FILE) . '/includes/wc-product-functions.php';

        $attach_id = $this->upload_attachment($product_id, $url);
        $download_id = md5($url);
        $file_url = wp_get_attachment_url($attach_id);
        $url_array = explode('/', $url);
        $image_name = $url_array[\count($url_array) - 1];

        $pd_object = new WC_Product_Download();
        $pd_object->set_id($download_id);
        $pd_object->set_name($image_name);
        $pd_object->set_file($file_url);

        $product = wc_get_product($product_id);

        $downloads = $product->get_downloads();
        $downloads[$download_id] = $pd_object;

        $product->set_downloads($downloads);
        $product->save();
    }

    private function setFieldDataLine(&$fieldDataLineTemp, $fieldMapLine, $required, $fieldValues, $module, $FF = false, $key = null, $Formidable = false, $NF = false, $lineItemKey = false, $lineTmpLength = false)
    {
        foreach ($fieldMapLine as $fieldPair) {
            if (!empty($fieldPair->wcField) && !empty($fieldPair->formField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldDataLineTemp[$fieldPair->wcField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                } elseif ($FF) {
                    $fldDigit = preg_replace('/[^0-9.]+/', '', $fieldPair->formField);
                    $formFld = 'repeater_field:' . $key . '-' . $fldDigit;
                    $fieldDataLineTemp[$fieldPair->wcField] = $fieldValues[$formFld];
                } elseif ($Formidable) {
                    $fldDigit = substr($fieldPair->formField, $lineTmpLength + 1, \strlen($fieldPair->formField));
                    $formFld = $lineItemKey . '_' . $fldDigit . '_' . $key;
                    $fieldDataLineTemp[$fieldPair->wcField] = $fieldValues[$formFld];
                } elseif ($NF) {
                    $formFld = $fieldPair->formField . '_' . $key;
                    $fieldDataLineTemp[$fieldPair->wcField] = $fieldValues[$formFld];
                } else {
                    $fieldDataLineTemp[$fieldPair->wcField] = $fieldValues[$fieldPair->formField];
                }

                if (\in_array($fieldPair->wcField, $required) && empty($fieldValues[$fieldPair->formField])) {
                    // translators: %s: Placeholder value
                    $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%1$s is required for woocommerce %2$s', 'bit-integrations'), $fieldPair->wcField, $module));
                    LogHandler::save($this->_integrationID, ['type' => $module, 'type_name' => 'create'], 'validation', $error);

                    return $error;
                }
            }
        }
    }

    private function product_added_to_order($fieldDataLine, $module, $customer_id)
    {
        foreach ($fieldDataLine as $lineItem) {
            $product_id = wc_get_product_id_by_sku($lineItem->sku);

            if (!$product_id) {
                // translators: %s: Placeholder value
                $error = new WP_Error('wrong product sku', wp_sprintf(__('%s is not valid product sku or product price is empty!', 'bit-integrations'), $lineItem->sku));
                LogHandler::save($this->_integrationID, ['type' => $module, 'type_name' => 'create'], 'validation', $error);

                return $error;
            }

            $order = wc_create_order(['customer_id' => $customer_id]);
            $product = wc_get_product($product_id);

            $lineArgs = [];
            if (isset($lineItem->subtotal) && $lineItem->subtotal !== '') {
                $lineArgs['subtotal'] = (float) $lineItem->subtotal;
            }
            if (isset($lineItem->total) && $lineItem->total !== '') {
                $lineArgs['total'] = (float) $lineItem->total;
            }
            if (isset($lineItem->line_subtotal_tax) && $lineItem->line_subtotal_tax !== '') {
                $lineArgs['subtotal_tax'] = (float) $lineItem->line_subtotal_tax;
            }

            $order->add_product($product, (int) $lineItem->quantity, $lineArgs);

            return $order;
        }
    }
}
