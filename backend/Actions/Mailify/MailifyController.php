<?php

namespace BitApps\Integrations\Actions\Mailify;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

class MailifyController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'mailify',
        'fields'   => [
            'account_id' => 'username',
            'api_key'    => 'password',
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public static function mailifyHeaders($requestParams)
    {
        $credentials = self::extractCredentials($requestParams);
        if (empty($credentials['account_id']) || empty($credentials['api_key'])) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $listId = $requestParams->list_id;
        $apiEndpoint = "https://mailifyapis.com/v1/lists/{$listId}/fields";
        $headers = [
            'accountId' => $credentials['account_id'],
            'apiKey'    => $credentials['api_key'],
        ];

        $mailifyResponse = HttpHelper::get($apiEndpoint, null, $headers);

        $fields = [];
        if (!is_wp_error($mailifyResponse->fields)) {
            $allFields = $mailifyResponse->fields;
            $unwantedFieldKeys = ['id', 'CREATION_DATE_ID', 'MODIFICATION_DATE_ID'];
            foreach ($allFields as $field) {
                if (!\in_array($field->id, $unwantedFieldKeys)) {
                    $fields[$field->caption] = (object) [
                        'fieldName'  => $field->caption,
                        'fieldValue' => $field->id,
                        'required'   => strtolower($field->caption) == 'email' ? true : false
                    ];
                }
            }

            $response['mailifyField'] = $fields;
            wp_send_json_success($response);
        }
    }

    public static function getAllList($requestParams)
    {
        $credentials = self::extractCredentials($requestParams);
        if (empty($credentials['account_id']) || empty($credentials['api_key'])) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $headers = [
            'accountId' => $credentials['account_id'],
            'apiKey'    => $credentials['api_key'],
        ];
        $apiEndpoint = 'https://mailifyapis.com/v1/lists';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);
        $lists = [];

        foreach ($apiResponse as $item) {
            $lists[] = [
                'listId'   => $item->id,
                'listName' => $item->name
            ];
        }

        if ((\count($lists)) > 0) {
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error('List fetching failed', 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $selectedList = $integrationDetails->listId;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $accountId = $integrationDetails->account_id;
        $apiKey = $integrationDetails->api_key;

        if (empty($fieldMap) || empty($accountId) || empty($apiKey) || empty($selectedList)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mailify'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $accountId, $apiKey);
        $mailifyApiResponse = $recordApiHelper->execute(
            $selectedList,
            $fieldValues,
            $fieldMap,
            $actions
        );

        if (is_wp_error($mailifyApiResponse) || (isset($mailifyApiResponse['success']) && !$mailifyApiResponse['success'])) {
            return $mailifyApiResponse;
        }

        return $mailifyApiResponse;
    }

    private static function extractCredentials($requestParams)
    {
        $accountId = !empty($requestParams->account_id) ? $requestParams->account_id : (!empty($requestParams->username) ? $requestParams->username : '');
        $apiKey = !empty($requestParams->api_key) ? $requestParams->api_key : (!empty($requestParams->password) ? $requestParams->password : '');

        return [
            'account_id' => $accountId,
            'api_key'    => $apiKey,
        ];
    }
}
