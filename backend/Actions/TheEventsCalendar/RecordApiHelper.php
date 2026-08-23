<?php

/**
 * TheEventsCalendar Record Api
 */

namespace BitApps\Integrations\Actions\TheEventsCalendar;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use Tribe__Tickets__RSVP;
use Tribe__Tickets__Tickets_Handler;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integId)
    {
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

    public function execute($fieldValues, $fieldMap, $selectedTask, $selectedEvent, $actions)
    {
        if (isset($fieldMap[0]) && empty($fieldMap[0]->formField)) {
            $finalData = [];
        } else {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        }

        $type = $typeName = '';

        if ($selectedTask === 'newAttendee') {
            $response = $this->newAttendee($finalData, $selectedEvent);
            $type = 'Attendee';
            $typeName = 'Register New Attendee';
        }

        if ($response['success']) {
            $res = ['message' => $response['message']];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), 'error', wp_json_encode($response));
        }

        return $response;
    }
}
