<?php

/**
 * ZohoRecruit Record Api
 */

namespace BitApps\Integrations\Actions\ZohoMarketingHub;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

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
        $insertRecordEndpoint = "https://marketinghub.zoho.{$dataCenter}/api/v1/json/listsubscribe?resfmt=JSON&listkey={$list}&leadinfo=" . rawurlencode($data);

        return HttpHelper::post($insertRecordEndpoint, null, $this->_defaultHeader);
    }

    public function execute($list, $dataCenter, $fieldValues, $fieldMap, $required)
    {
        $fieldData = [];
        foreach ($fieldMap as $fieldPair) {
            if (!empty($fieldPair->zohoFormField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->zohoFormField] = $fieldPair->customValue;
                } else {
                    $fieldData[$fieldPair->zohoFormField] = $fieldValues[$fieldPair->formField];
                }
            }

            if (empty($fieldData[$fieldPair->zohoFormField]) && \in_array($fieldPair->zohoFormField, $required)) {
                // translators: %s: Placeholder value
                $error = new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('%s is required for zoho marketing hub', 'bit-integrations'), $fieldPair->zohoFormField));
                LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'field'], 'validation', $error);

                return $error;
            }
        }

        $recordApiResponse = $this->insertRecord($list, $dataCenter, wp_json_encode($fieldData));
        if (isset($recordApiResponse->status) && $recordApiResponse->status === 'success') {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'list'], 'success', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'list'], 'error', $recordApiResponse);
        }

        return $recordApiResponse;
    }
}
