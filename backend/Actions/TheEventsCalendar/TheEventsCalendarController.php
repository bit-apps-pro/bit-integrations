<?php

/**
 * TheEventsCalendar Integration
 */

namespace BitApps\Integrations\Actions\TheEventsCalendar;

use BitApps\Integrations\Core\Util\Post;
use WP_Error;

class TheEventsCalendarController
{
    // TEC changes event queries to hide past events and to return occurrence IDs; these flags turn that off.
    private const EVENT_QUERY_ARGS = ['tec_events_ignore' => true, 'tribe_suppress_query_filters' => true];

    private const LISTED_POST_STATUSES = ['publish', 'future', 'draft', 'pending', 'private'];

    public static function checkedTheEventsCalendarExists()
    {
        if (is_plugin_active('the-events-calendar/the-events-calendar.php')) {
            return true;
        }

        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s is not active or installed!', 'bit-integrations'), 'The Events Calendar'), 400);
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
            ] + self::EVENT_QUERY_ARGS
        );

        $eventList = [];

        if (!empty($events)) {
            foreach ($events as $event) {
                $eventList[] = (object) ['value' => (string) $event->ID, 'label' => $event->post_title];
            }
        }

        wp_send_json_success($eventList, 200);
    }

    public function refreshEvents()
    {
        self::checkedTheEventsCalendarExists();

        $events = array_map(
            function ($event) {
                $startDate = get_post_meta($event->ID, '_EventStartDate', true);

                return (object) [
                    'value' => (string) $event->ID,
                    'label' => $startDate ? $event->post_title . ' (' . substr($startDate, 0, 10) . ')' : $event->post_title,
                ];
            },
            self::getPosts('tribe_events')
        );

        wp_send_json_success(['events' => $events], 200);
    }

    public function refreshVenues()
    {
        self::checkedTheEventsCalendarExists();

        wp_send_json_success(['venues' => self::getPostOptions('tribe_venue')], 200);
    }

    public function refreshOrganizers()
    {
        self::checkedTheEventsCalendarExists();

        wp_send_json_success(['organizers' => self::getPostOptions('tribe_organizer')], 200);
    }

    public function refreshSeries()
    {
        self::checkedTheEventsCalendarExists();

        if (!class_exists('Tribe__Events__Pro__Main')) {
            wp_send_json_error(__('The Events Calendar Pro is not active. Activate Pro to use series.', 'bit-integrations'), 400);
        }

        wp_send_json_success(['series' => self::getPostOptions('tribe_event_series')], 200);
    }

    public function refreshCategories()
    {
        self::checkedTheEventsCalendarExists();

        $terms = get_terms(['taxonomy' => 'tribe_events_cat', 'hide_empty' => false]);

        if (is_wp_error($terms)) {
            wp_send_json_error($terms->get_error_message(), 400);
        }

        $categories = array_map(
            function ($term) {
                return (object) ['value' => (string) $term->term_id, 'label' => $term->name];
            },
            $terms
        );

        wp_send_json_success(['categories' => $categories], 200);
    }

    public function refreshTimezones()
    {
        $timezones = array_map(
            function ($timezone) {
                return (object) ['value' => $timezone, 'label' => $timezone];
            },
            timezone_identifiers_list()
        );

        wp_send_json_success(['timezones' => $timezones], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask ?? '';
        $utilities = $integrationDetails->utilities ?? [];

        if (empty($fieldMap) || empty($selectedTask)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map and task are required for The Events Calendar', 'bit-integrations'));
        }

        if ($selectedTask === 'newAttendee' && empty($integrationDetails->selectedEvent)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task and event are required for The Events Calendar', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    private static function getPostOptions($postType)
    {
        return array_map(
            function ($post) {
                return (object) ['value' => (string) $post->ID, 'label' => $post->post_title];
            },
            self::getPosts($postType)
        );
    }

    private static function getPosts($postType)
    {
        return Post::all(['post_type' => $postType, 'post_status' => self::LISTED_POST_STATUSES] + self::EVENT_QUERY_ARGS);
    }
}
