<?php

namespace BitApps\Integrations\Actions\SendPulse;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

class SendPulseController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'sendpulse',
        'fields'   => [
            'client_id'     => 'client_id',
            'client_secret' => 'client_secret',
            '__object'      => ['tokenDetails', ['access_token', 'refresh_token', 'expires_in', 'generated_at', 'generates_on']],
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

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
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);
        $lists = [];

        foreach ($apiResponse as $item) {
            $lists[] = [
                'listId'   => $item->id,
                'listName' => $item->name
            ];
        }

        if ((\count($lists)) > 0) {
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error(__('List fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $selectedList = $integrationDetails->listId;
        $fieldMap = $integrationDetails->field_map;
        $tokenDetails = self::tokenExpiryCheck($integrationDetails->tokenDetails, $integrationData->flow_details->client_id, $integrationData->flow_details->client_secret);

        if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
            return new WP_Error('TOKEN_REFRESH_FAILED', __('Token refresh failed for SendPulse', 'bit-integrations'));
        }

        if (
            empty($integrationDetails->connection_id)
            && $tokenDetails->access_token !== $integrationDetails->tokenDetails->access_token
        ) {
            $this->saveRefreshedToken($this->integrationID, $tokenDetails);
        }

        if (empty($fieldMap) || empty($tokenDetails) || empty($selectedList)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'SendPulse'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $tokenDetails->access_token);

        $sendPulseApiResponse = $recordApiHelper->execute(
            $selectedList,
            $fieldValues,
            $fieldMap
        );

        if (is_wp_error($sendPulseApiResponse)) {
            return $sendPulseApiResponse;
        }

        return $sendPulseApiResponse;
    }

    protected static function tokenExpiryCheck($token, $clientId, $clientSecret)
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

    protected function saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $sendPulseDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($sendPulseDetails)) {
            return;
        }

        $newDetails = json_decode($sendPulseDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
