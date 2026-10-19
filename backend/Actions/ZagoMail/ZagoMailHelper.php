<?php

/**
 * ZagoMail Integration
 */

namespace BitApps\Integrations\Actions\ZagoMail;

use BitApps\Integrations\Core\Util\HttpHelper;

class ZagoMailHelper
{
    public static function _apiEndpoint($method)
    {
        return "https://api.zagomail.com/{$method}";
    }

    public static function zagoMailLists($queryParams)
    {
        if (empty($queryParams->api_public_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $body = [
            'publicKey' => $queryParams->api_public_key
        ];

        $header['Content-Type'] = 'application/json';

        $apiEndpoint = self::_apiEndpoint('lists/all-lists');

        $zagoMailResponse = HttpHelper::post($apiEndpoint, wp_json_encode($body), $header);

        $lists = [];
        if ($zagoMailResponse->status == 'success') {
            $allLists = $zagoMailResponse->data;

            foreach ($allLists->records as $list) {
                $lists[$list->general->name] = (object) [
                    'listId'   => $list->general->list_uid,
                    'listName' => $list->general->name,
                ];
            }
            $response['zagoMailLists'] = $lists;
            wp_send_json_success($response);
        }
    }

    public static function zagoMailTags($queryParams)
    {
        if (empty($queryParams->api_public_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $body = [
            'publicKey' => $queryParams->api_public_key
        ];

        $header['Content-Type'] = 'application/json';

        $apiEndpoint = self::_apiEndpoint('tags/get-tags');

        $zagoMailResponse = HttpHelper::post($apiEndpoint, wp_json_encode($body), $header);

        $tags = [];
        if ($zagoMailResponse->status == 'success') {
            $allTags = $zagoMailResponse->tags;

            foreach ($allTags as $tag) {
                $tags[] = [
                    'tagId'   => $tag->ztag_id,
                    'tagName' => $tag->ztag_name,
                ];
            }
            $response['zagoMailTags'] = $tags;
            wp_send_json_success($response);
        }
    }

    public static function zagoMailRefreshFields($queryParams)
    {
        if (empty($queryParams->api_public_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $body = [
            'publicKey' => $queryParams->api_public_key
        ];

        $header['Content-Type'] = 'application/json';

        $apiEndpoint = self::_apiEndpoint('lists/get-fields?list_uid=' . $queryParams->listId);

        $zagoMailResponse = HttpHelper::post($apiEndpoint, wp_json_encode($body), $header);

        $fields = [];
        if ($zagoMailResponse->status == 'success') {
            $allFields = $zagoMailResponse->data;

            foreach ($allFields->records as $field) {
                $fields[$field->tag] = (object) [
                    'fieldId'   => $field->tag,
                    'fieldName' => $field->label,
                    'required'  => $field->required == 'yes' ? true : false
                ];
            }

            $response['zagoMailField'] = $fields;
            wp_send_json_success($response);
        }
    }
}
