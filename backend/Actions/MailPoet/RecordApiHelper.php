<?php

/**
 * ZohoRecruit Record Api
 */

namespace BitApps\Integrations\Actions\MailPoet;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;
use Exception;

/**
 * Provide functionality for Record insert,upsert
 */
class RecordApiHelper
{
    private $_integrationID;

    private static $mailPoet_api;

    public function __construct($integId)
    {
        if (!class_exists(\MailPoet\API\API::class)) {
            return;
        }

        $this->_integrationID = $integId;
        static::$mailPoet_api = \MailPoet\API\API::MP('v1');
    }

    public function insertRecord($subscriber, $lists, $actions, $options = [])
    {
        try {
            // try to find if user is already a subscriber
            $existingSubscriber = static::$mailPoet_api->getSubscriber($subscriber['email']);

            if (!$existingSubscriber) {
                return static::addSubscriber($subscriber, $lists, $options);
            }

            if (!empty($actions->update)) {
                $response = Hooks::apply(Config::withPrefix('mailpoet_update_subscriber'), $existingSubscriber['id'], $subscriber);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_mailpoet_update_subscriber` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_mailpoet_update_subscriber', $response, $subscriber);

                if ($response === $existingSubscriber['id']) {
                    // translators: %s: Plugin name
                    $errorMessages = wp_sprintf(__('%s is not active or not installed', 'bit-integrations'), 'Bit Integrations Pro');
                } elseif (!$response['success']) {
                    $errorMessages = $response['message'];
                }

                if (isset($errorMessages)) {
                    return [
                        'success' => false,
                        'message' => $errorMessages,
                    ];
                }

                $newLists = static::getFilteredList($lists, $existingSubscriber['subscriptions']);
                if (!empty($newLists)) {
                    return static::addSubscribeToLists($existingSubscriber['id'], $newLists, $options);
                }
            }
        } catch (\MailPoet\API\MP\v1\APIException $e) {
            if ($e->getCode() == 4) {
                // Handle the case where the subscriber doesn't exist
                return static::addSubscriber($subscriber, $lists, $options);
            }

            return [
                'success' => false,
                'code'    => $e->getCode(),
                'message' => $e->getMessage()
            ];
        } catch (Exception $e) {
            // Handle other unexpected exceptions
            return [
                'success' => false,
                'code'    => $e->getCode(),
                'message' => $e->getMessage(),
            ];
        }
    }

    public function execute($fieldValues, $fieldMap, $lists, $actions)
    {
        if (!class_exists(\MailPoet\API\API::class)) {
            return;
        }

        $fieldData = static::setFieldMap($fieldMap, $fieldValues);
        $options = ['send_confirmation_email' => isset($actions->send_confirmation_email)];

        $recordApiResponse = $this->insertRecord($fieldData, $lists, $actions, $options);

        if ($recordApiResponse['success']) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'insert'], 'success', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'insert'], 'error', $recordApiResponse);
        }

        return $recordApiResponse;
    }

    private static function setFieldMap($fieldMap, $fieldValues)
    {
        $fieldData = [];

        foreach ($fieldMap as $fieldPair) {
            if (empty($fieldPair->mailPoetField)) {
                continue;
            }

            $fieldData[$fieldPair->mailPoetField] = ($fieldPair->formField == 'custom' && !empty($fieldPair->customValue))
                ? Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues)
                : $fieldValues[$fieldPair->formField];
        }

        return $fieldData;
    }

    private static function addSubscriber($subscriber, $lists, $options = [])
    {
        try {
            $subscriber = static::$mailPoet_api->addSubscriber($subscriber, $lists, $options);

            if (isset($subscriber['id']) && !empty($lists)) {
                return static::addSubscribeToLists($subscriber['id'], $lists, $options);
            }

            return [
                'success' => isset($subscriber['id']) ? true : false,
                'data'    => $subscriber,
            ];
        } catch (\MailPoet\API\MP\v1\APIException $e) {
            return [
                'success' => false,
                'code'    => $e->getCode(),
                'message' => $e->getMessage(),
            ];
        }
    }

    private static function addSubscribeToLists($subscriber_id, $lists, $options = [])
    {
        try {
            $subscriber = static::$mailPoet_api->subscribeToLists($subscriber_id, $lists, $options);

            return [
                'success' => true,
                'id'      => $subscriber['id'],
            ];
        } catch (\MailPoet\API\MP\v1\APIException $e) {
            return [
                'success' => false,
                'code'    => $e->getCode(),
                'message' => $e->getMessage(),
            ];
        }
    }

    private static function getFilteredList($listIds, $subscriptions)
    {
        $segmentIds = array_column($subscriptions, 'segment_id');

        return array_filter(
            $listIds,
            function ($listId) use ($segmentIds) {
                return !\in_array($listId, $segmentIds);
            }
        );
    }
}
