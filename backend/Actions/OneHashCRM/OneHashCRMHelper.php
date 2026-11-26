<?php

namespace BitApps\Integrations\Actions\OneHashCRM;

class OneHashCRMHelper
{
    protected $_defaultHeader;

    protected $apiEndpoint;

    protected $domain;

    private function setApiEndpoint()
    {
        return $this->apiEndpoint = "{$this->domain}/api/resource";
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->api_key) || empty($fieldsRequestParams->api_secret) || empty($fieldsRequestParams->domain) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($apiKey, $apiSecret)
    {
        return
            [
                'Authorization' => "token {$apiKey}:{$apiSecret}",
                'Content-type'  => 'application/json',
            ];
    }
}
