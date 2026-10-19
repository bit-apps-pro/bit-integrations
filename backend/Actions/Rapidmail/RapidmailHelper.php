<?php

/**
 * Rapidmail Integration
 */

namespace BitApps\Integrations\Actions\Rapidmail;

use BitApps\Integrations\Core\Util\HttpHelper;

final class RapidmailHelper
{
    public static $apiBaseUri = 'https://apiv3.emailsys.net/v1';

    protected $_defaultHeader;

    public static function getAllRecipients($queryParams)
    {
        if (
            empty($queryParams->username)
            || empty($queryParams->password)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$queryParams->username}:{$queryParams->password}"),
            'Accept'        => '*/*',
            'verify'        => false
        ];
        $recipientApiEndpoint = self::$apiBaseUri . '/recipientlists';
        $apiResponse = HttpHelper::get($recipientApiEndpoint, null, $header);
        $tempRecipient = $apiResponse->_embedded->recipientlists;
        $data = [];

        foreach ($tempRecipient as $list) {
            $data[] = (object) [
                'id'   => $list->id,
                'name' => $list->name
            ];
        }
        $response['recipientlists'] = $data;
        wp_send_json_success($response, 200);
    }

    public static function getAllFields($queryParams)
    {
        if (
            empty($queryParams->username)
            || empty($queryParams->password)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$queryParams->username}:{$queryParams->password}"),
            'Accept'        => '*/*',
            'verify'        => false
        ];
        $recipientApiEndpoint = self::$apiBaseUri . '/recipientlists';
        $apiResponse = HttpHelper::get($recipientApiEndpoint, null, $header);
        $tempRecipient = $apiResponse->_embedded->recipientlists;
        $data = [];

        foreach ($tempRecipient as $list) {
            $data[] = (object) [
                'id'   => $list->id,
                'name' => $list->name
            ];
        }
        $response['recipientlists'] = $data;
        wp_send_json_success($response, 200);
    }
}
