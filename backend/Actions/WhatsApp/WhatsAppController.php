<?php

/**
 * WhatsApp Integration
 */

namespace BitApps\Integrations\Actions\WhatsApp;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Trello integration
 */
class WhatsAppController
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

    private $baseUrl = 'https://graph.facebook.com/v20.0/';

    public function getAllTemplate($requestParams)
    {
        static::checkValidation($requestParams);

        $apiEndpoint = "{$this->baseUrl}{$requestParams->businessAccountID}/message_templates?fields=name";
        $allTemplates = static::getTemplate($apiEndpoint, $requestParams->token);

        if (is_wp_error($allTemplates)) {
            wp_send_json_error(isset($allTemplates->error->message) ? $allTemplates->error->message : 'Template Fetching failed', 400);
        } else {
            wp_send_json_success($allTemplates, 200);
        }
    }

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

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $whatsAppApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $messageType,
        );

        if (is_wp_error($whatsAppApiResponse)) {
            return $whatsAppApiResponse;
        }

        return $whatsAppApiResponse;
    }

    private static function getTemplate($apiEndpoint, $token)
    {
        $allTemplates = [];
        $headers = static::setHeaders($token);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (is_wp_error($response) || !isset($response->data)) {
            return $response;
        }

        foreach ($response->data as $template) {
            $allTemplates[] = $template->name;
        }

        if (isset($response->paging->next)) {
            $templates = static::getTemplate($response->paging->next, $token);
            $allTemplates = array_merge($allTemplates, \is_array($templates) ? $templates : []);
        }

        return $allTemplates;
    }

    private static function checkValidation($requestParams)
    {
        if (empty($requestParams->numberID) || empty($requestParams->businessAccountID) || empty($requestParams->token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private static function setHeaders($token)
    {
        return
            [
                'Authorization' => "Bearer {$token}",
                'Content-Type'  => 'application/json',
            ];
    }
}
