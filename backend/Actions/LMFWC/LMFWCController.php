<?php

/**
 * LMFWC Integration
 */

namespace BitApps\Integrations\Actions\LMFWC;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for LMFWC integration
 */
class LMFWCController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'lmfwc',
        'fields'   => [
            'api_key'    => 'value',
            'api_secret' => 'api_secret',
            'base_url'   => 'base_url',
        ],
    ];

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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $apiSecret = $integrationDetails->api_secret;
        $baseUrl = $integrationDetails->base_url;
        $fieldMap = $integrationDetails->field_map;
        $module = $integrationDetails->module;

        if (empty($fieldMap) || empty($apiSecret) || empty($module) || empty($apiKey) || empty($baseUrl)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'License Manager For WooCommerce'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiSecret, $apiKey, $baseUrl);
        $lmfwcApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $module);

        if (is_wp_error($lmfwcApiResponse)) {
            return $lmfwcApiResponse;
        }

        return $lmfwcApiResponse;
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
