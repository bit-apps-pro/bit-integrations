<?php

/**
 * TheEventsCalendar Integration
 */

namespace BitApps\Integrations\Actions\TheEventsCalendar;

use BitApps\Integrations\Core\Util\Post;

class TheEventsCalendarHelper
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

        $events = Post::all(
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
}
