<?php

/**
 * freshdesk Integration
 */

namespace BitApps\Integrations\Actions\Freshdesk;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Freshdesk integration
 */
class FreshdeskController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'freshdesk',
        'fields'   => [
            'api_key'    => 'value',
            'app_domain' => 'app_domain',
        ],
    ];

    /**
     * Process ajax request for Fetch Ticket fields
     *
     * @param object $requestsParams     Params to authorize
     * @param mixed  $tokenRequestParams
     *
     * @return JSON Freshdesk api response and status
     */
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

    /**
     * Process ajax request for Fetch Contact fields
     *
     * @param object $requestsParams     Params to authorize
     * @param mixed  $tokenRequestParams
     *
     * @return JSON Freshdesk api response and status
     */
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

    /**
     * Process ajax request for refresh telegram get Updates
     *
     * @param object $requestsParams  Params to get update
     * @param mixed  $integrationData
     * @param mixed  $fieldValues
     *
     * @return JSON Freshdesk get Updates data
     */
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integrationId = $integrationData->id;
        $api_key = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');
        $status = (int) $integrationDetails->status;
        $priority = (int) $integrationDetails->priority;
        $fieldMap = $integrationDetails->field_map;
        $fieldMapContact = $integrationDetails->field_map_contact;
        $app_base_domamin = $integrationDetails->app_domain;

        if (
            empty($api_key)
            || empty($integrationDetails)
            || empty($app_base_domamin)
            || empty($status)
            || empty($priority)
            || empty($fieldMap)

        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Freshdesk'));
        }
        $apiEndpoint = $integrationDetails->app_domain . '/api/v2/tickets';
        $recordApiHelper = new RecordApiHelper($api_key, $integrationId);
        $freshdeskApiResponse = $recordApiHelper->execute(
            $apiEndpoint,
            $fieldValues,
            $fieldMap,
            $fieldMapContact,
            $integrationDetails,
            $app_base_domamin
        );

        if (is_wp_error($freshdeskApiResponse)) {
            return $freshdeskApiResponse;
        }

        return $freshdeskApiResponse;
    }
}
