<?php

namespace BitApps\Integrations\Actions\RoxAppointmentBooking;

class RoxAppointmentBookingHelper
{
    public static function isExists()
    {
        if (!\defined('ROX_APPOINTMENT_BOOKING_VERSION')) {
            wp_send_json_error(
                __(
                    'Rox Appointment Booking is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function roxAppointmentBookingAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshServices()
    {
        wp_send_json_success(['services' => self::optionsFrom('service', 'title')], 200);
    }

    public function refreshAgents()
    {
        self::isExists();

        global $wpdb;

        $table = self::table('agent');

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- dropdown listing off a plugin table; table name is built from fixed strings
        $rows = $wpdb->get_results("SELECT id, first_name, last_name, email FROM `{$table}` ORDER BY id DESC");

        $agents = array_map(
            function ($row) {
                return (object) [
                    'value' => (int) $row->id,
                    'label' => trim($row->first_name . ' ' . $row->last_name) . ' (' . $row->email . ')',
                ];
            },
            $rows ?: []
        );

        wp_send_json_success(['agents' => $agents], 200);
    }

    public function refreshCategories()
    {
        wp_send_json_success(['categories' => self::optionsFrom('category', 'title')], 200);
    }

    public function refreshLocations()
    {
        wp_send_json_success(['locations' => self::optionsFrom('location', 'title')], 200);
    }

    private static function optionsFrom($tableSuffix, $labelColumn)
    {
        self::isExists();

        global $wpdb;

        $table = self::table($tableSuffix);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- table and column are fixed strings from this class
        $rows = $wpdb->get_results("SELECT id, `{$labelColumn}` AS label FROM `{$table}` ORDER BY id DESC");

        return array_map(
            function ($row) {
                return (object) [
                    'value' => (int) $row->id,
                    'label' => $row->label !== '' ? $row->label : '#' . $row->id,
                ];
            },
            $rows ?: []
        );
    }

    private static function table($suffix)
    {
        global $wpdb;

        $dbPrefix = \defined('ROX_APPOINTMENT_BOOKING_DB_PREFIX') ? ROX_APPOINTMENT_BOOKING_DB_PREFIX : $wpdb->prefix;
        $pluginPrefix = \defined('ROX_APPOINTMENT_BOOKING_PREFIX') ? ROX_APPOINTMENT_BOOKING_PREFIX : 'rox_appointment';

        return $dbPrefix . $pluginPrefix . '_' . $suffix;
    }
}
