<?php

namespace BitApps\Integrations\Actions\AmeliaBooking;

use WP_Error;

class AmeliaBookingController
{
    public static function isPluginActive()
    {
        return \defined('AMELIA_PATH') && class_exists('\AmeliaBooking\Infrastructure\Common\Container');
    }

    public static function isExists()
    {
        if (!self::isPluginActive()) {
            wp_send_json_error(__('Amelia is not active. Install and activate Amelia.', 'bit-integrations'), 400);
        }
    }

    public static function refreshServices()
    {
        global $wpdb;

        self::isExists();

        $rows = $wpdb->get_results("SELECT id, name FROM {$wpdb->prefix}amelia_services ORDER BY id DESC");

        wp_send_json_success(['services' => self::toOptions($rows)], 200);
    }

    public static function refreshEmployees()
    {
        global $wpdb;

        self::isExists();

        $rows = $wpdb->get_results("SELECT id, CONCAT(firstName, ' ', lastName, ' (', email, ')') AS name FROM {$wpdb->prefix}amelia_users WHERE type = 'provider' ORDER BY id DESC");

        wp_send_json_success(['employees' => self::toOptions($rows)], 200);
    }

    public static function refreshLocations()
    {
        global $wpdb;

        self::isExists();

        $rows = $wpdb->get_results("SELECT id, name FROM {$wpdb->prefix}amelia_locations ORDER BY id DESC");

        wp_send_json_success(['locations' => self::toOptions($rows)], 200);
    }

    public static function refreshCategories()
    {
        global $wpdb;

        self::isExists();

        $rows = $wpdb->get_results("SELECT id, name FROM {$wpdb->prefix}amelia_categories ORDER BY id DESC");

        wp_send_json_success(['categories' => self::toOptions($rows)], 200);
    }

    public static function refreshEvents()
    {
        global $wpdb;

        self::isExists();

        $rows = $wpdb->get_results("SELECT id, name FROM {$wpdb->prefix}amelia_events ORDER BY id DESC");

        wp_send_json_success(['events' => self::toOptions($rows)], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    private static function toOptions($rows)
    {
        $options = [];

        foreach ((array) $rows as $row) {
            $options[] = (object) [
                'value' => (int) $row->id,
                'label' => '#' . $row->id . ' - ' . trim((string) $row->name),
            ];
        }

        return $options;
    }
}
