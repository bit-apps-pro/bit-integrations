<?php

namespace BitApps\Integrations\Actions\SendPulse;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

class SendPulseAction
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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $selectedList = $integrationDetails->listId;
        $fieldMap = $integrationDetails->field_map;
        $tokenDetails = SendPulseHelper::tokenExpiryCheck($integrationDetails->tokenDetails, $integrationData->flow_details->client_id, $integrationData->flow_details->client_secret);

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

        $recordApiHelper = new SendPulseService($integrationDetails, $integId, $tokenDetails->access_token);

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
