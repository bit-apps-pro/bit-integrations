<?php

namespace BitApps\Integrations\Actions\BookingsAndAppointmentsForWoocommerce;

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
        if (!\defined('PH_BOOKINGS_PLUGIN_FILE')) {
            return ['success' => false, 'message' => __('Bookings and Appointments for WooCommerce is not installed or activated', 'bit-integrations')];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? '';
        $integrationDetails = $this->_integrationDetails;
        $default = ['success' => false, 'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')];

        switch ($mainAction) {
            case 'create_booking':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_create_booking'), $default, $fieldData, $integrationDetails);

                break;

            case 'update_booking_status':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_update_booking_status'), $default, $fieldData, $integrationDetails);

                break;

            case 'confirm_booking':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_confirm_booking'), $default, $fieldData);

                break;

            case 'cancel_booking':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_cancel_booking'), $default, $fieldData);

                break;

            case 'delete_booking':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_delete_booking'), $default, $fieldData);

                break;

            case 'reschedule_booking':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_reschedule_booking'), $default, $fieldData);

                break;

            case 'update_booking_notes':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_update_booking_notes'), $default, $fieldData);

                break;

            case 'update_booking_asset':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_update_booking_asset'), $default, $fieldData, $integrationDetails);

                break;

            case 'update_booking_participants':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_update_booking_participants'), $default, $fieldData);

                break;

            case 'send_booking_confirmation_email':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_send_booking_confirmation_email'), $default, $fieldData);

                break;

            case 'send_booking_cancelled_email':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_send_booking_cancelled_email'), $default, $fieldData);

                break;

            case 'send_booking_requires_confirmation_email':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_send_booking_requires_confirmation_email'), $default, $fieldData);

                break;

            case 'send_booking_updated_email':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_send_booking_updated_email'), $default, $fieldData, $integrationDetails);

                break;

            case 'send_booking_payment_email':
                $response = Hooks::apply(Config::withPrefix('bookings_and_appointments_for_woocommerce_send_booking_payment_email'), $default, $fieldData);

                break;

            default:
                $response = $default;

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'BookingsAndAppointmentsForWoocommerce', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $data = [];

        foreach ($fieldMap as $map) {
            if (!empty($map->formField) && !empty($map->bookingsAndAppointmentsForWoocommerceField)) {
                $data[$map->bookingsAndAppointmentsForWoocommerceField] = $map->formField === 'custom' && isset($map->customValue)
                    ? Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues)
                    : ($fieldValues[$map->formField] ?? '');
            }
        }

        return $data;
    }
}
