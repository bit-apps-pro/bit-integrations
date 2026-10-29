<?php

namespace BitApps\Integrations\Actions\TheEventsCalendar;

use WP_Error;

class TheEventsCalendarAction
{
    public function execute($integrationData, $fieldValues)
    {
        TheEventsCalendarHelper::checkedTheEventsCalendarExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $actions = (array) $integrationDetails->actions;
        $selectedEvent = $integrationDetails->selectedEvent;

        if (empty($fieldMap) || empty($selectedTask) || empty($selectedEvent)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task and event are required for The Events Calendar', 'bit-integrations'));
        }

        $recordApiHelper = new TheEventsCalendarService($integId);
        $theEventsCalendarResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $selectedEvent, $actions);

        if (is_wp_error($theEventsCalendarResponse)) {
            return $theEventsCalendarResponse;
        }

        return $theEventsCalendarResponse;
    }
}
