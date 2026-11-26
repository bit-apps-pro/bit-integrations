<?php

namespace BitApps\Integrations\Actions\TheEventsCalendar;

use WP_Error;

class TheEventsCalendarAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask ?? '';
        $utilities = $integrationDetails->utilities ?? [];

        if (empty($selectedTask) || $selectedTask === 'newAttendee') {
            TheEventsCalendarHelper::checkedTheEventsCalendarExists();

            if (empty($fieldMap) || empty($selectedTask) || empty($integrationDetails->selectedEvent)) {
                return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task and event are required for The Events Calendar', 'bit-integrations'));
            }
        } elseif (empty($fieldMap)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Field map is required for The Events Calendar', 'bit-integrations'));
        }

        $recordApiHelper = new TheEventsCalendarService($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }
}
