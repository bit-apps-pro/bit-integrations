<?php

namespace BitApps\Integrations\Actions\FreshSales;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class FreshSalesAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'freshsales',
        'fields'   => [
            'api_key'      => 'value',
            'bundle_alias' => 'bundle_alias',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $api_key = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');
        $bundle_alias = $integrationDetails->bundle_alias;
        $fieldMap = $integrationDetails->field_map;
        $module = strtolower($integrationDetails->moduleData->module);
        $actions = $integrationDetails->actions;

        if (
            empty($fieldMap)
            || empty($api_key)
            || empty($bundle_alias)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'FreshSales'));
        }
        $recordApiHelper = new FreshSalesService($integrationDetails, $integId);
        $freshSalesApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $module,
            $actions
        );

        if (is_wp_error($freshSalesApiResponse)) {
            return $freshSalesApiResponse;
        }

        return $freshSalesApiResponse;
    }
}
