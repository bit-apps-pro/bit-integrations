<?php

/**
 * ZagoMail Integration
 */

namespace BitApps\Integrations\Actions\ZagoMail;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for ZohoCrm integration
 */
class ZagoMailController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'zagomail',
        'fields'   => [
            'api_public_key' => 'value',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function _apiEndpoint($method)
    {
        return "https://api.zagomail.com/{$method}";
    }

    /**
     * Process ajax request for refresh Lists
     *
     * @param $queryParams Params to fetch list
     *
     * @return JSON convert kit lists data
     */
    public static function zagoMailLists($queryParams)
    {
        if (empty($queryParams->api_public_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $body = [
            'publicKey' => $queryParams->api_public_key
        ];

        $header['Content-Type'] = 'application/json';

        $apiEndpoint = self::_apiEndpoint('lists/all-lists');

        $zagoMailResponse = HttpHelper::post($apiEndpoint, wp_json_encode($body), $header);

        $lists = [];
        if ($zagoMailResponse->status == 'success') {
            $allLists = $zagoMailResponse->data;

            foreach ($allLists->records as $list) {
                $lists[$list->general->name] = (object) [
                    'listId'   => $list->general->list_uid,
                    'listName' => $list->general->name,
                ];
            }
            $response['zagoMailLists'] = $lists;
            wp_send_json_success($response);
        }
    }

    /**
     * Process ajax request for refresh Tags
     *
     * @param $queryParams Params to fetch list
     *
     * @return JSON convert kit tags data
     */
    public static function zagoMailTags($queryParams)
    {
        if (empty($queryParams->api_public_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $body = [
            'publicKey' => $queryParams->api_public_key
        ];

        $header['Content-Type'] = 'application/json';

        $apiEndpoint = self::_apiEndpoint('tags/get-tags');

        $zagoMailResponse = HttpHelper::post($apiEndpoint, wp_json_encode($body), $header);

        $tags = [];
        if ($zagoMailResponse->status == 'success') {
            $allTags = $zagoMailResponse->tags;

            foreach ($allTags as $tag) {
                $tags[] = [
                    'tagId'   => $tag->ztag_id,
                    'tagName' => $tag->ztag_name,
                ];
            }
            $response['zagoMailTags'] = $tags;
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
    public static function zagoMailRefreshFields($queryParams)
    {
        if (empty($queryParams->api_public_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $body = [
            'publicKey' => $queryParams->api_public_key
        ];

        $header['Content-Type'] = 'application/json';

        $apiEndpoint = self::_apiEndpoint('lists/get-fields?list_uid=' . $queryParams->listId);

        $zagoMailResponse = HttpHelper::post($apiEndpoint, wp_json_encode($body), $header);

        $fields = [];
        if ($zagoMailResponse->status == 'success') {
            $allFields = $zagoMailResponse->data;

            foreach ($allFields->records as $field) {
                $fields[$field->tag] = (object) [
                    'fieldId'   => $field->tag,
                    'fieldName' => $field->label,
                    'required'  => $field->required == 'yes' ? true : false
                ];
            }

            $response['zagoMailField'] = $fields;
            wp_send_json_success($response);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $api_public_key = $integrationDetails->api_public_key;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $listId = $integrationDetails->listId;
        $tags = null;
        if (isset($integrationDetails->selectedTags)) {
            $tags = \is_array($integrationDetails->selectedTags) ? $integrationDetails->selectedTags : explode(',', $integrationDetails->selectedTags);
        }

        if (
            empty($api_public_key)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Sendinblue'));
        }
        $recordApiHelper = new RecordApiHelper($api_public_key, $this->_integrationID);

        $zagoMailApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $actions,
            $listId,
            $tags
        );

        if (is_wp_error($zagoMailApiResponse)) {
            return $zagoMailApiResponse;
        }

        return $zagoMailApiResponse;
    }
}
