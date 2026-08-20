<?php

/**
 * SmartSuite Record Api
 */

namespace BitApps\Integrations\Actions\SmartSuite;

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

    private $workspaceId;

    private $apiToken;

    public function __construct($integrationDetails, $integId, $workspaceId, $apiToken)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->workspaceId = $workspaceId;
        $this->apiToken = $apiToken;
        $this->apiUrl = 'https://app.smartsuite.com/api/v1/';
        $this->defaultHeader = [
            'ACCOUNT-ID'    => $workspaceId,
            'Authorization' => 'Token ' . $apiToken,
            'Content-Type'  => 'application/json'
        ];
    }

    public function handleFilterResponse($response)
    {
        if ($response) {
            return $response;
        }

        // translators: %s: Placeholder value
        return (object) ['error' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')];
    }

    public function createSolution($finalData)
    {
        if (isset($this->integrationDetails->selectedLogoColor) && !empty($this->integrationDetails->selectedLogoColor)) {
            $finalData['logo_color'] = $this->integrationDetails->selectedLogoColor;
        }
        $apiEndpoint = $this->apiUrl . 'solutions/';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function createTable($requestParams)
    {
        $response = Hooks::apply(Config::withPrefix('smartSuite_create_table'), false, $requestParams, $this->workspaceId, $this->apiToken, $this->integrationDetails->selectedSolution);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_smartSuite_create_table` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_smartSuite_create_table', $response, $requestParams, $this->workspaceId, $this->apiToken, $this->integrationDetails->selectedSolution);

        return $this->handleFilterResponse($response);
    }

    public function createRecord($requestParams)
    {
        $response = Hooks::apply(Config::withPrefix('smartSuite_create_record'), false, $requestParams, $this->integrationDetails, $this->workspaceId, $this->apiToken);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_smartSuite_create_record` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_smartSuite_create_record', $response, $requestParams, $this->integrationDetails, $this->workspaceId, $this->apiToken);

        return $this->handleFilterResponse($response);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->smartSuiteFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $this->typeName = 'create';
        switch ($actionName) {
            case 'solution':
                $this->type = 'solution';
                $apiResponse = $this->createSolution($finalData);

                break;
            case 'table':
                $this->type = 'table';
                $apiResponse = $this->createTable($finalData);

                break;
            default:
                $this->type = 'record';
                $apiResponse = $this->createRecord($finalData);
        }

        if (!is_wp_error($apiResponse) || isset($apiResponse->id) || isset($apiResponse->title)) {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', $this->typeName . ' ' . $this->type . ' successfully');
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName . ' ' . $this->type]), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
