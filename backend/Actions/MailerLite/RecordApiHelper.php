<?php

/**
 * MailerLite    Record Api
 */

namespace BitApps\Integrations\Actions\MailerLite;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, upsert
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $_defaultHeader;

    private $_baseUrl;

    private $_actions;

    private $_isMailerLiteV2;

    public function __construct($auth_token, $integrationDetails, $integId, $actions, $version)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_isMailerLiteV2 = (bool) ('v2' === $version);

        if ('v2' === $version) {
            $this->_baseUrl = 'https://connect.mailerlite.com/api/';
            $this->_defaultHeader = [
                'Authorization' => "Bearer {$auth_token}"
            ];
        } else {
            $this->_baseUrl = 'https://api.mailerlite.com/api/v2/';
            $this->_defaultHeader = [
                'X-Mailerlite-Apikey' => $auth_token
            ];
        }
        $this->_actions = $actions;
    }

    public function existSubscriber($auth_token, $email)
    {
        if (empty($auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoints = $this->_baseUrl . "subscribers/{$email}";

        $response = HttpHelper::get($apiEndpoints, null, $this->_defaultHeader);

        return [
            'id'   => $response->data->id ?? null,
            'data' => $response->data ?? null
        ];
    }

    public function enableDoubleOptIn($auth_token)
    {
        if (empty($auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoints = $this->_baseUrl . 'settings/double_optin';
        $requestParams = [
            'enable' => true
        ];

        HttpHelper::post($apiEndpoints, $requestParams, $this->_defaultHeader);
    }

    public function addSubscriber($auth_token, $groupIds, $type, $finalData)
    {
        if (empty($finalData['email'])) {
            return [
                'success' => false,
                'message' => __('Required field Email is empty', 'bit-integrations'),
                'code'    => 400
            ];
        }

        $email = $finalData['email'];
        $splitGroupIds = !empty($groupIds) ? explode(',', $groupIds) : [];
        $apiEndpoint = $this->_baseUrl . 'subscribers';

        $requestParams = self::prepareRequestParams($finalData, $type, $this->_isMailerLiteV2);

        $existSubscriber = $this->existSubscriber($auth_token, $email);
        if ($existSubscriber['id'] && empty($this->_actions->update)) {
            return [
                'success' => false,
                'message' => __('Subscriber already exist', 'bit-integrations'),
                'code'    => 400
            ];
        }

        self::handleDoubleOptIn($this, $auth_token, $requestParams, $this->_isMailerLiteV2);

        if (!empty($splitGroupIds)) {
            return self::sendToGroups($this, $splitGroupIds, $requestParams, $this->_isMailerLiteV2);
        }

        if ($existSubscriber['id']) {
            if (isset($existSubscriber['data']->status) && 'unsubscribed' === $existSubscriber['data']->status) {
                $requestParams['resubscribe'] = true;
            }

            $response = HttpHelper::post($apiEndpoint, $requestParams, $this->_defaultHeader);
            $response->update = true;

            return $response;
        }

        return HttpHelper::post($apiEndpoint, $requestParams, $this->_defaultHeader);
    }

    public function deleteSubscriber($auth_token, $finalData, $forget = false)
    {
        if (!$this->_isMailerLiteV2) {
            return [
                'success' => false,
                'message' => __('This action is not supported for Classic accounts.', 'bit-integrations'),
                'code'    => 400
            ];
        }

        if (empty($finalData['email'])) {
            return [
                'success' => false,
                'message' => __('Required field Email is empty', 'bit-integrations'),
                'code'    => 400
            ];
        }

        $existSubscriber = $this->existSubscriber($auth_token, $finalData['email']);

        if (empty($existSubscriber['id'])) {
            return [
                'success' => false,
                'message' => __('Subscriber not exist', 'bit-integrations'),
                'code'    => 400
            ];
        }

        $subscriberId = $existSubscriber['id'];

        $response = Hooks::apply(Config::withPrefix('mailerlite_delete_subscriber'), false, $subscriberId, $finalData, $this->_baseUrl, $this->_defaultHeader, $forget);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_mailerlite_delete_subscriber` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_mailerlite_delete_subscriber', $response, $subscriberId, $finalData, $this->_baseUrl, $this->_defaultHeader, $forget);

        return $response ? $response : (object) ['success' => false, 'message' => __('Bit Integrations Pro is required.', 'bit-integrations'), 'code' => 400];
    }

    public function unassignSubscriberFromGroup($auth_token, $groupId, $finalData)
    {
        if (!$this->_isMailerLiteV2) {
            return [
                'success' => false,
                'message' => __('This action is not supported for Classic accounts.', 'bit-integrations'),
                'code'    => 400
            ];
        }

        if (empty($finalData['email'])) {
            return [
                'success' => false,
                'message' => __('Required field Email is empty', 'bit-integrations'),
                'code'    => 400
            ];
        }
        if (empty($groupId)) {
            return [
                'success' => false,
                'message' => __('Required field Group is empty', 'bit-integrations'),
                'code'    => 400
            ];
        }

        $existSubscriber = $this->existSubscriber($auth_token, $finalData['email']);
        if (empty($existSubscriber['id'])) {
            return [
                'success' => false,
                'message' => __('Subscriber not exist', 'bit-integrations'),
                'code'    => 400
            ];
        }

        $response = Hooks::apply(Config::withPrefix('mailerlite_unassign_subscriber_from_group'), false, $existSubscriber['id'], $groupId, $this->_baseUrl, $this->_defaultHeader);

        return $response ? $response : (object) ['success' => false, 'message' => __('Bit Integrations Pro is required.', 'bit-integrations'), 'code' => 400];
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->mailerLiteFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute(
        $integrationDetails,
        $type,
        $fieldValues,
        $fieldMap,
        $auth_token,
        $action
    ) {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        switch ($action) {
            case 'delete_subscriber':
                $apiResponse = $this->deleteSubscriber($auth_token, $finalData);
                $typeName = 'delete-subscriber';
                $res = ['success' => true, 'message' => __('Subscriber deleted successfully', 'bit-integrations'), 'code' => 200];

                break;

            case 'forget_subscriber':
                $apiResponse = $this->deleteSubscriber($auth_token, $finalData, true);
                $typeName = 'forget-subscriber';
                $res = $apiResponse->message ?? wp_json_encode($apiResponse);

                break;

            case 'unassign_subscriber_from_group':
                $groupId = $integrationDetails->selected_group_id ?? '';
                $apiResponse = $this->unassignSubscriberFromGroup($auth_token, $groupId, $finalData);
                $typeName = 'unassign-subscriber-from-group';
                $res = ['success' => true, 'message' => __('Subscriber unassigned from group successfully', 'bit-integrations'), 'code' => 200];

                break;

            default:
                $groupId = $integrationDetails->group_ids ?? '';
                $apiResponse = $this->addSubscriber($auth_token, $groupId, $type, $finalData);
                $typeName = 'add-subscriber';
                $res = ['success' => true, 'message' => isset($apiResponse->update) ? __('Subscriber updated successfully', 'bit-integrations') : __('Subscriber created successfully', 'bit-integrations'), 'code' => 200];

                break;
        }

        if (isset($apiResponse->data->id) || isset($apiResponse->id) || strpos((string) HttpHelper::$responseCode, '20') === 0) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'subscriber', 'type_name' => $typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'subscriber', 'type_name' => $typeName]), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private static function prepareRequestParams($finalData, $type, $isMailerLiteV2)
    {
        $email = $finalData['email'];
        $params = [
            'email'                             => $email,
            $isMailerLiteV2 ? 'status' : 'type' => $type ? $type : 'active',
        ];

        foreach ($finalData as $key => $value) {
            if ($key !== 'email') {
                $params['fields'][$key] = $value;
            }
        }

        $params['fields'] = !empty($params['fields']) ? (object) $params['fields'] : [];

        return $params;
    }

    private static function handleDoubleOptIn($context, $auth_token, &$requestParams, $isMailerLiteV2)
    {
        if (empty($context->_actions->double_opt_in)) {
            return;
        }

        if ($isMailerLiteV2) {
            $requestParams['opted_in_at'] = gmdate('Y-m-d H:i:s');

            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized on next line
            if (isset($_SERVER['REMOTE_ADDR'])) {
                // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized below
                $remoteAddr = wp_unslash($_SERVER['REMOTE_ADDR']);
                $remoteAddr = sanitize_text_field($remoteAddr);

                $requestParams['optin_ip'] = $remoteAddr;
            }
        } else {
            $context->enableDoubleOptIn($auth_token);
        }
    }

    private static function sendToGroups($context, $groupIds, $requestParams, $isMailerLiteV2)
    {
        $response = null;

        if ($isMailerLiteV2) {
            $requestParams['groups'] = $groupIds;
            $endpoint = $context->_baseUrl . 'subscribers';
            $response = HttpHelper::post($endpoint, $requestParams, $context->_defaultHeader);
        } else {
            foreach ($groupIds as $groupId) {
                $endpoint = $context->_baseUrl . 'groups/' . $groupId . '/subscribers';
                $response = HttpHelper::post($endpoint, $requestParams, $context->_defaultHeader);
            }
        }

        return $response;
    }
}
