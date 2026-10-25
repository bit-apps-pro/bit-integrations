<?php

namespace BitApps\Integrations\Actions\WpHotelBooking;

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
        if (!WpHotelBookingController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('WP Hotel Booking is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_booking';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_booking':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_create_booking'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'booking';

                break;

            case 'update_booking_status':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_update_booking_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'booking';

                break;

            case 'update_booking_customer':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_update_booking_customer'), $defaultResponse, $fieldData, $utilities);
                $type = 'booking';

                break;

            case 'update_booking_note':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_update_booking_note'), $defaultResponse, $fieldData);
                $type = 'booking';

                break;

            case 'mark_payment_complete':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_mark_payment_complete'), $defaultResponse, $fieldData);
                $type = 'booking';

                break;

            case 'delete_booking':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_delete_booking'), $defaultResponse, $fieldData, $utilities);
                $type = 'booking';

                break;

            case 'add_room_to_booking':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_add_room_to_booking'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'booking_item';

                break;

            case 'remove_booking_item':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_remove_booking_item'), $defaultResponse, $fieldData);
                $type = 'booking_item';

                break;

            case 'create_coupon':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_create_coupon'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'coupon';

                break;

            case 'update_coupon':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_update_coupon'), $defaultResponse, $fieldData, $utilities);
                $type = 'coupon';

                break;

            case 'delete_coupon':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_delete_coupon'), $defaultResponse, $fieldData, $utilities);
                $type = 'coupon';

                break;

            case 'apply_coupon_to_booking':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_apply_coupon_to_booking'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'coupon';

                break;

            case 'remove_coupon_from_booking':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_remove_coupon_from_booking'), $defaultResponse, $fieldData);
                $type = 'coupon';

                break;

            case 'create_room':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_create_room'), $defaultResponse, $fieldData, $utilities);
                $type = 'room';

                break;

            case 'update_room':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_update_room'), $defaultResponse, $fieldData, $utilities);
                $type = 'room';

                break;

            case 'delete_room':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_delete_room'), $defaultResponse, $fieldData, $utilities);
                $type = 'room';

                break;

            case 'set_room_regular_price':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_set_room_regular_price'), $defaultResponse, $fieldData);
                $type = 'room_pricing';

                break;

            case 'add_seasonal_pricing_plan':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_add_seasonal_pricing_plan'), $defaultResponse, $fieldData);
                $type = 'room_pricing';

                break;

            case 'create_room_type':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_create_room_type'), $defaultResponse, $fieldData, $utilities);
                $type = 'room_type';

                break;

            case 'create_extra':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_create_extra'), $defaultResponse, $fieldData, $utilities);
                $type = 'extra';

                break;

            case 'update_extra':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_update_extra'), $defaultResponse, $fieldData, $utilities);
                $type = 'extra';

                break;

            case 'delete_extra':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_delete_extra'), $defaultResponse, $fieldData, $utilities);
                $type = 'extra';

                break;

            case 'assign_extras_to_room':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_assign_extras_to_room'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'extra';

                break;

            case 'add_room_review':
                $response = Hooks::apply(Config::withPrefix('wp_hotel_booking_add_room_review'), $defaultResponse, $fieldData, $utilities);
                $type = 'review';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'WpHotelBooking';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            if (empty($item->formField) || empty($item->wpHotelBookingField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue = $item->wpHotelBookingField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
