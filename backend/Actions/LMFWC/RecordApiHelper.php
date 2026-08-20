<?php

/**
 * LMFWC Record Api
 */

namespace BitApps\Integrations\Actions\LMFWC;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $integrationDetails;

    private $integrationId;

    private $apiUrl;

    private $defaultHeader;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId, $apiSecret, $apiKey, $baseUrl)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = "{$baseUrl}/wp-json/lmfwc/v2";
        $this->defaultHeader = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:{$apiSecret}"),
            'Content-Type'  => 'application/json',
        ];
    }

    public function createLicense($finalData)
    {
        $this->type = 'Create license';
        $this->typeName = 'Create license';

        if (empty($finalData['license_key'])) {
            return ['success' => false, 'message' => __('Required field license key is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($this->integrationDetails->selectedStatus)) {
            return ['success' => false, 'message' => __('Required field status is empty', 'bit-integrations'), 'code' => 400];
        }

        if (isset($this->integrationDetails->selectedStatus) || !empty($this->integrationDetails->selectedStatus)) {
            $finalData['status'] = $this->integrationDetails->selectedStatus;
        }
        if (isset($this->integrationDetails->selectedCustomer) || !empty($this->integrationDetails->selectedCustomer)) {
            $finalData['user_id'] = $this->integrationDetails->selectedCustomer;
        }
        if (isset($this->integrationDetails->selectedOrder) || !empty($this->integrationDetails->selectedOrder)) {
            $finalData['order_id'] = $this->integrationDetails->selectedOrder;
        }
        if (isset($this->integrationDetails->selectedProduct) || !empty($this->integrationDetails->selectedProduct)) {
            $finalData['product_id'] = $this->integrationDetails->selectedProduct;
        }

        $apiEndpoint = $this->apiUrl . '/licenses';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader, ['sslverify' => false]);
    }

    public function updateLicense($finalData)
    {
        $this->type = 'Update license';
        $this->typeName = 'Update license';

        if (empty($this->integrationDetails->selectedLicense)) {
            return ['success' => false, 'message' => __('Required field license is empty', 'bit-integrations'), 'code' => 400];
        }

        if (isset($this->integrationDetails->selectedStatus) || !empty($this->integrationDetails->selectedStatus)) {
            $finalData['status'] = $this->integrationDetails->selectedStatus;
        }
        if (isset($this->integrationDetails->selectedCustomer) || !empty($this->integrationDetails->selectedCustomer)) {
            $finalData['user_id'] = $this->integrationDetails->selectedCustomer;
        }
        if (isset($this->integrationDetails->selectedOrder) || !empty($this->integrationDetails->selectedOrder)) {
            $finalData['order_id'] = $this->integrationDetails->selectedOrder;
        }
        if (isset($this->integrationDetails->selectedProduct) || !empty($this->integrationDetails->selectedProduct)) {
            $finalData['product_id'] = $this->integrationDetails->selectedProduct;
        }

        $response = Hooks::apply(Config::withPrefix('lmfwc_update_licence'), false, $finalData, $this->apiUrl, $this->integrationDetails, $this->defaultHeader);

        $response = Hooks::apply('btcbi_lmfwc_update_licence', $response, $finalData, $this->apiUrl, $this->integrationDetails, $this->defaultHeader);
        if (!$response) {
            // translators: %s: Plugin name
            return (object) ['message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')];
        }

        return $response;
    }

    public function updateGenerator($finalData)
    {
        $this->type = 'Update generator';
        $this->typeName = 'Update generator';

        if (empty($this->integrationDetails->selectedGenerator)) {
            return ['success' => false, 'message' => __('Required field Generator is empty', 'bit-integrations'), 'code' => 400];
        }

        $response = Hooks::apply(Config::withPrefix('lmfwc_update_generator'), false, $this->apiUrl, $finalData, $this->defaultHeader, $this->integrationDetails->selectedGenerator);

        $response = Hooks::apply('btcbi_lmfwc_update_generator', $response, $this->apiUrl, $finalData, $this->defaultHeader, $this->integrationDetails->selectedGenerator);
        if (!$response) {
            // translators: %s: Plugin name
            return (object) ['message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')];
        }

        return $response;
    }

    public function createGenerator($finalData)
    {
        $this->type = 'Create generator';
        $this->typeName = 'Create generator';

        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field name is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['charset'])) {
            return ['success' => false, 'message' => __('Required field Character map is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['chunks'])) {
            return ['success' => false, 'message' => __('Required field Number of chunks is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['chunk_length'])) {
            return ['success' => false, 'message' => __('Required field Chunk length is empty', 'bit-integrations'), 'code' => 400];
        }

        $response = Hooks::apply(Config::withPrefix('lmfwc_create_generator'), false, $this->apiUrl, $finalData, $this->defaultHeader);

        $response = Hooks::apply('btcbi_lmfwc_create_generator', $response, $this->apiUrl, $finalData, $this->defaultHeader);
        if (!$response) {
            // translators: %s: Plugin name
            return (object) ['message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')];
        }

        return $response;
    }

    public function licenseRelatedAction($finalData, $action)
    {
        $this->type = "{$action} license";
        $this->typeName = "{$action} license";

        if (empty($finalData['license_key'])) {
            return ['success' => false, 'message' => __('Required field license key is empty', 'bit-integrations'), 'code' => 400];
        }

        switch ($action) {
            case 'activate':
                $response = Hooks::apply(Config::withPrefix('lmfwc_activate_licence'), false, $this->apiUrl, $finalData['license_key'], $this->defaultHeader);

                $response = Hooks::apply('btcbi_lmfwc_activate_licence', $response, $this->apiUrl, $finalData['license_key'], $this->defaultHeader);

                break;
            case 'deactivate':
                $response = Hooks::apply(Config::withPrefix('lmfwc_deactivate_licence'), false, $this->apiUrl, $finalData['license_key'], $this->defaultHeader, $finalData['token']);

                $response = Hooks::apply('btcbi_lmfwc_deactivate_licence', $response, $this->apiUrl, $finalData['license_key'], $this->defaultHeader, $finalData['token']);

                break;
            case 'reactivate':
                $response = Hooks::apply(Config::withPrefix('lmfwc_reactivate_licence'), false, $this->apiUrl, $finalData['license_key'], $this->defaultHeader, $finalData['token']);

                $response = Hooks::apply('btcbi_lmfwc_reactivate_licence', $response, $this->apiUrl, $finalData['license_key'], $this->defaultHeader, $finalData['token']);

                break;
            case 'delete':
                $response = Hooks::apply(Config::withPrefix('lmfwc_delete_licence'), false, $this->apiUrl, $finalData['license_key'], $this->defaultHeader);

                $response = Hooks::apply('btcbi_lmfwc_delete_licence', $response, $this->apiUrl, $finalData['license_key'], $this->defaultHeader);

                break;

            default:
                $response = false;

                break;
        }

        if (!$response) {
            // translators: %s: Plugin name
            return (object) ['message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')];
        }

        return $response;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->lmfwcFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? Common::replaceFieldWithValue($value->customValue, $data) : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $module)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        switch ($module) {
            case 'create_license':
                $apiResponse = $this->createLicense($finalData);

                break;
            case 'update_license':
                $apiResponse = $this->updateLicense($finalData);

                break;
            case 'activate_license':
                $apiResponse = $this->licenseRelatedAction($finalData, 'activate');

                break;
            case 'deactivate_license':
                $apiResponse = $this->licenseRelatedAction($finalData, 'deactivate');

                break;
            case 'reactivate_license':
                $apiResponse = $this->licenseRelatedAction($finalData, 'reactivate');

                break;
            case 'delete_license':
                $apiResponse = $this->licenseRelatedAction($finalData, 'delete');

                break;
            case 'create_generator':
                $apiResponse = $this->createGenerator($finalData);

                break;
            case 'update_generator':
                $apiResponse = $this->updateGenerator($finalData);

                break;
        }

        if (isset($apiResponse->success) && $apiResponse->success && !isset($apiResponse->data->errors)) {
            $res = [$this->typeName . '  successfully'];

            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            if (is_wp_error($apiResponse)) {
                $res = $apiResponse->get_error_message();
            } elseif (isset($apiResponse->data->errors)) {
                $res = $apiResponse->data->errors->lmfwc_rest_data_error[0] ?? wp_json_encode($apiResponse);
            } else {
                $res = !empty($apiResponse->message) ? $apiResponse->message : wp_json_encode($apiResponse);
            }

            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', $res);
        }

        return $apiResponse;
    }
}
