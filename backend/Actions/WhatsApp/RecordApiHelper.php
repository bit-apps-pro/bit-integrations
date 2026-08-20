<?php

/**
 * WhatsApp Record Api
 */

namespace BitApps\Integrations\Actions\WhatsApp;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $_baseUrl = 'https://graph.facebook.com/v20.0/';

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function sendMessageWithTemplate(
        $numberId,
        $businessAccountID,
        $token,
        $data,
        $phoneNumber,
        $templatePlaceholders = []
    ) {
        $templateName = $this->_integrationDetails->templateName;
        $apiEndPoint = "{$this->_baseUrl}{$businessAccountID}/message_templates?fields=language&name={$templateName}";
        $response = HttpHelper::get($apiEndPoint, null, static::setHeaders($token));
        $language = isset($response->data[0]->language) ? $response->data[0]->language : 'en_US';

        $apiEndPoint = "{$this->_baseUrl}{$numberId}/messages";
        $template = [
            'name'     => $templateName,
            'language' => [
                'code' => $language
            ]
        ];

        $components = Hooks::apply(Config::withPrefix('whatsapp_template_components'), [], $templatePlaceholders);

        if (!\is_array($components)) {
            $components = [];
        }

        if (!empty($components)) {
            $template['components'] = $components;
        }

        $data = [
            'messaging_product' => 'whatsapp',
            'to'                => "{$phoneNumber}",
            'type'              => 'template',
            'template'          => $template
        ];

        return HttpHelper::post($apiEndPoint, $data, static::setHeaders($token));
    }

    public function sendMessageWithText(
        $numberId,
        $fieldValues,
        $token,
        $phoneNumber
    ) {
        $textBody = $this->_integrationDetails->body;
        $response = Hooks::apply(Config::withPrefix('whatsapp_send_text_messages'), $textBody, $fieldValues, $numberId, $token, $phoneNumber);

        $response = Hooks::apply('btcbi_whatsapp_send_text_messages', $response, $fieldValues, $numberId, $token, $phoneNumber);

        return static::handleFilterResponse($response);
    }

    public function sendMessageWithMedia(
        $numberId,
        $fieldValues,
        $token,
        $phoneNumber
    ) {
        $response = Hooks::apply(Config::withPrefix('whatsapp_send_media_messages'), $this->_integrationDetails, $fieldValues, $numberId, $token, $phoneNumber);

        $response = Hooks::apply('btcbi_whatsapp_send_media_messages', $response, $fieldValues, $numberId, $token, $phoneNumber);

        return static::handleFilterResponse($response);
    }

    public function sendMessageWithContact(
        $numberId,
        $fieldValues,
        $token,
        $phoneNumber
    ) {
        $response = Hooks::apply(Config::withPrefix('whatsapp_send_contact_messages'), $this->_integrationDetails, $fieldValues, $numberId, $token, $phoneNumber);

        $response = Hooks::apply('btcbi_whatsapp_send_contact_messages', $response, $fieldValues, $numberId, $token, $phoneNumber);

        return static::handleFilterResponse($response);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->whatsAppFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $messageType)
    {
        $fieldMap = $this->_integrationDetails->field_map;
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $phoneNumber = ltrim($finalData['phone'], '+');

        $numberId = $this->_integrationDetails->numberID;
        $businessAccountID = $this->_integrationDetails->businessAccountID;
        $token = $this->_integrationDetails->token;

        if ($messageType === 'template' || $messageType === '2') {
            $templateFieldMap = $this->_integrationDetails->template_field_map ?? [];
            $templatePlaceholders = $this->generateReqDataFromFieldMap($fieldValues, $templateFieldMap);

            $apiResponse = $this->sendMessageWithTemplate($numberId, $businessAccountID, $token, $finalData, $phoneNumber, $templatePlaceholders);
            $typeName = 'Template Message';
        } elseif ($messageType === 'text') {
            $apiResponse = $this->sendMessageWithText($numberId, $fieldValues, $token, $phoneNumber);
            $typeName = 'Text Message';
        } elseif ($messageType === 'media') {
            $apiResponse = $this->sendMessageWithMedia($numberId, $fieldValues, $token, $phoneNumber);
            $typeName = 'Media Message';
        } elseif ($messageType === 'contact') {
            $apiResponse = $this->sendMessageWithContact($numberId, $fieldValues, $token, $phoneNumber);
            $typeName = 'Media Message';
        }

        if (property_exists($apiResponse, 'error')) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'message', 'type_name' => $typeName]), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'message', 'type_name' => $typeName]), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private function handleFilterResponse($response)
    {
        if (isset($response->messages[0]->id) || isset($response->error) || is_wp_error($response)) {
            return $response;
        }

        // translators: %s: Placeholder value
        return (object) ['error' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')];
    }

    private static function setHeaders($token)
    {
        return
            [
                'Authorization' => "Bearer {$token}",
                'Content-type'  => 'application/json',
            ];
    }
}
