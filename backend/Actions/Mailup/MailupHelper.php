<?php

namespace BitApps\Integrations\Actions\Mailup;

use BitApps\Integrations\Core\Util\HttpHelper;

class MailupHelper
{
    public static function getAllField($requestParams)
    {
        if (empty($requestParams->tokenDetails) || empty($requestParams->clientId) || empty($requestParams->clientSecret)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $token = self::tokenExpiryCheck($requestParams->tokenDetails, $requestParams->clientId, $requestParams->clientSecret);
        $headers = [
            'Authorization' => 'Bearer ' . $token->access_token,
        ];
        $apiEndpoint = 'https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console/Recipient/DynamicFields?PageNumber=0&PageSize=1000';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);
        $excludedFields = ['allorderedproductids', 'totalorderedlast30d', 'totalorderedlast12m', 'totalordered', 'latestabandonedcartid', 'latestabandonedcarttotal', 'latestabandonedcartdate', 'latestshippedorderid', 'latestshippedorderdate', 'latestordercategoryids', 'latestorderproductids', 'latestorderamount', 'latestorderdate', 'latestorderid', 'customerid'];
        $fields = [
            (object) [
                'key'      => 'Email',
                'label'    => 'Email',
                'required' => true
            ]
        ];

        if (!property_exists($apiResponse, 'Items')) {
            wp_send_json_error('List fetching failed', 400);

            return;
        }

        foreach ($apiResponse->Items as $item) {
            if (!\in_array($item->Description, $excludedFields)) {
                $fields[] = (object) [
                    'key'      => $item->Id,
                    'label'    => $item->Description,
                    'required' => false
                ];
            }
        }

        wp_send_json_success($fields, 200);
    }

    public static function getAllList($requestParams)
    {
        if (empty($requestParams->tokenDetails) || empty($requestParams->clientId) || empty($requestParams->clientSecret)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $token = self::tokenExpiryCheck($requestParams->tokenDetails, $requestParams->clientId, $requestParams->clientSecret);
        $headers = [
            'Authorization' => 'Bearer ' . $token->access_token,
        ];
        $apiEndpoint = 'https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console/List?PageNumber=0&PageSize=1000';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);
        $lists = [];

        foreach ($apiResponse->Items as $item) {
            $lists[] = [
                'idList' => $item->IdList,
                'name'   => $item->Name
            ];
        }

        if (property_exists($apiResponse, 'Items')) {
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error('List fetching failed', 400);
        }
    }

    public static function getAllGroup($requestParams)
    {
        if (empty($requestParams->tokenDetails) || empty($requestParams->clientId) || empty($requestParams->clientSecret) || empty($requestParams->listId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $token = self::tokenExpiryCheck($requestParams->tokenDetails, $requestParams->clientId, $requestParams->clientSecret);
        $headers = [
            'Authorization' => 'Bearer ' . $token->access_token,
        ];
        $apiEndpoint = "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console/List/{$requestParams->listId}/Groups?PageNumber=0&PageSize=1000";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);
        $lists = [];

        foreach ($apiResponse->Items as $item) {
            $lists[] = [
                'idGroup' => $item->idGroup,
                'name'    => $item->Name
            ];
        }

        if (property_exists($apiResponse, 'Items')) {
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error('List fetching failed', 400);
        }
    }

    public static function tokenExpiryCheck($token, $clientId, $clientSecret)
    {
        if (!$token) {
            return false;
        }

        $generatedOn = !empty($token->generates_on)
            ? \intval($token->generates_on)
            : \intval($token->generated_at ?? 0);

        if (($generatedOn + (55 * 60)) < time()) {
            $refreshToken = self::refreshToken($token->refresh_token, $clientId, $clientSecret);
            if (is_wp_error($refreshToken) || !empty($refreshToken->error)) {
                return false;
            }

            $token->access_token = $refreshToken->access_token;
            $token->refresh_token = $refreshToken->refresh_token ?? $token->refresh_token;
            $token->expires_in = $refreshToken->expires_in;
            $token->generates_on = $refreshToken->generates_on;
            $token->generated_at = $refreshToken->generated_at;
        }

        return $token;
    }

    protected static function refreshToken($refresh_token, $clientId, $clientSecret)
    {
        $body = [
            'grant_type'    => 'refresh_token',
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'refresh_token' => $refresh_token,
        ];

        $apiEndpoint = 'https://services.mailup.com/Authorization/OAuth/Token';
        $apiResponse = HttpHelper::post($apiEndpoint, $body);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }
        $token = $apiResponse;
        $token->generates_on = time();
        $token->generated_at = $token->generates_on;

        return $token;
    }
}
