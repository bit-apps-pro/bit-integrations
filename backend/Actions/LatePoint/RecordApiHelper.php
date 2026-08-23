<?php

/**
 * LatePoint Record Api
 */

namespace BitApps\Integrations\Actions\LatePoint;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!class_exists('LatePoint')) {
            return [
                'success' => false,
                'message' => __('LatePoint is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_booking';
        $integrationDetails = $this->_integrationDetails;

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_booking':
                $response = Hooks::apply(Config::withPrefix('latepoint_create_booking'), $defaultResponse, $fieldData, $utilities, $integrationDetails);
                $type = 'booking';
                $actionType = 'create_booking';

                break;

            case 'update_booking':
                $response = Hooks::apply(Config::withPrefix('latepoint_update_booking'), $defaultResponse, $fieldData, $utilities, $integrationDetails);
                $type = 'booking';
                $actionType = 'update_booking';

                break;

            case 'cancel_booking':
                $response = Hooks::apply(Config::withPrefix('latepoint_cancel_booking'), $defaultResponse, $fieldData);
                $type = 'booking';
                $actionType = 'cancel_booking';

                break;

            case 'create_agent':
                $response = Hooks::apply(Config::withPrefix('latepoint_create_agent'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'agent';
                $actionType = 'create_agent';

                break;

            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('latepoint_create_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'create_customer';

                break;

            case 'create_order':
                $response = Hooks::apply(Config::withPrefix('latepoint_create_order'), $defaultResponse, $fieldData, $utilities, $integrationDetails);
                $type = 'order';
                $actionType = 'create_order';

                break;

            case 'create_coupon':
                $response = Hooks::apply(Config::withPrefix('latepoint_create_coupon'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'coupon';
                $actionType = 'create_coupon';

                break;

            case 'update_coupon':
                $response = Hooks::apply(Config::withPrefix('latepoint_update_coupon'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'coupon';
                $actionType = 'update_coupon';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'LatePoint';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->latePointField;

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
