<?php

namespace BitApps\Integrations\Actions\PCloud;

use BitApps\Integrations\Core\Util\HttpHelper;

class PCloudHelper
{
    public static function getAllFolders($queryParams)
    {
        $accessToken = $queryParams->tokenDetails->access_token ?? ($queryParams->access_token ?? '');

        if (empty($accessToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = 'https://api.pcloud.com/listfolder?folderid=0';
        $header['Authorization'] = 'Bearer ' . $accessToken;

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (!empty($apiResponse) && !isset($apiResponse->error)) {
            foreach ($apiResponse->metadata->contents as $folder) {
                if ($folder->isfolder === true) {
                    $folders[] = [
                        'id'   => $folder->folderid,
                        'name' => $folder->name
                    ];
                }
            }
            wp_send_json_success($folders, 200);
        } else {
            wp_send_json_error(__('Folders fetching failed', 'bit-integrations'), 400);
        }
    }
}
