<?php

namespace BitApps\Integrations\Actions\Freshdesk;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\HttpHelper;

class FreshdeskHelper
{
    public function getAllTicketFields($tokenRequestParams)
    {
        if (
            empty($tokenRequestParams->app_domain)
            || empty($tokenRequestParams->api_key)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => base64_encode("{$tokenRequestParams->api_key}"),
            'Content-Type'  => 'application/json'
        ];

        $apiEndpoint = $tokenRequestParams->app_domain . '/api/v2/ticket_fields';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);
        $excludingFields = ['company', 'requester', 'ticket_type', 'source', 'status', 'priority', 'group', 'agent', 'product'];

        if (is_wp_error($apiResponse) || empty($apiResponse[0]->id)) {
            wp_send_json_error(
                empty($apiResponse->error) ? 'Unknown' : $apiResponse->error,
                400
            );
        }
        $responseData = [
            'ticketFields' => [(object) ['key' => 'email', 'label' => 'Email', 'required' => true]]
        ];

        foreach ($apiResponse as $value) {
            if (!\in_array($value->name, $excludingFields)) {
                $responseData['ticketFields'][] = (object) ['key' => $value->name, 'label' => $value->label, 'required' => $value->required_for_agents];
            }

            if ($value->name == 'ticket_type') {
                $responseData['ticketType'] = $value->choices;
            }
            if ($value->name == 'source') {
                $responseData['sources'] = $value->choices;
            }
            if ($value->name == 'group') {
                $responseData['groups'] = $value->choices;
            }
            if ($value->name == 'agent') {
                $responseData['agents'] = $value->choices;
            }
            if ($value->name == 'product') {
                $responseData['products'] = $value->choices;
            }
        }

        wp_send_json_success($responseData, 200);
    }

    public function getAllContactFields($tokenRequestParams)
    {
        if (
            empty($tokenRequestParams->app_domain)
            || empty($tokenRequestParams->api_key)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => base64_encode("{$tokenRequestParams->api_key}"),
            'Content-Type'  => 'application/json'
        ];

        $apiEndpoint = $tokenRequestParams->app_domain . '/api/v2/contact_fields';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);
        $excludingFields = ['time_zone', 'language', 'unique_external_id'];

        if (is_wp_error($apiResponse) || empty($apiResponse[0]->id)) {
            wp_send_json_error(
                empty($apiResponse->error) ? 'Unknown' : $apiResponse->error,
                400
            );
        }

        $responseData = [];
        foreach ($apiResponse as $value) {
            if (!\in_array($value->name, $excludingFields)) {
                $responseData[] = (object) [
                    'key'      => $value->default ? $value->name : Config::withPrefix("cf_{$value->name}"),
                    'label'    => $value->label,
                    'required' => $value->name == 'email' || $value->name == 'name' ? true : $value->required_for_agents
                ];
            }
        }

        wp_send_json_success($responseData, 200);
    }
}
