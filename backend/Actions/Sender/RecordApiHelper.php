<?php

/**
 * Sender Record Api
 */

namespace BitApps\Integrations\Actions\Sender;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Build the request data from the field map and route each action to Bit Integrations Pro.
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID      = $integId;
    }

    public function execute($fieldValues, $fieldMap)
    {
        $fieldData  = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        $actionHookMap = [
            'create_or_update_subscriber'  => 'sender_create_or_update_subscriber',
            'update_subscriber'            => 'sender_update_subscriber',
            'delete_subscriber'            => 'sender_delete_subscriber',
            'remove_phone_from_subscriber' => 'sender_remove_phone_from_subscriber',
            'add_subscriber_to_group'      => 'sender_add_subscriber_to_group',
            'remove_subscriber_from_group' => 'sender_remove_subscriber_from_group',
            'create_group'                 => 'sender_create_group',
            'update_group'                 => 'sender_update_group',
            'delete_group'                 => 'sender_delete_group',
        ];

        if (!isset($actionHookMap[$mainAction])) {
            $response = [
                'success' => false,
                'message' => __('Invalid action', 'bit-integrations'),
            ];

            LogHandler::save($this->_integrationID, ['type' => 'Sender', 'type_name' => 'unknown'], 'error', $response);

            return $response;
        }

        $response = Hooks::apply(
            Config::withPrefix($actionHookMap[$mainAction]),
            $defaultResponse,
            $fieldData,
            $this->_integrationDetails
        );

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Sender', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            if (empty($item->senderField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue  = $item->senderField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
