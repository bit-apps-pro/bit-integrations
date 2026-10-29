<?php

namespace BitApps\Integrations\Actions\GoogleContacts;

use BitApps\Integrations\Actions\GoogleContacts\GoogleContactsService as GoogleContactsRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class GoogleContactsAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'googlecontacts',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        if (empty($integrationData->flow_details->tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'insert']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'GoogleContact'));

            return false;
        }

        $integrationDetails = $integrationData->flow_details;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $mainAction = $integrationDetails->mainAction;
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = self::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);

        if (empty($tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'insert']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'GoogleContact'));

            return false;
        }

        $oldToken = $tokenDetails->access_token;

        if (!$isConnectionAuth) {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $integrationDetails->clientId, $integrationDetails->clientSecret);

            if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
                // translators: %s: Service name
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'insert']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'GoogleContact'));

                return false;
            }

            if ($tokenDetails->access_token !== $oldToken) {
                self::saveRefreshedToken($this->integrationID, $tokenDetails);
            }
        }

        if (empty($fieldMap)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('Required fields not mapped', 'bit-integrations'));
            LogHandler::save($this->integrationID, 'record', 'validation', $error);

            return $error;
        }

        (new GoogleContactsRecordApiHelper($tokenDetails->access_token))->executeRecordApi($this->integrationID, $fieldValues, $fieldMap, $actions, $mainAction);

        return true;
    }

    public static function tokenExpiryCheck($token, $clientId, $clientSecret)
    {
        if (!$token) {
            return false;
        }

        $generatedOn = !empty($token->generates_on) ? (int) $token->generates_on : (int) ($token->generated_at ?? 0);

        if ($generatedOn > 0 && ($generatedOn + (55 * 60)) < time()) {
            $refreshToken = self::refreshToken($token->refresh_token, $clientId, $clientSecret);
            // refreshToken() returns false on failure. is_wp_error(false) is false and
            // false->error reads as null, so this guard used to pass with a bool, and every
            // assignment below then nulled the whole token — one flaky POST bricked the
            // connection permanently once saveRefreshedToken() wrote it back.
            if (!\is_object($refreshToken) || is_wp_error($refreshToken) || !empty($refreshToken->error)) {
                return false;
            }

            if (!empty($refreshToken->access_token)) {
                $token->access_token = $refreshToken->access_token;
                $token->expires_in = $refreshToken->expires_in ?? ($token->expires_in ?? 3600);
                $token->generates_on = $refreshToken->generates_on;
                $token->generated_at = $refreshToken->generated_at;

                // Google returns refresh_token ONLY on the initial authorization_code
                // exchange, never on a refresh_token grant — overwriting it unconditionally
                // wiped the stored one and the next refresh had nothing to send.
                if (!empty($refreshToken->refresh_token)) {
                    $token->refresh_token = $refreshToken->refresh_token;
                }
            }
        }

        return $token;
    }

    public static function normalizeConnectionToken($token)
    {
        if (!\is_object($token)) {
            $token = (object) [];
        }

        if (empty($token->generates_on) && !empty($token->generated_at)) {
            $token->generates_on = (int) $token->generated_at;
        }

        return $token;
    }

    public static function saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $googleCalendarDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($googleCalendarDetails)) {
            return;
        }

        $newDetails = json_decode($googleCalendarDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }

    protected static function refreshToken($refresh_token, $clientId, $clientSecret)
    {
        $body = [
            'grant_type'    => 'refresh_token',
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'refresh_token' => $refresh_token,
        ];

        $apiEndpoint = 'https://oauth2.googleapis.com/token';
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
