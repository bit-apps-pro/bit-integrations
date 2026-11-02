<?php

namespace BitApps\Integrations\Actions\RestaurantReservations;

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
        if (!RestaurantReservationsController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('Five Star Restaurant Reservations is not installed or activated', 'bit-integrations')
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
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_create_booking'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_booking':
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_update_booking'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'change_booking_status':
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_change_booking_status'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'assign_tables':
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_assign_tables'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'trash_booking':
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_trash_booking'), $defaultResponse, $fieldData);

                break;

            case 'restore_booking':
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_restore_booking'), $defaultResponse, $fieldData);

                break;

            case 'delete_booking':
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_delete_booking'), $defaultResponse, $fieldData);

                break;

            case 'delete_bookings_by_email':
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_delete_bookings_by_email'), $defaultResponse, $fieldData, $utilities);

                break;

            case 'send_email_to_customer':
                $type = 'email';
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_send_email_to_customer'), $defaultResponse, $fieldData);

                break;

            case 'ban_email':
                $type = 'ban';
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_ban_email'), $defaultResponse, $fieldData);

                break;

            case 'ban_ip_address':
                $type = 'ban';
                $response = Hooks::apply(Config::withPrefix('restaurant_reservations_ban_ip_address'), $defaultResponse, $fieldData);

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
            $actionValue = $item->restaurantReservationsField ?? '';

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
