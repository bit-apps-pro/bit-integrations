<?php

/**
 * Rox Appointment Booking Record Api
 */

namespace BitApps\Integrations\Actions\RoxAppointmentBooking;

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
        if (!\defined('ROX_APPOINTMENT_BOOKING_VERSION')) {
            return [
                'success' => false,
                'message' => __('Rox Appointment Booking is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_customer';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_create_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'create_customer';

                break;

            case 'update_customer':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'update_customer';

                break;

            case 'delete_customer':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_delete_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'delete_customer';

                break;

            case 'create_agent':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_create_agent'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'agent';
                $actionType = 'create_agent';

                break;

            case 'update_agent':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_agent'), $defaultResponse, $fieldData);
                $type = 'agent';
                $actionType = 'update_agent';

                break;

            case 'delete_agent':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_delete_agent'), $defaultResponse, $fieldData);
                $type = 'agent';
                $actionType = 'delete_agent';

                break;

            case 'create_service':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_create_service'), $defaultResponse, $fieldData, $utilities);
                $type = 'service';
                $actionType = 'create_service';

                break;

            case 'update_service':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_service'), $defaultResponse, $fieldData);
                $type = 'service';
                $actionType = 'update_service';

                break;

            case 'update_service_status':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_service_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'service';
                $actionType = 'update_service_status';

                break;

            case 'delete_service':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_delete_service'), $defaultResponse, $fieldData);
                $type = 'service';
                $actionType = 'delete_service';

                break;

            case 'create_category':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_create_category'), $defaultResponse, $fieldData);
                $type = 'category';
                $actionType = 'create_category';

                break;

            case 'update_category':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_category'), $defaultResponse, $fieldData);
                $type = 'category';
                $actionType = 'update_category';

                break;

            case 'delete_category':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_delete_category'), $defaultResponse, $fieldData);
                $type = 'category';
                $actionType = 'delete_category';

                break;

            case 'create_appointment':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_create_appointment'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'appointment';
                $actionType = 'create_appointment';

                break;

            case 'update_appointment':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_appointment'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'appointment';
                $actionType = 'update_appointment';

                break;

            case 'update_appointment_status':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_appointment_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'appointment';
                $actionType = 'update_appointment_status';

                break;

            case 'delete_appointment':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_delete_appointment'), $defaultResponse, $fieldData);
                $type = 'appointment';
                $actionType = 'delete_appointment';

                break;

            case 'create_order':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_create_order'), $defaultResponse, $fieldData, $utilities);
                $type = 'order';
                $actionType = 'create_order';

                break;

            case 'update_order':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_order'), $defaultResponse, $fieldData);
                $type = 'order';
                $actionType = 'update_order';

                break;

            case 'update_order_status':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_order_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'order';
                $actionType = 'update_order_status';

                break;

            case 'refund_order':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_refund_order'), $defaultResponse, $fieldData);
                $type = 'order';
                $actionType = 'refund_order';

                break;

            case 'delete_order':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_delete_order'), $defaultResponse, $fieldData);
                $type = 'order';
                $actionType = 'delete_order';

                break;

            case 'create_payment':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_create_payment'), $defaultResponse, $fieldData, $utilities);
                $type = 'payment';
                $actionType = 'create_payment';

                break;

            case 'update_payment_status':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_update_payment_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'payment';
                $actionType = 'update_payment_status';

                break;

            case 'create_notification':
                $response = Hooks::apply(Config::withPrefix('rox_appointment_booking_create_notification'), $defaultResponse, $fieldData, $utilities);
                $type = 'notification';
                $actionType = 'create_notification';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'RoxAppointmentBooking';
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
            $actionValue = $item->roxAppointmentBookingField;

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
