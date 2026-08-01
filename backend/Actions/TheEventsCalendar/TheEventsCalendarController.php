<?php

/**
 * TheEventsCalendar Integration
 */

namespace BitApps\Integrations\Actions\TheEventsCalendar;

use WP_Error;

/**
 * Provide functionality for TheEventsCalendar integration
 */
class TheEventsCalendarController
{
    public static function checkedTheEventsCalendarExists()
    {
        if (is_plugin_active('the-events-calendar/the-events-calendar.php') && is_plugin_active('event-tickets/event-tickets.php')) {
            return true;
        }

        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s are not active or installed!', 'bit-integrations'), 'The Events Calendar and/or Event Tickets'), 400);
    }

    public function getAllEvents()
    {
        self::checkedTheEventsCalendarExists();

        $events = get_posts(
            [
                'post_type'      => 'tribe_events',
                'orderby'        => 'title',
                'order'          => 'ASC',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
            ]
        );

        $eventList = [];

        if (!empty($events)) {
            foreach ($events as $event) {
                $eventList[] = (object) ['value' => (string) $event->ID, 'label' => $event->post_title];
            }
        }

        wp_send_json_success($eventList, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        self::checkedTheEventsCalendarExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $actions = (array) $integrationDetails->actions;
        $selectedEvent = $integrationDetails->selectedEvent;

        if (empty($fieldMap) || empty($selectedTask) || empty($selectedEvent)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task and event are required for The Events Calendar', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integId);
        $theEventsCalendarResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $selectedEvent, $actions);

        if (is_wp_error($theEventsCalendarResponse)) {
            return $theEventsCalendarResponse;
        }

        return $theEventsCalendarResponse;
    }
}
