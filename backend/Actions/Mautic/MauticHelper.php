<?php

namespace BitApps\Integrations\Actions\Mautic;

use BitApps\Integrations\Core\Util\HttpHelper;

class MauticHelper
{
    public static function getAllFields($queryParams)
    {
        if (empty($queryParams->tokenDetails)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $mauticUrl = $queryParams->baseUrl;
        $response = [];
        if (static::isTokenExpired($queryParams->tokenDetails)) {
            $response['tokenDetails'] = static::_refreshAccessToken($queryParams);
        }
        $tokenDetails = empty($response['tokenDetails']) ? $queryParams->tokenDetails : $response['tokenDetails'];

        $apiEndpoint = "{$mauticUrl}/api/contacts/list/fields";
        $authorizationHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);
        $response = [];
        if (!is_wp_error($apiResponse)) {
            foreach ($apiResponse as $field) {
                $response[] = (object) [
                    'fieldName'  => $field->label,
                    'fieldAlias' => $field->alias,
                    'required'   => $field->alias === 'email' ? true : false
                ];
            }
        }

        wp_send_json_success($response);
    }

    public static function getAllTags($queryParams)
    {
        if (empty($queryParams->tokenDetails)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $mauticUrl = $queryParams->baseUrl;
        $response = [];
        if (static::isTokenExpired($queryParams->tokenDetails)) {
            $response['tokenDetails'] = static::_refreshAccessToken($queryParams);
        }
        $tokenDetails = empty($response['tokenDetails']) ? $queryParams->tokenDetails : $response['tokenDetails'];

        $apiEndpoint = "{$mauticUrl}/api/tags";
        $authorizationHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);
        $response = [];
        if (!is_wp_error($apiResponse)) {
            foreach ($apiResponse->tags as $field) {
                $response[] = (object) [
                    'tagId'   => $field->id,
                    'tagName' => $field->tag
                ];
            }
        }
        wp_send_json_success($response);
    }

    public static function getAllUsers($queryParams)
    {
        if (empty($queryParams->tokenDetails)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = [];

        if (static::isTokenExpired($queryParams->tokenDetails)) {
            $response['tokenDetails'] = static::_refreshAccessToken($queryParams);
        }

        $apiEndpoint = "{$queryParams->baseUrl}/api/users";
        $tokenDetails = empty($response['tokenDetails']) ? $queryParams->tokenDetails : $response['tokenDetails'];
        $authorizationHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        if (!is_wp_error($apiResponse) && isset($apiResponse->users)) {
            foreach ($apiResponse->users as $user) {
                $response['allUsers'][] = (object) [
                    'id'    => $user->id,
                    'label' => "{$user->firstName} {$user->lastName}"
                ];
            }
        }

        wp_send_json_success($response);
    }

    public static function _refreshAccessToken($apiData)
    {
        if (
            empty($apiData->clientId)
            || empty($apiData->clientSecret)
            || empty($apiData->tokenDetails)
        ) {
            return false;
        }
        $tokenDetails = $apiData->tokenDetails;
        $baseUrl = $apiData->baseUrl;
        $apiEndpoint = "{$baseUrl}/oauth/v2/token";
        $requestParams = [
            'grant_type'    => 'client_credentials',
            'client_id'     => $apiData->clientId,
            'client_secret' => $apiData->clientSecret,
            'refresh_token' => $tokenDetails->refresh_token,
        ];
        $apiResponse = HttpHelper::post($apiEndpoint, $requestParams);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }
        $generatedAt = time();
        $tokenDetails->generates_on = $generatedAt;
        $tokenDetails->generated_at = $generatedAt;
        $tokenDetails->access_token = $apiResponse->access_token;
        if (!empty($apiResponse->refresh_token)) {
            $tokenDetails->refresh_token = $apiResponse->refresh_token;
        }
        if (isset($apiResponse->expires_in)) {
            $tokenDetails->expires_in = $apiResponse->expires_in;
        }

        return $tokenDetails;
    }

    public static function isTokenExpired($tokenDetails)
    {
        if (empty($tokenDetails) || !\is_object($tokenDetails)) {
            return false;
        }

        $generatedAt = empty($tokenDetails->generates_on) ? ($tokenDetails->generated_at ?? 0) : $tokenDetails->generates_on;
        $expiresIn = $tokenDetails->expires_in ?? 0;

        if (!empty($generatedAt) && !empty($expiresIn) && (int) $expiresIn > 0) {
            return ((int) $generatedAt + (int) $expiresIn - 30) < time();
        }

        return ((int) $generatedAt + (55 * 60)) < time();
    }
}
