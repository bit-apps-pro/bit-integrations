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
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap)
    {
        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activates', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_or_update_subscriber':
                $response = Hooks::apply(Config::withPrefix('sender_create_or_update_subscriber'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_subscriber':
                $response = Hooks::apply(Config::withPrefix('sender_update_subscriber'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_subscriber':
                $response = Hooks::apply(Config::withPrefix('sender_delete_subscriber'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'remove_phone_from_subscriber':
                $response = Hooks::apply(Config::withPrefix('sender_remove_phone_from_subscriber'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'add_subscriber_to_group':
                $response = Hooks::apply(Config::withPrefix('sender_add_subscriber_to_group'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'remove_subscriber_from_group':
                $response = Hooks::apply(Config::withPrefix('sender_remove_subscriber_from_group'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'create_group':
                $response = Hooks::apply(Config::withPrefix('sender_create_group'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_group':
                $response = Hooks::apply(Config::withPrefix('sender_update_group'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_group':
                $response = Hooks::apply(Config::withPrefix('sender_delete_group'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations'),
                ];

                break;
        }

        $responseType = !is_wp_error($response) && isset($response['success']) && $response['success'] ? 'success' : 'error';
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
            $actionValue = $item->senderField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
