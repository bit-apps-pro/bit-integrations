<?php

namespace BitApps\Integrations\Actions\Zoom;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

class ZoomController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zoom',
        'fields'   => [
            'clientId'    => 'client_id',
            'clientSecret' => 'client_secret',
            'accessToken' => 'access_token',
            '__object'    => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public static function zoomFetchAllMeetings($requestParams)
    {
        $tokenDetails = $requestParams->tokenDetails ?? null;
        $clientId = $requestParams->clientId ?? '';
        $clientSecret = $requestParams->clientSecret ?? '';

        if (empty($tokenDetails) && !empty($requestParams->accessToken)) {
            $tokenDetails = (object) [
                'access_token'  => $requestParams->accessToken,
                'refresh_token' => $requestParams->refreshToken ?? '',
            ];
        }

        if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        if (!empty($requestParams->connection_id)) {
            $tokenDetails = self::normalizeConnectionToken($tokenDetails);
        } else {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $clientId, $clientSecret);
        }
        $header = [
            'Authorization' => 'Bearer ' . $tokenDetails->access_token,
            'Content-Type'  => 'application/json'
        ];

        $apiEndpoint = 'https://api.zoom.us/v2/users/me/meetings';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            wp_send_json_error(empty($apiResponse->error) ? 'Unknown' : $apiResponse->error, 400);
        }

        $response['allMeeting'] = $apiResponse->meetings;
        wp_send_json_success($response, 200);
    }

    public static function zoomFetchAllCustomFields($requestParams)
    {
        $tokenDetails = $requestParams->tokenDetails ?? null;
        $clientId = $requestParams->clientId ?? '';
        $clientSecret = $requestParams->clientSecret ?? '';

        if (empty($tokenDetails) && !empty($requestParams->accessToken)) {
            $tokenDetails = (object) [
                'access_token'  => $requestParams->accessToken,
                'refresh_token' => $requestParams->refreshToken ?? '',
            ];
        }

        if (empty($tokenDetails) || empty($tokenDetails->access_token) || empty($requestParams->meetingId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        if (!empty($requestParams->connection_id)) {
            $tokenDetails = self::normalizeConnectionToken($tokenDetails);
        } else {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $clientId, $clientSecret);
        }
        $header = [
            'Authorization' => 'Bearer ' . $tokenDetails->access_token,
            'Content-Type'  => 'application/json'
        ];
        $apiEndpoint = "https://api.zoom.us/v2/meetings/{$requestParams->meetingId}/registrants/questions";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error) || !isset($apiResponse->questions)) {
            wp_send_json_error(empty($apiResponse->message) ? 'Unknown' : $apiResponse->message, 400);
        }

        $allFields = [
            (object) ['key' => 'first_name', 'label' => __('First Name', 'bit-integrations'), 'required' => true],
            (object) ['key' => 'last_name', 'label' => __('Last Name', 'bit-integrations'), 'required' => true],
            (object) ['key' => 'email', 'label' => __('Email', 'bit-integrations'), 'required' => true]
        ];
        $excludedFields = ['first_name', 'last_name', 'email'];

        foreach ($apiResponse->questions as $field) {
            if (\in_array($field->field_name, $excludedFields)) {
                continue;
            }

            $allFields[] = (object) [
                'key'      => $field->field_name,
                'label'    => ucwords(str_replace('_', ' ', $field->field_name)),
                'required' => $field->required
            ];
        }

        foreach ($apiResponse->custom_questions as $field) {
            $allFields[] = (object) [
                'key'      => 'custom_questions_' . $field->title,
                'label'    => $field->title,
                'required' => $field->required
            ];
        }

        wp_send_json_success($allFields, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $meetingId = $integrationDetails->id;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;
        $selectedAction = $integrationDetails->selectedActions;

        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = self::normalizeConnectionToken($integrationDetails->tokenDetails);
        $oldToken = $tokenDetails->access_token ?? '';

        if (!$isConnectionAuth) {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $integrationDetails->clientId, $integrationDetails->clientSecret);
        }

        if (!$isConnectionAuth && $tokenDetails->access_token !== $oldToken) {
            self::saveRefreshedToken($this->integrationID, $tokenDetails);
        }
        if (
            empty($meetingId)
            || empty($fieldMap)
            || empty($defaultDataConf)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Zoom'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $zoomApiResponse = $recordApiHelper->execute(
            $meetingId,
            $defaultDataConf,
            $fieldValues,
            $fieldMap,
            $actions,
            $tokenDetails,
            $selectedAction
        );

        if (is_wp_error($zoomApiResponse)) {
            return $zoomApiResponse;
        }

        return $zoomApiResponse;
    }

    private static function tokenExpiryCheck($token, $clientId, $clientSecret)
    {
        if (!$token) {
            return false;
        }

        $generatedOn = !empty($token->generates_on) ? (int) $token->generates_on : (int) ($token->generated_at ?? 0);

        if ($generatedOn > 0 && ($generatedOn + (55 * 60)) < time()) {
            $refreshToken = self::refreshToken($token->refresh_token, $clientId, $clientSecret);
            if (is_wp_error($refreshToken) || !empty($refreshToken->error)) {
                return false;
            }

            if (isset($refreshToken->access_token)) {
                $token->access_token = $refreshToken->access_token;
                $token->expires_in = $refreshToken->expires_in;
                $token->generates_on = $refreshToken->generates_on;
                $token->generated_at = $refreshToken->generated_at;
                $token->refresh_token = $refreshToken->refresh_token;
            }
        }

        return $token;
    }

    private static function refreshToken($refresh_token, $clientId, $clientSecret)
    {
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$clientId}:{$clientSecret}"),
            'Content-Type'  => 'application/x-www-form-urlencoded'
        ];

        $requestParams = [
            'grant_type'    => 'refresh_token',
            'refresh_token' => $refresh_token,
        ];
        $apiEndpoint = 'https://zoom.us/oauth/token';
        $apiResponse = HttpHelper::post($apiEndpoint, $requestParams, $header);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }
        $token = $apiResponse;
        $token->generates_on = time();
        $token->generated_at = $token->generates_on;

        return $token;
    }

    private static function normalizeConnectionToken($token)
    {
        if (!\is_object($token)) {
            $token = (object) [];
        }

        if (empty($token->generates_on) && !empty($token->generated_at)) {
            $token->generates_on = (int) $token->generated_at;
        }

        return $token;
    }

    private static function saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $zoomDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($zoomDetails)) {
            return;
        }

        $newDetails = json_decode($zoomDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
