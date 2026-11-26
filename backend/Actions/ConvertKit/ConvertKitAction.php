<?php

namespace BitApps\Integrations\Actions\ConvertKit;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ConvertKitAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'convertkit',
        // Connections store the UI's display name, which carries the Kit rebrand.
        'aliases'  => ['Kit(ConvertKit)'],
        'fields'   => [
            'api_secret' => 'value',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        $api_secret = $integrationDetails->api_secret;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $formId = $integrationDetails->formId;
        $tags = $integrationDetails->tagIds ?? null;

        if (
            empty($api_secret)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Kit(ConvertKit)'));
        }
        $recordApiHelper = new ConvertKitService($integrationDetails, $api_secret, $this->_integrationID);

        $convertKitApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $actions,
            $formId,
            $tags
        );

        if (is_wp_error($convertKitApiResponse)) {
            return $convertKitApiResponse;
        }

        return $convertKitApiResponse;
    }
}
