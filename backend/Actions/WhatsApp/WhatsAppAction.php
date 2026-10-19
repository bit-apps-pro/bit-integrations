<?php

namespace BitApps\Integrations\Actions\WhatsApp;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class WhatsAppAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'whatsapp',
        'fields'   => [
            'token'             => 'token',
            'numberID'          => 'numberID',
            'businessAccountID' => 'businessAccountID',
        ],
    ];

    /**
     * Save updated access_token to avoid unnecessary token generation
     *
     * @param object $integrationData Details of flow
     * @param array  $fieldValues     Data to send Mail Chimp
     *
     * @return null
     */
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $messageType = isset($integrationDetails->messageTypeId) ? $integrationDetails->messageTypeId : $integrationDetails->messageType;

        if (empty($messageType)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'WhatsApp'));
        }

        $recordApiHelper = new WhatsAppService($integrationDetails, $integId);
        $whatsAppApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $messageType,
        );

        if (is_wp_error($whatsAppApiResponse)) {
            return $whatsAppApiResponse;
        }

        return $whatsAppApiResponse;
    }
}
