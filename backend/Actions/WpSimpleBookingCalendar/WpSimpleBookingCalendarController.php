<?php

/**
 * WP Simple Booking Calendar Integration
 */

namespace BitApps\Integrations\Actions\WpSimpleBookingCalendar;

use WP_Error;

class WpSimpleBookingCalendarController
{
    public static function isExists()
    {
        if (!self::isPluginActive()) {
            wp_send_json_error(
                __(
                    'WP Simple Booking Calendar is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function refreshCalendars()
    {
        self::isExists();

        $calendars = [];

        foreach ((array) wpsbc_get_calendars(['orderby' => 'name', 'order' => 'ASC']) as $calendar) {
            $calendars[] = (object) [
                'value' => (int) $calendar->get('id'),
                'label' => $calendar->get('name') . ' (#' . $calendar->get('id') . ')',
            ];
        }

        wp_send_json_success(['calendars' => $calendars], 200);
    }

    public static function refreshLegendItems($requestParams)
    {
        self::isExists();

        $calendarId = isset($requestParams->calendar_id) ? absint($requestParams->calendar_id) : 0;
        $calendarNames = [];
        $legendItems = [];

        // The plugin's list helper builds broken SQL without a calendar id, so
        // the "all" listing walks calendars one by one.
        $calendarIds = $calendarId > 0
            ? [$calendarId]
            : array_map(static fn ($calendar) => (int) $calendar->get('id'), (array) wpsbc_get_calendars());

        foreach ($calendarIds as $id) {
            foreach ((array) wpsbc_get_legend_items(['calendar_id' => $id]) as $legendItem) {
                if (!isset($calendarNames[$id])) {
                    $calendar = wpsbc_get_calendar($id);
                    $calendarNames[$id] = \is_object($calendar) ? $calendar->get('name') : '#' . $id;
                }

                $label = $calendarId > 0
                    ? $legendItem->get('name')
                    : $calendarNames[$id] . ' - ' . $legendItem->get('name');

                $legendItems[] = (object) [
                    'value' => (int) $legendItem->get('id'),
                    'label' => $label . ' (#' . $legendItem->get('id') . ')',
                ];
            }
        }

        wp_send_json_success(['legendItems' => $legendItems], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    public static function isPluginActive()
    {
        return \defined('WPSBC_VERSION') && \function_exists('wpsbc_get_calendar');
    }
}
