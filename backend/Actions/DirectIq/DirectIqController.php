<?php

/**
 * DirectIQ Integration
 */

namespace BitApps\Integrations\Actions\DirectIq;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for ZohoCrm integration
 */
class DirectIqController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'directiq',
        'fields'   => [
            'client_id'     => 'username',
            'client_secret' => 'password',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function _apiEndpoint($method)
    {
        return "https://clientapi.benchmarkemail.com/{$method}";
    }

    /**
     * Process ajax request for refresh Lists
     *
     * @param $queryParams Params to fetch list
     *
     * @return JSON DirectIQ lists data
     */
    public static function directIqLists($queryParams)
    {
        if (
            empty($queryParams->client_id) || empty($queryParams->client_secret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = 'https://rest.directiq.com/contacts/lists/list';

        $authorizationHeader['authorization'] = 'Basic ' . base64_encode("{$queryParams->client_id}:{$queryParams->client_secret}");
        $directIqResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $lists = [];
        if (!is_wp_error($directIqResponse)) {
            $allLists = ($directIqResponse);

            foreach ($allLists as $key => $list) {
                $lists[$list->name] = (object) [
                    'listId'   => $list->id,
                    'listName' => $list->name,
                ];
            }

            $response['directIqLists'] = $lists;
            wp_send_json_success($response);
        }
    }

    /**
     * Process ajax request for refresh crm modules
     *
     * @param $queryParams Params to fetch headers
     *
     * @return JSON crm module data
     */
    public static function directIqHeaders($queryParams)
    {
        if (
            empty($queryParams->client_id) || empty($queryParams->client_secret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $listId = $queryParams->list_id;

        $apiEndpoint = 'https://rest.directiq.com/subscription/fields';

        $authorizationHeader['authorization'] = 'Basic ' . base64_encode("{$queryParams->client_id}:{$queryParams->client_secret}");
        $directIqResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $fields = [];
        if (!is_wp_error($directIqResponse)) {
            $allFields = $directIqResponse;

            foreach ($allFields as $field) {
                $fields[$field->shortCode] = (object) [
                    'fieldId'    => $field->shortCode,
                    'fieldName'  => $field->name,
                    'fieldValue' => strtolower(str_replace(' ', '_', $field->name)),
                    'required'   => strtolower($field->name) == 'email' ? true : false
                ];
            }

            $response['directIqField'] = $fields;

            wp_send_json_success($response);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        $client_id = $integrationDetails->client_id;
        $client_secret = $integrationDetails->client_secret;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $listId = $integrationDetails->listId;

        if (
            empty($client_id) || empty($client_secret) || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'DirectIQ'));
        }
        $recordApiHelper = new RecordApiHelper($client_id, $client_secret, $this->_integrationID);

        $directIqApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $actions,
            $listId,
        );

        if (is_wp_error($directIqApiResponse)) {
            return $directIqApiResponse;
        }

        return $directIqApiResponse;
    }
}
