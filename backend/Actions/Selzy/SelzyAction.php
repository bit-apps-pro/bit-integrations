<?php

namespace BitApps\Integrations\Actions\Selzy;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SelzyAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'selzy',
        'fields'   => [
            'authKey' => 'value',
            'api_key' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authKey = $integrationDetails->authKey ?: ($integrationDetails->api_key ?: ($integrationDetails->value ?? ''));
        $listIds = $integrationDetails->listIds;
        $tags = $integrationDetails->tags;
        $method = $integrationDetails->method;
        $option = $integrationDetails->option;
        $overwrite = $integrationDetails->overwrite;
        $field_map = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;

        if (!$actions->option) {
            $option = 0;
        }
        if (!$actions->overwrite) {
            $overwrite = 0;
        }

        if (
            empty($field_map)
            || empty($authKey)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Selzy'));
        }
        $recordApiHelper = new SelzyService($integrationDetails, $integId);
        $selzyApiResponse = $recordApiHelper->execute(
            $method,
            $listIds,
            $tags,
            $option,
            $overwrite,
            $fieldValues,
            $field_map,
            $authKey
        );

        if (is_wp_error($selzyApiResponse)) {
            return $selzyApiResponse;
        }

        return $selzyApiResponse;
    }
}
