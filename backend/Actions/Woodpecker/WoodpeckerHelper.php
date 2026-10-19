<?php

/**
 * Woodpecker Integration
 */

namespace BitApps\Integrations\Actions\Woodpecker;

use BitApps\Integrations\Core\Util\HttpHelper;

class WoodpeckerHelper
{
    protected $_defaultHeader;

    protected $apiEndpoint;

    protected $domain;

    public function getAllCampagns($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->setApiEndpoint() . '/campaign_list';
        $headers = $this->setHeaders(base64_encode($apiKey));
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->status) && $response->status->status === 'ERROR') {
            wp_send_json_error(__('Campaign not found!', 'bit-integrations'), 400);
        } else {
            $campaigns = [];
            foreach ($response as $campaign) {
                $campaigns[]
                = (object) [
                    'id'   => $campaign->id,
                    'name' => $campaign->name,
                ]
                ;
            }

            wp_send_json_success($campaigns, 200);
        }
    }

    private function setApiEndpoint()
    {
        return $this->apiEndpoint = 'https://api.woodpecker.co/rest/v1';
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->api_key) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($apiKey)
    {
        return
            [
                'Authorization' => "Basic {$apiKey}",
                'Content-type'  => 'application/json',
            ];
    }
}
