<?php

/**
 * FreshSales    Record Api
 */

namespace BitApps\Integrations\Actions\FreshSales;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationDetails;

    private $_integrationID;

    private $_defaultHeader;

    private $baseUrl;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->baseUrl = $this->_integrationDetails->bundle_alias;
        $this->_defaultHeader = [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Token token=' . $this->_integrationDetails->api_key
        ];
    }

    public function insertRecord(
        $module,
        $finalData
    ) {
        if ($module === 'contact') {
            $finalData['sales_accounts'] = [(object) ['id' => $this->_integrationDetails->moduleData->account_id, 'is_primary' => true]];
        }

        if ($module === 'deal') {
            $finalData['contacts_added_list'] = [$this->_integrationDetails->moduleData->contact_id];
        }

        if ($module === 'account') {
            $module = 'sales_account';
        }

        if ($module === 'product') {
            $apiEndpoints = 'https://' . $this->baseUrl . '/api/cpq/' . $module . 's';
        } else {
            $apiEndpoints = 'https://' . $this->baseUrl . '/api/' . $module . 's';
        }

        $actions = $this->_integrationDetails->actions;
        $body = wp_json_encode([$module => $finalData]);

        return HttpHelper::post($apiEndpoints, $body, $this->_defaultHeader);
    }

    public function upsertRecord($module, $finalData)
    {
        $response = Hooks::apply(Config::withPrefix('freshsales_upsert_record'), $module, $finalData, $this->_integrationDetails, $this->_defaultHeader, $this->baseUrl);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_freshsales_upsert_record` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_freshsales_upsert_record', $response, $finalData, $this->_integrationDetails, $this->_defaultHeader, $this->baseUrl);

        if (\is_string($response) && $response == $module) {
            return $this->insertRecord($module, $finalData);
        }

        return $response;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        $customFields = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->freshSalesFormField;
            if (strpos($actionValue, 'cf_') === 0) {
                $customFields[$actionValue] = $data[$triggerValue];
            } elseif (strpos($actionValue, 'cf_') === 0 && $triggerValue === 'custom') {
                $customFields[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        if (!empty($customFields)) {
            $dataFinal['custom_field'] = $customFields;
        }

        return $dataFinal;
    }

    public function execute(
        $fieldValues,
        $fieldMap,
        $module,
        $actions
    ) {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if (isset($actions->upsert) && $actions->upsert && $module != 'Product') {
            $apiResponse = $this->upsertRecord($module, $finalData);
        } else {
            $apiResponse = $this->insertRecord($module, $finalData);
        }

        if (isset($apiResponse->errors)) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $module, 'type_name' => 'add-' . $module]), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $module, 'type_name' => 'add-' . $module]), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
