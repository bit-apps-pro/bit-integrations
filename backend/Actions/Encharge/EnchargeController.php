<?php

/**
 * Encharge Integration
 */

namespace BitApps\Integrations\Actions\Encharge;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Encharge integration
 */
class EnchargeController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'encharge',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    public const APIENDPOINT = 'https://api.encharge.io/v1/';

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    /**
     * Process ajax request for refresh crm modules
     *
     * @param $queryParams Params for fetch headers
     *
     * @return JSON Encharge field
     */
    public static function enchargeHeaders($queryParams)
    {
        if (empty($queryParams->api_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoint = self::APIENDPOINT . 'fields';
        $authorizationHeader['Accept'] = 'application/json';
        $authorizationHeader['X-Encharge-Token'] = $queryParams->api_key;
        $enChargeResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);
        $fields = [];
        if (!is_wp_error($enChargeResponse)) {
            $allFields = $enChargeResponse->items;
            // wp_send_json_success($allFields);
            foreach ($allFields as $field) {
                $required = $field->name === 'email' ? true : false;
                $fields[$field->name] = (object) [
                    'fieldId'   => $field->name,
                    'fieldName' => ucfirst($field->name),
                    'required'  => $required
                ];
            }
            $response['enChargeFields'] = $fields;
            wp_send_json_success($response);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        $api_key = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $tags = property_exists($integrationDetails, 'tags') ? $integrationDetails->tags : null;

        if (empty($api_key)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Encharge Controller'));
        }
        $recordApiHelper = new RecordApiHelper($api_key, $this->_integrationID);
        $enchagreApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $tags
        );

        if (is_wp_error($enchagreApiResponse)) {
            return $enchagreApiResponse;
        }

        return $enchagreApiResponse;
    }
}
