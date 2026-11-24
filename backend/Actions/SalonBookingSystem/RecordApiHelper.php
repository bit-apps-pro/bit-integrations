<?php

namespace BitApps\Integrations\Actions\SalonBookingSystem;

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
        if (!SalonBookingSystemController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('Salon Booking System is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        $type = 'booking';

        switch ($mainAction) {
            case 'create_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_create_booking'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_update_booking'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'change_booking_status':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_change_booking_status'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'send_booking_summary':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_send_booking_summary'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'trash_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_trash_booking'), $defaultResponse, $fieldData);

                break;

            case 'restore_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_restore_booking'), $defaultResponse, $fieldData);

                break;

            case 'delete_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_delete_booking'), $defaultResponse, $fieldData);

                break;

            case 'set_attendance_result':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_set_attendance_result'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'create_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_create_customer'), $defaultResponse, $fieldData, $utilities);

                break;

            case 'update_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_update_customer'), $defaultResponse, $fieldData);

                break;

            case 'delete_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_delete_customer'), $defaultResponse, $fieldData, $utilities);

                break;

            case 'create_service':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_create_service'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_service':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_update_service'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'trash_service':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_trash_service'), $defaultResponse, $fieldData);

                break;

            case 'create_service_category':
                $type = 'service category';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_create_service_category'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'create_assistant':
                $type = 'assistant';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_create_assistant'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_assistant':
                $type = 'assistant';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_update_assistant'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'trash_assistant':
                $type = 'assistant';
                $response = Hooks::apply(Config::withPrefix('salon_booking_system_trash_assistant'), $defaultResponse, $fieldData);

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ((array) $fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->salonBookingSystemField ?? '';

            if (empty($triggerValue) || empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
