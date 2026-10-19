<?php

/**
 * WP Simple Booking Calendar Record Api
 */

namespace BitApps\Integrations\Actions\WpSimpleBookingCalendar;

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
        if (!WpSimpleBookingCalendarController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('WP Simple Booking Calendar is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $integrationDetails = $this->_integrationDetails;
        $mainAction = $integrationDetails->mainAction ?? 'create_calendar';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_calendar':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_create_calendar'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'calendar';

                break;

            case 'update_calendar':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_update_calendar'), $defaultResponse, $fieldData);
                $type = 'calendar';

                break;

            case 'trash_calendar':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_trash_calendar'), $defaultResponse, $fieldData);
                $type = 'calendar';

                break;

            case 'restore_calendar':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_restore_calendar'), $defaultResponse, $fieldData);
                $type = 'calendar';

                break;

            case 'delete_calendar':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_delete_calendar'), $defaultResponse, $fieldData);
                $type = 'calendar';

                break;

            case 'create_event':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_create_event'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'event';

                break;

            case 'book_date_range':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_book_date_range'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'event';

                break;

            case 'update_event':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_update_event'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'event';

                break;

            case 'delete_event':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_delete_event'), $defaultResponse, $fieldData);
                $type = 'event';

                break;

            case 'delete_event_by_date':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_delete_event_by_date'), $defaultResponse, $fieldData);
                $type = 'event';

                break;

            case 'create_legend_item':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_create_legend_item'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'legend_item';

                break;

            case 'update_legend_item':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_update_legend_item'), $defaultResponse, $fieldData);
                $type = 'legend_item';

                break;

            case 'delete_legend_item':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_delete_legend_item'), $defaultResponse, $fieldData);
                $type = 'legend_item';

                break;

            case 'set_default_legend_item':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_set_default_legend_item'), $defaultResponse, $fieldData);
                $type = 'legend_item';

                break;

            case 'set_legend_item_visibility':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_set_legend_item_visibility'), $defaultResponse, $fieldData, $integrationDetails);
                $type = 'legend_item';

                break;

            case 'update_calendar_meta':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_update_calendar_meta'), $defaultResponse, $fieldData);
                $type = 'meta';

                break;

            case 'update_event_meta':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_update_event_meta'), $defaultResponse, $fieldData);
                $type = 'meta';

                break;

            case 'update_legend_item_meta':
                $response = Hooks::apply(Config::withPrefix('wp_simple_booking_calendar_update_legend_item_meta'), $defaultResponse, $fieldData);
                $type = 'meta';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'WpSimpleBookingCalendar';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            if (empty($item->formField) || empty($item->wpSimpleBookingCalendarField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue = $item->wpSimpleBookingCalendarField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
