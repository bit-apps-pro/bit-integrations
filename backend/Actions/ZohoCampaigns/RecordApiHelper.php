<?php

/**
 * ZohoRecruit Record Api
 */

namespace BitApps\Integrations\Actions\ZohoCampaigns;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

/**
 * Provide functionality for Record insert,upsert
 */
class RecordApiHelper
{
    private $_defaultHeader;

    private $_apiDomain;

    private $_tokenDetails;

    public function __construct($tokenDetails, $integId)
    {
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_apiDomain = urldecode($tokenDetails->api_domain ?? '');
        $this->_tokenDetails = $tokenDetails;
        $this->_integrationID = $integId;
    }

    public function insertRecord($list, $dataCenter, $data)
    {
        $insertRecordEndpoint = "https://campaigns.zoho.{$dataCenter}/api/v1.1/json/listsubscribe?resfmt=JSON&listkey={$list}&contactinfo=" . rawurlencode($data);

        return HttpHelper::post($insertRecordEndpoint, null, $this->_defaultHeader);
    }

    public function execute($list, $dataCenter, $fieldValues, $fieldMap, $required)
    {
        $fieldData = [];
        foreach ($fieldMap as $fieldPair) {
            if (!empty($fieldPair->zohoFormField) && !empty($fieldPair->formField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->zohoFormField] = $fieldPair->customValue;
                } else {
                    $fieldData[$fieldPair->zohoFormField] = $fieldValues[$fieldPair->formField];
                }
            }
            if (empty($fieldData[$fieldPair->zohoFormField]) && \in_array($fieldPair->zohoFormField, $required)) {
                // translators: %s: Field name
                // translators: %s: Placeholder value
                $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%s is required for zoho campaigns', 'bit-integrations'), $fieldPair->zohoFormField));
                // $this->_logResponse->apiResponse($this->_logID, $this->_integrationID, ['type' => 'record', 'type_name' => 'field'], 'validation', $error);

                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'field']), 'error', wp_json_encode($error));

                return $error;
            }
        }

        $recordApiResponse = $this->insertRecord($list, $dataCenter, wp_json_encode($fieldData));
        if (isset($recordApiResponse->status) && $recordApiResponse->status === 'error') {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'list'], 'error', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'list'], 'success', $recordApiResponse);
        }

        return $recordApiResponse;
    }
}
