<?php

namespace BitApps\Integrations\Actions\SendPulse;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;

class SendPulseHelper
{
    public static function sendPulseHeaders($requestParams)
    {
        if (empty($requestParams->client_id) || empty($requestParams->client_secret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $fields = [
            'Email' => ['fieldValue' => 'email', 'fieldName' => __('Email', 'bit-integrations'), 'required' => true],
            'Name'  => ['fieldValue' => 'name', 'fieldName' => __('Name', 'bit-integrations'), 'required' => false],
            'Phone' => ['fieldValue' => 'phone', 'fieldName' => __('Phone', 'bit-integrations'), 'required' => false]
        ];

        $apiEndpoint = "https://api.sendpulse.com/addressbooks/{$requestParams->list_id}/variables";

        $token = self::tokenExpiryCheck($requestParams->tokenDetails, $requestParams->client_id, $requestParams->client_secret);

        $response['sendPulseField'] = Hooks::apply(Config::withPrefix('sendPulse_refresh_fields'), $fields, $apiEndpoint, $token->access_token);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_sendPulse_refresh_fields` filter instead.
         * @since 2.7.8
         */
        $response['sendPulseField'] = Hooks::apply('btcbi_sendPulse_refresh_fields', $response['sendPulseField'], $apiEndpoint, $token->access_token);

        wp_send_json_success($response);
    }

    public static function getAllList($requestParams)
    {
        if (empty($requestParams->tokenDetails) || empty($requestParams->client_id) || empty($requestParams->client_secret)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $token = self::tokenExpiryCheck($requestParams->tokenDetails, $requestParams->client_id, $requestParams->client_secret);
        $headers = [
            'Authorization' => 'Bearer ' . $token->access_token,
        ];
        $apiEndpoint = 'https://api.sendpulse.com/addressbooks';
        $lists = [];
        $limit = 100;
        $offset = 0;

        do {
            $apiResponse = HttpHelper::get(add_query_arg(['limit' => $limit, 'offset' => $offset], $apiEndpoint), null, $headers);

            if (is_wp_error($apiResponse) || !\is_array($apiResponse)) {
                break;
            }

            foreach ($apiResponse as $item) {
                if (empty($item->id)) {
                    continue;
                }

                $lists[] = [
                    'listId'   => $item->id,
                    'listName' => $item->name
                ];
            }

            $fetched = \count($apiResponse);
            $offset += $limit;
        } while ($fetched === $limit);

        if ((\count($lists)) > 0) {
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error(__('List fetching failed', 'bit-integrations'), 400);
        }
    }

    public static function tokenExpiryCheck($token, $clientId, $clientSecret)
    {
        if (!$token) {
            return false;
        }

        $generatedOn = isset($token->generates_on) && $token->generates_on !== ''
            ? \intval($token->generates_on)
            : \intval($token->generated_at ?? 0);

        if (($generatedOn + (55 * 60)) < time()) {
            $refreshToken = self::refreshToken($clientId, $clientSecret);
            if (is_wp_error($refreshToken) || !empty($refreshToken->error)) {
                return false;
            }

            $token->access_token = $refreshToken->access_token;
            $token->expires_in = $refreshToken->expires_in;
            $token->generated_at = $refreshToken->generated_at;
            $token->generates_on = $refreshToken->generates_on;
        }

        return $token;
    }

    protected static function refreshToken($clientId, $clientSecret)
    {
        $body = [
            'grant_type'    => 'client_credentials',
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
        ];

        $apiEndpoint = 'https://api.sendpulse.com/oauth/access_token';
        $apiResponse = HttpHelper::post($apiEndpoint, $body);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }
        $token = $apiResponse;
        $token->generated_at = time();
        $token->generates_on = time();

        return $token;
    }
}
