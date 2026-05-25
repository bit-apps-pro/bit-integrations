<?php

/**
 * OmniSend Integration
 */

namespace BitApps\Integrations\Actions\OmniSend;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for OmniSend integration
 */
class OmniSendController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'omnisend',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    protected $_defaultHeader;

    private $baseUrl = 'https://api.omnisend.com/v3/';

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $api_key = $integrationDetails->api_key;
        $channels = $integrationDetails->channels;
        $fieldMap = $integrationDetails->field_map;
        $customFieldMap = $integrationDetails->custom_field_map ?? [];
        $emailStatus = $integrationDetails->email_status;
        $smsStatus = $integrationDetails->sms_status;

        if (
            empty($fieldMap)
             || empty($api_key)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'OmniSend'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        $omniSendApiResponse = $recordApiHelper->execute(
            $channels,
            $emailStatus,
            $smsStatus,
            $fieldValues,
            $fieldMap,
            $customFieldMap
        );

        if (is_wp_error($omniSendApiResponse)) {
            return $omniSendApiResponse;
        }

        return $omniSendApiResponse;
    }
}
