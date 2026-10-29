<?php

/**
 * TheEventsCalendar Record Api
 */

namespace BitApps\Integrations\Actions\TheEventsCalendar;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;
use Tribe__Tickets__RSVP;
use Tribe__Tickets__Tickets_Handler;

class RecordApiHelper
{
    private const PRO_TASK_TYPES = [
        'create_event'           => 'Event',
        'update_event'           => 'Event',
        'delete_event'           => 'Event',
        'update_event_status'    => 'Event',
        'duplicate_event'        => 'Event',
        'create_recurring_event' => 'Event',
        'create_venue'           => 'Venue',
        'update_venue'           => 'Venue',
        'delete_venue'           => 'Venue',
        'create_organizer'       => 'Organizer',
        'update_organizer'       => 'Organizer',
        'delete_organizer'       => 'Organizer',
        'create_event_category'  => 'Event Category',
        'create_series'          => 'Series',
        'add_event_to_series'    => 'Series',
    ];

    private const TASK_CONFIG_SETTINGS = [
        'update_event_status'    => ['eventStatus' => 'event_status'],
        'create_recurring_event' => ['frequency' => 'frequency', 'recurrenceEnd' => 'recurrence_end'],
        'add_event_to_series'    => ['seriesId' => 'series_id'],
    ];

    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function newAttendee($finalData, $selectedEvent)
    {
        if (empty($selectedEvent) || empty($finalData['name']) || empty($finalData['email']) || empty($finalData['number_of_guests'])) {
            return ['success' => false, 'message' => __('Request parameter(s) empty!', 'bit-integrations'), 'code' => 400];
        }

        if (!class_exists('Tribe__Tickets__Main') || !class_exists('Tribe__Events__Main')) {
            return ['success' => false, 'message' => __('The Events Calendar or Event Tickets plugin not installed!', 'bit-integrations'), 'code' => 400];
        }

        if (!is_numeric($finalData['number_of_guests'])) {
            return ['success' => false, 'message' => __('Number of Guests should be a numeric value.', 'bit-integrations'), 'code' => 400];
        }

        $ticketHandler = new Tribe__Tickets__Tickets_Handler();
        $getRSVPTickets = $ticketHandler->get_event_rsvp_tickets(get_post($selectedEvent));

        if (empty($getRSVPTickets)) {
            return ['success' => false, 'message' => __('No RSVP tickets found.', 'bit-integrations'), 'code' => 400];
        }

        $ticketId = 0;

        foreach ($getRSVPTickets as $rsvpTicket) {
            if ($rsvpTicket->capacity < 0) {
                $ticketId = $rsvpTicket->ID;
            } elseif ($rsvpTicket->capacity > 0 && $rsvpTicket->capacity > $rsvpTicket->qty_sold && $rsvpTicket->stock >= $finalData['number_of_guests']) {
                $ticketId = $rsvpTicket->ID;
            }

            if ($ticketId > 0) {
                break;
            }
        }

        if ($ticketId === 0) {
            return ['success' => false, 'message' => __('No capacity available for new attendee!', 'bit-integrations'), 'code' => 400];
        }

        $attendeeDetails = [
            'full_name'    => $finalData['name'],
            'email'        => $finalData['email'],
            'order_status' => 'yes',
            'optout'       => false,
            'order_id'     => '-1',
        ];

        $order = new Tribe__Tickets__RSVP();

        $generateTicket = $order->generate_tickets_for($ticketId, $finalData['number_of_guests'], $attendeeDetails);

        if ($generateTicket) {
            return ['success' => true, 'message' => __('New attendee registered successfully.', 'bit-integrations')];
        }

        return ['success' => false, 'message' => __('Failed to register new attendee!', 'bit-integrations'), 'code' => 400];
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->theEventsCalendarField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (isset($fieldMap[0]) && empty($fieldMap[0]->formField)) {
            $finalData = [];
        } else {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        }

        $selectedTask = $this->_integrationDetails->selectedTask;

        if ($selectedTask === 'newAttendee') {
            $response = $this->newAttendee($finalData, $this->_integrationDetails->selectedEvent);
            $type = 'Attendee';
            $typeName = 'Register New Attendee';

            if ($response['success']) {
                $res = ['message' => $response['message']];
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), 'success', wp_json_encode($res));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), 'error', wp_json_encode($response));
            }

            return $response;
        }

        $response = $this->runProTask($selectedTask, $finalData, $this->settings($selectedTask, $utilities));
        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';

        LogHandler::save($this->_integrationID, ['type' => self::PRO_TASK_TYPES[$selectedTask] ?? 'The Events Calendar', 'type_name' => $selectedTask], $responseType, $response);

        return $response;
    }

    private function runProTask($selectedTask, $fieldData, $settings)
    {
        if (!class_exists('Tribe__Events__Main')) {
            return ['success' => false, 'message' => __('The Events Calendar is not activated or not installed', 'bit-integrations')];
        }

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($selectedTask) {
            case 'create_event':
                return Hooks::apply(Config::withPrefix('the_events_calendar_create_event'), $defaultResponse, $fieldData, $settings);

            case 'update_event':
                return Hooks::apply(Config::withPrefix('the_events_calendar_update_event'), $defaultResponse, $fieldData, $settings);

            case 'delete_event':
                return Hooks::apply(Config::withPrefix('the_events_calendar_delete_event'), $defaultResponse, $fieldData, $settings);

            case 'update_event_status':
                return Hooks::apply(Config::withPrefix('the_events_calendar_update_event_status'), $defaultResponse, $fieldData, $settings);

            case 'duplicate_event':
                return Hooks::apply(Config::withPrefix('the_events_calendar_duplicate_event'), $defaultResponse, $fieldData, $settings);

            case 'create_recurring_event':
                return Hooks::apply(Config::withPrefix('the_events_calendar_create_recurring_event'), $defaultResponse, $fieldData, $settings);

            case 'create_venue':
                return Hooks::apply(Config::withPrefix('the_events_calendar_create_venue'), $defaultResponse, $fieldData, $settings);

            case 'update_venue':
                return Hooks::apply(Config::withPrefix('the_events_calendar_update_venue'), $defaultResponse, $fieldData, $settings);

            case 'delete_venue':
                return Hooks::apply(Config::withPrefix('the_events_calendar_delete_venue'), $defaultResponse, $fieldData, $settings);

            case 'create_organizer':
                return Hooks::apply(Config::withPrefix('the_events_calendar_create_organizer'), $defaultResponse, $fieldData, $settings);

            case 'update_organizer':
                return Hooks::apply(Config::withPrefix('the_events_calendar_update_organizer'), $defaultResponse, $fieldData, $settings);

            case 'delete_organizer':
                return Hooks::apply(Config::withPrefix('the_events_calendar_delete_organizer'), $defaultResponse, $fieldData, $settings);

            case 'create_event_category':
                return Hooks::apply(Config::withPrefix('the_events_calendar_create_event_category'), $defaultResponse, $fieldData, $settings);

            case 'create_series':
                return Hooks::apply(Config::withPrefix('the_events_calendar_create_series'), $defaultResponse, $fieldData, $settings);

            case 'add_event_to_series':
                return Hooks::apply(Config::withPrefix('the_events_calendar_add_event_to_series'), $defaultResponse, $fieldData, $settings);

            default:
                return ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
        }
    }

    private function settings($selectedTask, $utilities)
    {
        $settings = [];

        foreach (self::TASK_CONFIG_SETTINGS[$selectedTask] ?? [] as $confKey => $settingKey) {
            if (isset($this->_integrationDetails->{$confKey}) && $this->_integrationDetails->{$confKey} !== '') {
                $settings[$settingKey] = $this->_integrationDetails->{$confKey};
            }
        }

        foreach ((array) $utilities as $key => $value) {
            if (strpos($key, 'selected_') === 0 && $value !== '' && $value !== null) {
                $settings[substr($key, \strlen('selected_'))] = $value;
            }
        }

        return $settings;
    }
}
