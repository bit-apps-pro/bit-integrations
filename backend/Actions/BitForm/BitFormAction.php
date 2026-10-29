<?php

namespace BitApps\Integrations\Actions\BitForm;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class BitFormAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'bitform',
        'fields'   => [
            'api_key'    => 'value',
            'app_domain' => 'domainName',
        ],
    ];

    /**
     * Save updated access_token to avoid unnecessary token generation
     *
     * @param object $integrationData Details of flow
     * @param array  $fieldValues     Data to send Mail Chimp
     *
     * @return null
     */
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $formId = $integrationDetails->id;
        $api_key = $integrationDetails->api_key;
        $domainName = $integrationDetails->domainName;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $defaultDataConf = $integrationDetails->default;

        if (
            empty($fieldMap)
            || empty($defaultDataConf)
            || empty($api_key)
            || empty($domainName)
            || empty($formId)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Bit From'));
        }
        $recordApiHelper = new BitFormService($integrationDetails, $integId);
        $bitFormApiResponse = $recordApiHelper->execute(
            $defaultDataConf,
            $fieldValues,
            $fieldMap,
            $api_key,
            $domainName,
            $formId
        );

        if (is_wp_error($bitFormApiResponse)) {
            return $bitFormApiResponse;
        }

        return $bitFormApiResponse;
    }
}
