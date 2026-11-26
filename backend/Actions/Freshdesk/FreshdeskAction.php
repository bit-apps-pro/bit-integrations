<?php

namespace BitApps\Integrations\Actions\Freshdesk;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class FreshdeskAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'freshdesk',
        'fields'   => [
            'api_key'    => 'value',
            'app_domain' => 'app_domain',
        ],
    ];

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
        $recordApiHelper = new FreshdeskService($api_key, $integrationId);
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
