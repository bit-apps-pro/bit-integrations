<?php

namespace BitApps\Integrations\Actions\WpActivityLog;

use WP_Error;
use WSAL\Controllers\Alert_Manager;

class WpActivityLogController
{
    private const NO_REQUIRED_FIELD_ACTIONS = ['log_event', 'delete_events'];

    private const AUTOMATIC_EVENT_DATA = [
        'ClientIP', 'OtherIPs', 'UserAgent', 'Username', 'CurrentUserID', 'CurrentUserRoles',
        'SessionID', 'Severity', 'Object', 'EventType', 'SiteID', 'SiteURL', 'Timestamp',
    ];

    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(
                __(
                    'WP Activity Log is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshEvents()
    {
        self::isExists();

        $deprecatedEvents = array_flip(Alert_Manager::get_deprecated_events());
        $events = [];

        foreach (Alert_Manager::get_alerts() as $eventId => $event) {
            if (isset($deprecatedEvents[$eventId])) {
                continue;
            }

            $events[] = (object) [
                'value' => (int) $eventId,
                'label' => $eventId . ' - ' . html_entity_decode($event['desc']),
            ];
        }

        usort(
            $events,
            function ($first, $second) {
                return $first->value <=> $second->value;
            }
        );

        wp_send_json_success(['events' => $events], 200);
    }

    public function refreshEventFields($requestParams)
    {
        self::isExists();

        $eventId = absint($requestParams->event_id ?? 0);
        $event = Alert_Manager::get_alerts()[$eventId] ?? null;

        if (!$event) {
            wp_send_json_error(__('The event is not registered in WP Activity Log. Select an event from the list.', 'bit-integrations'), 400);
        }

        $sources = [(string) $event['message']];

        foreach (['metadata', 'links'] as $key) {
            array_walk_recursive(
                $event[$key],
                function ($value) use (&$sources) {
                    $sources[] = (string) $value;
                }
            );
        }

        preg_match_all('/%([A-Za-z][A-Za-z0-9_]*)%/', implode(' ', $sources), $matches);

        $fields = [];

        foreach (array_unique($matches[1]) as $placeholder) {
            if (\in_array($placeholder, self::AUTOMATIC_EVENT_DATA, true)) {
                continue;
            }

            $fields[] = (object) [
                'key'      => $placeholder,
                'label'    => trim(preg_replace('/(?<!^)([A-Z][a-z])/', ' $1', str_replace('_', ' ', $placeholder))),
                'required' => false,
            ];
        }

        wp_send_json_success(['fields' => $fields], 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = array_map(
            function ($user) {
                return (object) [
                    'value' => (int) $user->ID,
                    'label' => $user->display_name . ' (' . $user->user_email . ')',
                ];
            },
            get_users(['fields' => ['ID', 'display_name', 'user_email']])
        );

        wp_send_json_success(['users' => $users], 200);
    }

    public function refreshObjects()
    {
        self::isExists();

        wp_send_json_success(['objects' => static::toOptions(Alert_Manager::get_event_objects_data())], 200);
    }

    public function refreshEventTypes()
    {
        self::isExists();

        wp_send_json_success(['eventTypes' => static::toOptions(Alert_Manager::get_event_type_data())], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];
        $mainAction = $integrationDetails->mainAction ?? '';

        if (empty($fieldMap) && !\in_array($mainAction, self::NO_REQUIRED_FIELD_ACTIONS, true)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    public static function isPluginActive()
    {
        return \defined('WSAL_VERSION') && class_exists(Alert_Manager::class);
    }

    private static function toOptions(array $items)
    {
        $options = [];

        foreach ($items as $value => $label) {
            $options[] = (object) ['value' => $value, 'label' => html_entity_decode($label)];
        }

        return $options;
    }
}
