<?php

namespace BitApps\Integrations\Actions\BookingCalendar;

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
        if (!\defined('WP_BK_VERSION_NUM') && !\defined('WPBC_FILE') && !\function_exists('wpbc_api_booking_add_new')) {
            return [
                'success' => false,
                'message' => __('Booking Calendar is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_booking';
        $defaultResponse = [
            'success' => false,
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_booking':
                $response = Hooks::apply(Config::withPrefix('booking_calendar_create_booking'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'booking';
                $actionType = 'create_booking';

                break;

            case 'update_booking':
                $response = Hooks::apply(Config::withPrefix('booking_calendar_update_booking'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'booking';
                $actionType = 'update_booking';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'BookingCalendar';
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
            if (empty($item->bookingCalendarField)) {
                continue;
            }

            $triggerValue = $item->formField ?? '';
            $actionValue = $item->bookingCalendarField;
            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
