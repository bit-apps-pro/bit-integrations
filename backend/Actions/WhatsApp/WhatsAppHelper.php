<?php

/**
 * WhatsApp Integration
 */

namespace BitApps\Integrations\Actions\WhatsApp;

use BitApps\Integrations\Core\Util\HttpHelper;

class WhatsAppHelper
{
    private $baseUrl = 'https://graph.facebook.com/v20.0/';

    public function getAllTemplate($requestParams)
    {
        static::checkValidation($requestParams);

        $apiEndpoint = "{$this->baseUrl}{$requestParams->businessAccountID}/message_templates?fields=name,language,components";
        $allTemplates = static::getTemplate($apiEndpoint, $requestParams->token);

        if (is_wp_error($allTemplates)) {
            wp_send_json_error(isset($allTemplates->error->message) ? $allTemplates->error->message : 'Template Fetching failed', 400);
        } else {
            wp_send_json_success($allTemplates, 200);
        }
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
            $allTemplates[] = [
                'name'       => $template->name,
                'language'   => isset($template->language) ? $template->language : 'en_US',
                'components' => isset($template->components) ? $template->components : [],
            ];
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
