<?php

namespace BitApps\Integrations\Actions\MailRelay;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MailRelayAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'mailrelay',
        'fields'   => [
            'auth_token' => 'value',
            'domain'     => 'domain',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = !empty($integrationDetails->auth_token) ? $integrationDetails->auth_token : (isset($integrationDetails->api_key) ? $integrationDetails->api_key : '');
        $selectedGroups = $integrationDetails->selectedGroups;
        $fieldMap = $integrationDetails->field_map;
        $status = $integrationDetails->status;

        if (
            empty($fieldMap)
            || empty($auth_token) || empty($status)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'MailRelay'));
        }

        $recordApiHelper = new MailRelayService($integrationDetails, $integId);
        $mailRelayApiResponse = $recordApiHelper->execute(
            $selectedGroups,
            $fieldValues,
            $fieldMap,
            $status
        );

        if (is_wp_error($mailRelayApiResponse)) {
            return $mailRelayApiResponse;
        }

        return $mailRelayApiResponse;
    }
}
