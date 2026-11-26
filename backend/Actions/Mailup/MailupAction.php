<?php

namespace BitApps\Integrations\Actions\Mailup;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

class MailupAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'mailup',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at', 'generates_on']],
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
        $selectedGroup = $integrationDetails->groupId;
        $fieldMap = $integrationDetails->field_map;
        $tokenDetails = MailupHelper::tokenExpiryCheck($integrationDetails->tokenDetails, $integrationDetails->clientId, $integrationDetails->clientSecret);
        if ($tokenDetails->access_token !== $integrationDetails->tokenDetails->access_token) {
            $this->saveRefreshedToken($this->integrationID, $tokenDetails);
        }

        if (empty($fieldMap) || empty($tokenDetails) || empty($selectedList)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mailup'));
        }

        $recordApiHelper = new MailupService($integrationDetails, $integId, $tokenDetails->access_token);
        $mailupApiResponse = $recordApiHelper->execute(
            $selectedList,
            $selectedGroup,
            $fieldValues,
            $fieldMap
        );

        if (is_wp_error($mailupApiResponse)) {
            return $mailupApiResponse;
        }

        return $mailupApiResponse;
    }

    protected function saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $mailupDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($mailupDetails)) {
            return;
        }

        $newDetails = json_decode($mailupDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
