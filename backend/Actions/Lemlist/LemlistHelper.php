<?php

namespace BitApps\Integrations\Actions\Lemlist;

use BitApps\Integrations\Core\Util\HttpHelper;

class LemlistHelper
{
    public static function getAllCampaign($requestParams)
    {
        if (empty($requestParams->api_key)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $header['Authorization'] = 'Basic ' . base64_encode(":{$requestParams->api_key}");
        $apiEndpoint = 'https://api.lemlist.com/api/campaigns';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);
        $campaigns = [];

        foreach ($apiResponse as $item) {
            $campaigns[] = [
                'campaignId'   => $item->_id,
                'campaignName' => $item->name
            ];
        }

        if ((\count($campaigns)) > 0) {
            wp_send_json_success($campaigns, 200);
        } else {
            wp_send_json_error(__('Campaign fetching failed', 'bit-integrations'), 400);
        }
    }
}
