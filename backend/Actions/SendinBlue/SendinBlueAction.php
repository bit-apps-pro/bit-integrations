<?php

namespace BitApps\Integrations\Actions\SendinBlue;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SendinBlueAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'sendinblue',
        // Connections store the UI's display name, which carries the Brevo rebrand.
        'aliases'  => ['Brevo(Sendinblue)'],
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;

        $api_key = $integrationDetails->api_key;
        $lists = $integrationDetails->lists;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;

        if (
            empty($api_key)
            || empty($lists)
            || empty($fieldMap)
            || empty($defaultDataConf)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Sendinblue'));
        }
        $recordApiHelper = new SendinBlueService($api_key, $integId);
        $sendinBlueApiResponse = $recordApiHelper->execute(
            $lists,
            $defaultDataConf,
            $fieldValues,
            $fieldMap,
            $actions,
            $integrationDetails
        );

        if (is_wp_error($sendinBlueApiResponse)) {
            return $sendinBlueApiResponse;
        }

        return $sendinBlueApiResponse;
    }
}
