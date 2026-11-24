<?php

namespace BitApps\Integrations\Actions\MotoPressHotelBooking;

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
        if (!MotoPressHotelBookingController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('MotoPress Hotel Booking is not installed or activated', 'bit-integrations')
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
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_create_booking'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'change_booking_status':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_change_booking_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_booking_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_update_booking_customer'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'add_booking_note':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_add_booking_note'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'trash_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_trash_booking'), $defaultResponse, $fieldData);

                break;

            case 'delete_booking':
                $type = 'booking';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_delete_booking'), $defaultResponse, $fieldData);

                break;

            case 'create_payment':
                $type = 'payment';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_create_payment'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'change_payment_status':
                $type = 'payment';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_change_payment_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'create_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_create_customer'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_update_customer'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_delete_customer'), $defaultResponse, $fieldData);

                break;

            case 'create_accommodation_type':
                $type = 'accommodation';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_create_accommodation_type'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'create_accommodation':
                $type = 'accommodation';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_create_accommodation'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'create_coupon':
                $type = 'coupon';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_create_coupon'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'block_dates':
                $type = 'booking rule';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_block_dates'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'remove_blocked_dates':
                $type = 'booking rule';
                $response = Hooks::apply(Config::withPrefix('motopress_hotel_booking_remove_blocked_dates'), $defaultResponse, $fieldData);

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
            $actionValue = $item->motoPressHotelBookingField ?? '';

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
