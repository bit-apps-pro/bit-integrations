<?php

/**
 * Active Campaign Integration
 */

namespace BitApps\Integrations\Actions\ActiveCampaign;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for ZohoCrm integration
 */
class ActiveCampaignController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'activecampaign',
        'fields'   => [
            'api_key' => 'value',
            'api_url' => 'api_url',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function _apiEndpoint($api_url, $method)
    {
        return "{$api_url}/api/3/{$method}/";
    }

    /**
     * Process ajax request for refresh lists
     *
     * @param $queryParams Params to fetch list
     *
     * @return JSON active campaign list data
     */
    public static function activeCampaignLists($queryParams)
    {
        if (
            empty($queryParams->api_key)
            || empty($queryParams->api_url)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $lists = [];
        static::fetchLists(0, $queryParams->api_url, $queryParams->api_key, $lists);
        $response['activeCampaignLists'] = $lists;
        wp_send_json_success($response);
    }

    /**
     * Process ajax request for refresh lists
     *
     * @param $queryParams Params to fetch list
     *
     * @return JSON active campaign list data
     */
    public static function activeCampaignAccounts($queryParams)
    {
        if (
            empty($queryParams->api_key)
            || empty($queryParams->api_url)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = self::_apiEndpoint($queryParams->api_url, 'accounts');
        $authorizationHeader['Api-Token'] = $queryParams->api_key;
        $aCampaignResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $lists = [];
        if (!is_wp_error($aCampaignResponse) && isset($aCampaignResponse->accounts)) {
            // $allLists = $aCampaignResponse->lists;

            // foreach ($allLists as $list) {
            //     $lists[$list->name] = (object) [
            //         'listId' => $list->id,
            //         'listName' => $list->name,
            //     ];
            // }
            // $response['activeCampaignLists'] = $lists;
            wp_send_json_success($aCampaignResponse->accounts);
        }
    }

    public static function activeCampaignTags($queryParams)
    {
        if (
            empty($queryParams->api_key)
            || empty($queryParams->api_url)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $offset = 0;
        $limit = 100;
        $has_items = true;
        $available_tags = [];
        while ($has_items) {
            $tagResponse = wp_safe_remote_get(
                $queryParams->api_url . '/api/3/tags?limit=' . $limit . '&offset=' . $offset,
                [
                    'headers' => [
                        'Api-token' => $queryParams->api_key,
                    ],
                ]
            );

            $tagResponse = json_decode(wp_remote_retrieve_body($tagResponse));

            if (isset($tagResponse->tags)) {
                foreach ($tagResponse->tags as $tag) {
                    $available_tags[$tag->id] = $tag->tag;
                }
            }

            if (empty($tagResponse->tags) || \count($tagResponse->tags) < $limit) {
                $has_items = false;
            }

            $offset += $limit;
        }

        asort($available_tags);
        $tag_items = [];

        foreach ($available_tags as $key => $value) {
            $tag_items[] = [
                'tagId'   => "{$key}",
                'tagName' => $value,
            ];
        }
        $response['activeCampaignTags'] = $tag_items;
        wp_send_json_success($response);
    }

    public static function activeCampaignHeaders($queryParams)
    {
        if (
            empty($queryParams->api_key)
            || empty($queryParams->api_url)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        // $apiEndpoint = "{$queryParams->api_url}/api/3/fields";
        $apiEndpoint = self::_apiEndpoint($queryParams->api_url, 'fields');
        $authorizationHeader['Api-Token'] = $queryParams->api_key;
        $requestParams = [
            'limit' => 1000,
        ];
        $aCampaignResponse = HttpHelper::get($apiEndpoint, $requestParams, $authorizationHeader);

        $fields = [];
        if (!is_wp_error($aCampaignResponse)) {
            $allFields = $aCampaignResponse->fields;
            foreach ($allFields as $field) {
                $fields[$field->title] = (object) [
                    'fieldId'   => $field->id,
                    'fieldName' => $field->title,
                    'required'  => $field->isrequired === '0' ? false : true
                ];
            }
            $fields['FirstName'] = (object) ['fieldId' => 'firstName', 'fieldName' => __('First Name', 'bit-integrations'), 'required' => false];
            $fields['LastName'] = (object) ['fieldId' => 'lastName', 'fieldName' => __('Last Name', 'bit-integrations'), 'required' => false];
            $fields['Email'] = (object) ['fieldId' => 'email', 'fieldName' => __('Email', 'bit-integrations'), 'required' => true];
            $fields['Phone'] = (object) ['fieldId' => 'phone', 'fieldName' => __('Phone', 'bit-integrations'), 'required' => false];
            $response['activeCampaignField'] = $fields;
            wp_send_json_success($response);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $api_key = $integrationDetails->api_key;
        $api_url = $integrationDetails->api_url;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $listId = $integrationDetails->listId;
        $tags = $integrationDetails->tagIds;

        if (
            empty($api_key)
            || empty($api_url)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Active Campaign'));
        }
        $recordApiHelper = new RecordApiHelper($api_key, $api_url, $this->_integrationID);
        $activeCampaignApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $fieldValues,
            $fieldMap,
            $actions,
            $listId,
            $tags
        );

        if (is_wp_error($activeCampaignApiResponse)) {
            return $activeCampaignApiResponse;
        }

        return $activeCampaignApiResponse;
    }

    private static function fetchLists($offset, $api_url, $api_key, &$lists)
    {
        $limit = 100;
        $apiEndpoint = self::_apiEndpoint($api_url, 'lists');
        $requestParams = [
            'limit'  => $limit,
            'offset' => $offset,
        ];

        $authorizationHeader['Api-Token'] = $api_key;
        $aCampaignResponse = HttpHelper::get($apiEndpoint, $requestParams, $authorizationHeader);

        if (!is_wp_error($aCampaignResponse)) {
            $allLists = $aCampaignResponse->lists;

            foreach ($allLists as $list) {
                $lists[$list->name] = (object) [
                    'listId'   => $list->id,
                    'listName' => $list->name,
                ];
            }

            if (!empty($aCampaignResponse->meta) && !empty($aCampaignResponse->meta->total) && $aCampaignResponse->meta->total > $limit && $offset < $aCampaignResponse->meta->total) {
                static::fetchLists($offset + $limit, $api_url, $api_key, $lists);
            }
        }
    }
}

// public static function activeCampaignTags($queryParams)
// {
//     if (empty($queryParams->api_key)
//         || empty($queryParams->api_url)
//     ) {
//         wp_send_json_error(
//             __(
//                 'Requested parameter is empty',
//                 'bit-integrations'
//             ),
//             400
//         );
//     }

//     $apiEndpoint = self::_apiEndpoint($queryParams->api_url, 'tags');
//     $authorizationHeader['Api-Token'] = $queryParams->api_key;
//     $requestParams = [
//         'limit' => 1000,
//     ];
//     $aCampaignResponse = HttpHelper::get($apiEndpoint, $requestParams, $authorizationHeader);

//     $tags = [];
//     if (!is_wp_error($aCampaignResponse)) {
//         $allTags = $aCampaignResponse->tags;

//         foreach ($allTags as $tag) {
//             $tags[$tag->tag] = (object) [
//                 'tagId' => $tag->id,
//                 'tagName' => $tag->tag,
//             ];
//         }
//         var_dump($tags,'tags');die;
//         $response['activeCampaignTags'] = $tags;
//         wp_send_json_success($response);
//     }
// }
