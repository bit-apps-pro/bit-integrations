<?php

namespace BitApps\Integrations\Actions\GoogleContacts;

use BitApps\Integrations\Core\Util\HttpHelper;

class GoogleContactsHelper
{
    public static function authorization($requestParams)
    {
        if (empty($requestParams->clientId) || empty($requestParams->clientSecret) || empty($requestParams->code) || empty($requestParams->redirectURI)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $body = [
            'grant_type'    => 'authorization_code',
            'client_id'     => $requestParams->clientId,
            'client_secret' => $requestParams->clientSecret,
            'redirect_uri'  => urldecode($requestParams->redirectURI),
            'code'          => urldecode($requestParams->code)
        ];

        $apiEndpoint = 'https://oauth2.googleapis.com/token';
        $header['Content-Type'] = 'application/x-www-form-urlencoded';
        $apiResponse = HttpHelper::post($apiEndpoint, $body, $header);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            wp_send_json_error(empty($apiResponse->error_description) ? 'Unknown' : $apiResponse->error_description, 400);
        }
        $apiResponse->generates_on = time();
        wp_send_json_success($apiResponse, 200);
    }

    public static function getAllCalendarLists($queryParams)
    {
        $tokenDetails = GoogleContactsAction::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $clientId = $queryParams->clientId ?? '';
        $clientSecret = $queryParams->clientSecret ?? '';
        $flowID = $queryParams->flowID ?? null;
        $isConnectionAuth = !empty($queryParams->connection_id);

        if (empty($tokenDetails->access_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $oldToken = $tokenDetails->access_token;

        if (!$isConnectionAuth) {
            $tokenDetails = GoogleContactsAction::tokenExpiryCheck($tokenDetails, $clientId, $clientSecret);

            if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
                wp_send_json_error(__('Authorization failed', 'bit-integrations'), 400);
            }

            if (!empty($flowID) && $tokenDetails->access_token !== $oldToken) {
                GoogleContactsAction::saveRefreshedToken($flowID, $tokenDetails);
            }
        }

        $token = $tokenDetails;
        $lists = self::getGoogleCalendarList($token->access_token);

        $data = [];
        if (\is_array($lists->items)) {
            foreach ($lists->items as $list) {
                $data[] = (object) [
                    'id'         => $list->id,
                    'name'       => isset($list->summary) ? $list->summary : $list->id,
                    'accessRole' => isset($list->accessRole) ? $list->accessRole : '',
                ];
            }
        }

        $response['googleCalendarLists'] = $data;
        $response['tokenDetails'] = $token;
        wp_send_json_success($response, 200);
    }

    protected static function getGoogleCalendarList($token)
    {
        $headers = [
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json;',
            'Authorization' => 'Bearer ' . $token,
        ];
        $apiEndpoint = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
        $body = [
            'minAccessRole' => 'writer',
        ];
        $apiResponse = HttpHelper::get($apiEndpoint, $body, $headers);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }

        return $apiResponse;
    }
}
