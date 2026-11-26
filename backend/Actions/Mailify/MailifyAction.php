<?php

namespace BitApps\Integrations\Actions\Mailify;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MailifyAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'mailify',
        // Connections store the UI's display name, which carries the Sarbacane rebrand.
        'aliases'  => ['Sarbacane(Mailify)'],
        'fields'   => [
            'account_id' => 'username',
            'api_key'    => 'password',
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
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $accountId = $integrationDetails->account_id;
        $apiKey = $integrationDetails->api_key;

        if (empty($fieldMap) || empty($accountId) || empty($apiKey) || empty($selectedList)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mailify'));
        }

        $recordApiHelper = new MailifyService($integrationDetails, $integId, $accountId, $apiKey);
        $mailifyApiResponse = $recordApiHelper->execute(
            $selectedList,
            $fieldValues,
            $fieldMap,
            $actions
        );

        if (is_wp_error($mailifyApiResponse) || (isset($mailifyApiResponse['success']) && !$mailifyApiResponse['success'])) {
            return $mailifyApiResponse;
        }

        return $mailifyApiResponse;
    }
}
