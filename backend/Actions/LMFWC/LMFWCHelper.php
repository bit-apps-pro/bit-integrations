<?php

/**
 * LMFWC Integration
 */

namespace BitApps\Integrations\Actions\LMFWC;

use BitApps\Integrations\Core\Util\HttpHelper;

class LMFWCHelper
{
    protected $_defaultHeader;

    public function getAllCustomer($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->api_key, $fieldsRequestParams->api_secret);

        $customers = get_users(['role' => 'customer', 'number' => -1]);

        wp_send_json_success(array_map(function ($customer) {
            return ['id' => $customer->ID, 'name' => $customer->display_name];
        }, $customers), 200);
    }

    public function getAllProduct($fieldsRequestParams)
    {
        if (!class_exists('WooCommerce')) {
            wp_send_json_success([], 200);
        }

        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->api_key, $fieldsRequestParams->api_secret);

        $products = wc_get_products(['status' => 'publish', 'limit' => -1]);

        wp_send_json_success(array_map(function ($product) {
            return ['id' => $product->get_id(), 'name' => $product->get_title()];
        }, $products), 200);
    }

    public function getAllOrder($fieldsRequestParams)
    {
        if (!class_exists('WooCommerce')) {
            wp_send_json_success([], 200);
        }

        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->api_key, $fieldsRequestParams->api_secret);

        $orders = wc_get_orders(['limit' => -1, 'orderby' => 'date', 'order' => 'DESC']);

        wp_send_json_success(array_map(function ($order) {
            return ['id' => $order->get_id(), 'name' => '#' . $order->get_id() . ' Order'];
        }, $orders), 200);
    }

    public function getAllLicense($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->api_key, $fieldsRequestParams->api_secret);

        $apiEndpoint = $fieldsRequestParams->base_url . '/wp-json/lmfwc/v2/licenses';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader, ['sslverify' => false]);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message(), HttpHelper::$responseCode);
        }
        if (isset($response->success) && $response->success) {
            wp_send_json_success(array_column($response->data, 'licenseKey'), 200);
        }

        wp_send_json_error(!empty($response->message) ? $response->message : wp_json_encode($response), 400);
    }

    public function getAllGenerator($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->api_key, $fieldsRequestParams->api_secret);

        $apiEndpoint = $fieldsRequestParams->base_url . '/wp-json/lmfwc/v2/generators';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader, ['sslverify' => false]);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message(), HttpHelper::$responseCode);
        }
        if (isset($response->success) && $response->success) {
            wp_send_json_success(array_map(function ($generator) {
                return ['id' => $generator->id, 'name' => $generator->name];
            }, $response->data), 200);
        }

        wp_send_json_error(!empty($response->message) ? $response->message : wp_json_encode($response), 400);
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->base_url) || empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_secret) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($apiKey, $apiSecret)
    {
        $this->_defaultHeader = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:{$apiSecret}"),
            'Content-Type'  => 'application/json',
        ];
    }
}
