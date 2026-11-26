<?php

namespace BitApps\Integrations\Actions\Mailjet;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MailjetAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'mailjet',
        'fields'   => [
            'apiKey'    => 'username',
            'secretKey' => 'password',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = !empty($integrationDetails->apiKey) ? $integrationDetails->apiKey : (isset($integrationDetails->username) ? $integrationDetails->username : '');
        $secretKey = !empty($integrationDetails->secretKey) ? $integrationDetails->secretKey : (isset($integrationDetails->password) ? $integrationDetails->password : '');
        $selectedLists = $integrationDetails->selectedLists;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($secretKey) || empty($apiKey) || empty($selectedLists)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mailjet'));
        }

        $recordApiHelper = new MailjetService($integrationDetails, $integId, $apiKey, $secretKey);
        $mailjetApiResponse = $recordApiHelper->execute(
            $selectedLists,
            $fieldValues,
            $fieldMap
        );

        if (is_wp_error($mailjetApiResponse)) {
            return $mailjetApiResponse;
        }

        return $mailjetApiResponse;
    }
}
