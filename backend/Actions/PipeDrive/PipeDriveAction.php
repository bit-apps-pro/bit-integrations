<?php

namespace BitApps\Integrations\Actions\PipeDrive;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Hooks;
use WP_Error;

class PipeDriveAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'pipedrive',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $api_key = !empty($integrationDetails->api_key) ? $integrationDetails->api_key : (isset($integrationDetails->value) ? $integrationDetails->value : '');
        $fieldMap = $integrationDetails->field_map;
        $module = strtolower($integrationDetails->moduleData->module);

        if (
            empty($fieldMap)
             || empty($api_key)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'PipeDrive'));
        }
        $recordApiHelper = new PipeDriveService($integrationDetails, $integId);
        $pipeDriveApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $module
        );

        if (is_wp_error($pipeDriveApiResponse)) {
            return $pipeDriveApiResponse;
        }

        if (isset($pipeDriveApiResponse->success, $pipeDriveApiResponse->data) && $pipeDriveApiResponse->success && \count($integrationDetails->relatedlists)) {
            Hooks::run(Config::withPrefix('pipedrive_store_related_list'), $pipeDriveApiResponse, $integrationDetails, $fieldValues, $module, $api_key, $integId);

            /**
             * @deprecated 2.7.8 Use `bit_integrations_pipedrive_store_related_list` action instead.
             * @since 2.7.8
             */
            Hooks::run('btcbi_pipedrive_store_related_list', $pipeDriveApiResponse, $integrationDetails, $fieldValues, $module, $api_key, $integId);
        }

        return $pipeDriveApiResponse;
    }
}
