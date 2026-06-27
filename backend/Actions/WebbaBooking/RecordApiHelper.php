<?php

/**
 * Webba Booking Record Api
 */

namespace BitApps\Integrations\Actions\WebbaBooking;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Webba Booking record create, update, delete
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

    /**
     * Execute the integration.
     *
     * @param array $fieldValues Field values from trigger
     * @param array $fieldMap    Field mapping
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap)
    {
        if (!class_exists('\WBK_Booking_Factory')) {
            return [
                'success' => false,
                'message' => __('Webba Booking Calendar is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_booking';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        $hookMap = [
            'create_booking'          => 'webba_booking_create_booking',
            'update_booking_status'   => 'webba_booking_update_status',
            'approve_booking'         => 'webba_booking_approve',
            'cancel_booking'          => 'webba_booking_cancel',
            'delete_booking'          => 'webba_booking_delete',
            'set_booking_as_paid'     => 'webba_booking_set_paid',
            'create_coupon'           => 'webba_booking_create_coupon',
            'update_coupon'           => 'webba_booking_update_coupon',
            'create_service'          => 'webba_booking_create_service',
            'update_service'          => 'webba_booking_update_service',
            'create_service_category' => 'webba_booking_create_category',
            'create_staff_member'     => 'webba_booking_create_staff',
            'create_location'         => 'webba_booking_create_location',
        ];

        if (!isset($hookMap[$mainAction])) {
            $response = [
                'success' => false,
                'message' => __('Invalid action', 'bit-integrations')
            ];
        } else {
            $response = Hooks::apply(
                Config::withPrefix($hookMap[$mainAction]),
                $defaultResponse,
                $fieldData,
                $this->_integrationDetails
            );
        }

        if (is_wp_error($response)) {
            $response = [
                'success' => false,
                'message' => $response->get_error_message()
            ];
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'WebbaBooking', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            if (empty($item->webbaBookingField)) {
                continue;
            }

            $triggerValue = $item->formField ?? '';

            $dataFinal[$item->webbaBookingField] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
