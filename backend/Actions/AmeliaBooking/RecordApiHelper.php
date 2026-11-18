<?php

namespace BitApps\Integrations\Actions\AmeliaBooking;

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
        if (!AmeliaBookingController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('Amelia is not active. Install and activate Amelia.', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $utilities = $this->_integrationDetails->utilities ?? [];
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        $type = 'amelia_booking';

        switch ($mainAction) {
            case 'create_appointment':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_create_appointment'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_appointment_status':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_appointment_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'reschedule_appointment':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_reschedule_appointment'), $defaultResponse, $fieldData);

                break;

            case 'update_appointment_note':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_appointment_note'), $defaultResponse, $fieldData);

                break;

            case 'delete_appointment':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_appointment'), $defaultResponse, $fieldData);

                break;

            case 'update_booking_status':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_booking_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'cancel_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_cancel_booking'), $defaultResponse, $fieldData);

                break;

            case 'delete_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_booking'), $defaultResponse, $fieldData);

                break;

            case 'create_event':
                $type = 'event';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_create_event'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_event_status':
                $type = 'event';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_event_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_event':
                $type = 'event';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_event'), $defaultResponse, $fieldData);

                break;

            case 'book_event':
                $type = 'event_booking';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_book_event'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_event_booking_status':
                $type = 'event_booking';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_event_booking_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'cancel_event_booking':
                $type = 'event_booking';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_cancel_event_booking'), $defaultResponse, $fieldData);

                break;

            case 'delete_event_booking':
                $type = 'event_booking';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_event_booking'), $defaultResponse, $fieldData);

                break;

            case 'create_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_create_customer'), $defaultResponse, $fieldData, $utilities);

                break;

            case 'update_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_customer'), $defaultResponse, $fieldData, $utilities);

                break;

            case 'delete_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_customer'), $defaultResponse, $fieldData);

                break;

            case 'create_employee':
                $type = 'employee';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_create_employee'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_employee_status':
                $type = 'employee';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_employee_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_employee':
                $type = 'employee';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_employee'), $defaultResponse, $fieldData);

                break;

            case 'create_service':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_create_service'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_service_status':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_service_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_service':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_service'), $defaultResponse, $fieldData);

                break;

            case 'create_category':
                $type = 'category';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_create_category'), $defaultResponse, $fieldData);

                break;

            case 'update_category':
                $type = 'category';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_category'), $defaultResponse, $fieldData);

                break;

            case 'delete_category':
                $type = 'category';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_category'), $defaultResponse, $fieldData);

                break;

            case 'add_payment':
                $type = 'payment';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_add_payment'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_payment':
                $type = 'payment';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_update_payment'), $defaultResponse, $fieldData, $utilities);

                break;

            case 'delete_payment':
                $type = 'payment';
                $response = Hooks::apply(Config::withPrefix('amelia_booking_delete_payment'), $defaultResponse, $fieldData);

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
            $actionValue = $item->ameliaBookingField ?? '';

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
