<?php

namespace BitApps\Integrations\Actions\EasyAppointments;

use WP_Error;

class EasyAppointmentsController
{
    private const LIST_LIMIT = 500;

    private const CUSTOMER_FIELD_SLUGS = ['name', 'email', 'phone', 'description'];

    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(__('Easy Appointments is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public function refreshLocations()
    {
        self::isExists();

        wp_send_json_success(['locations' => self::getNameOptions('ea_locations')], 200);
    }

    public function refreshServices()
    {
        self::isExists();

        wp_send_json_success(['services' => self::getNameOptions('ea_services')], 200);
    }

    public function refreshEmployees()
    {
        self::isExists();

        wp_send_json_success(['employees' => self::getNameOptions('ea_staff')], 200);
    }

    // The plugin's hourly cron deletes reservation rows older than 15 minutes, so actions do not offer that status.
    public function refreshStatuses()
    {
        self::isExists();

        $plugin = $GLOBALS['easy_ea_app'] ?? null;
        $labels = \is_object($plugin) && method_exists($plugin, 'get_container')
            ? (array) $plugin->get_container()['logic']->getStatus()
            : [];
        $statuses = [];

        foreach ($labels as $status => $label) {
            if ($status === 'reservation') {
                continue;
            }

            $statuses[] = (object) [
                'value' => $status,
                'label' => ucfirst($label),
            ];
        }

        wp_send_json_success(['statuses' => $statuses], 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = [];

        foreach (get_users(['orderby' => 'display_name', 'number' => self::LIST_LIMIT, 'fields' => ['ID', 'display_name', 'user_email']]) as $user) {
            $users[] = (object) [
                'value' => (int) $user->ID,
                'label' => \sprintf('%s (%s)', $user->display_name, $user->user_email),
            ];
        }

        wp_send_json_success(['users' => $users], 200);
    }

    public function refreshCustomFields()
    {
        self::isExists();

        global $wpdb;

        $fields = [];

        foreach ((array) $wpdb->get_results("SELECT slug, label FROM {$wpdb->prefix}ea_meta_fields ORDER BY position ASC") as $metaField) {
            if (\in_array($metaField->slug, self::CUSTOMER_FIELD_SLUGS, true)) {
                continue;
            }

            $fields[] = (object) [
                'key'   => 'ea_field_' . $metaField->slug,
                'label' => $metaField->label ?: $metaField->slug,
            ];
        }

        wp_send_json_success(['customFields' => $fields], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    public static function isPluginActive()
    {
        return \defined('EASY_APPOINTMENTS_VERSION') && class_exists('EADBModels');
    }

    private static function getNameOptions($table)
    {
        global $wpdb;

        $options = [];

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        foreach ((array) $wpdb->get_results("SELECT id, name FROM {$wpdb->prefix}{$table} ORDER BY name ASC") as $row) {
            $options[] = (object) [
                'value' => (int) $row->id,
                'label' => $row->name,
            ];
        }

        return $options;
    }
}
