<?php

namespace BitApps\Integrations\Actions\BookingPress;

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

    public function execute($fieldValues, $fieldMap)
    {
        if (!class_exists('BookingPress')) {
            return [
                'success' => false,
                'message' => __('BookingPress is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'cancel_appointment';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'cancel_appointment':
                $response = Hooks::apply(Config::withPrefix('bookingpress_cancel_appointment'), $defaultResponse, $fieldData);
                $type = 'appointment';
                $actionType = 'cancel_appointment';

                break;

            case 'update_appointment_status':
                $response = Hooks::apply(Config::withPrefix('bookingpress_update_appointment_status'), $defaultResponse, $fieldData);
                $type = 'appointment';
                $actionType = 'update_appointment_status';

                break;

            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('bookingpress_create_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'create_customer';

                break;

            case 'update_customer':
                $response = Hooks::apply(Config::withPrefix('bookingpress_update_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'update_customer';

                break;

            case 'delete_appointment':
                $response = Hooks::apply(Config::withPrefix('bookingpress_delete_appointment'), $defaultResponse, $fieldData);
                $type = 'appointment';
                $actionType = 'delete_appointment';

                break;

            case 'delete_customer':
                $response = Hooks::apply(Config::withPrefix('bookingpress_delete_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'delete_customer';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations'),
                ];
                $type = 'BookingPress';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            if (empty($item->formField) || empty($item->bookingPressField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue = $item->bookingPressField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
