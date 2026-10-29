<?php

namespace BitApps\Integrations\Actions\ZendeskSupport;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ZendeskSupportAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::CUSTOM,
        'slug'     => 'ZendeskSupport',
        'fields'   => [
            'subdomain' => 'subdomain',
            'email'     => 'email',
            'apiToken'  => 'apiToken',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (
            empty($fieldMap)
            || empty($actionName)
            || empty($integrationDetails->subdomain)
            || empty($integrationDetails->email)
            || empty($integrationDetails->apiToken)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Zendesk Support'));
        }

        $recordApiHelper = new ZendeskSupportService($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);
    }
}
