<?php

namespace BitApps\Integrations\Actions\BookingCalendar;

use WP_Error;

class BookingCalendarController
{
    public static function isExists()
    {
        if (!self::isPluginInstalled()) {
            wp_send_json_error(__('Booking Calendar is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function refreshBookings()
    {
        self::isExists();

        global $wpdb;

        $bookings = [];
        $table = self::resolveTable('booking');

        if (empty($table)) {
            wp_send_json_success(['bookings' => $bookings], 200);
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table name comes from the resolveTable() allowlist.
        $rows = $wpdb->get_results("SELECT booking_id, form FROM {$table} ORDER BY booking_id DESC LIMIT 500", ARRAY_A);

        foreach ((array) $rows as $row) {
            $bookingId = (int) ($row['booking_id'] ?? 0);

            if ($bookingId <= 0) {
                continue;
            }

            $label = '#' . $bookingId;
            $formFields = self::parseBookingForm((string) ($row['form'] ?? ''));

            if (!empty($formFields) && !empty($formFields[0]['value'])) {
                $label .= ' - ' . $formFields[0]['value'];
            }

            $bookings[] = (object) [
                'value' => (string) $bookingId,
                'label' => $label,
            ];
        }

        wp_send_json_success(['bookings' => $bookings], 200);
    }

    public static function refreshResources()
    {
        self::isExists();

        $resources = [];

        foreach (self::getAllBookingResources() as $resource) {
            $resourceId = (int) ($resource['booking_type_id'] ?? 1);
            $title = (string) ($resource['title'] ?? '#' . $resourceId);

            if (\function_exists('wpbc_lang')) {
                $title = wpbc_lang($title);
            }

            $resources[] = (object) [
                'value' => (string) $resourceId,
                'label' => $title,
            ];
        }

        wp_send_json_success(['resources' => $resources], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integDetails->field_map;
        $utilities = $integDetails->utilities ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }

    private static function isPluginInstalled()
    {
        return \defined('WP_BK_VERSION_NUM') || \defined('WPBC_FILE') || \function_exists('wpbc_api_booking_add_new');
    }

    private static function getAllBookingResources()
    {
        global $wpdb;

        if (\function_exists('wpbc_ajx_get_all_booking_resources_arr')) {
            $resources = wpbc_ajx_get_all_booking_resources_arr();

            if (!empty($resources)) {
                return array_values((array) $resources);
            }
        }

        $table = self::resolveTable('bookingtypes');

        if (!empty($table)) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table name comes from the resolveTable() allowlist.
            $rows = $wpdb->get_results("SELECT * FROM {$table} ORDER BY title ASC, booking_type_id ASC", ARRAY_A);

            if (!empty($rows)) {
                return array_values($rows);
            }
        }

        return [
            [
                'booking_type_id' => 1,
                'title'           => __('Default', 'bit-integrations'),
            ],
        ];
    }

    private static function parseBookingForm($formData)
    {
        $fields = [];

        foreach (explode('~', (string) $formData) as $field) {
            if ($field === '') {
                continue;
            }

            $parts = explode('^', $field, 3);

            if (\count($parts) < 3) {
                continue;
            }

            $fields[] = [
                'type'  => (string) $parts[0],
                'name'  => (string) $parts[1],
                'value' => (string) $parts[2],
            ];
        }

        return $fields;
    }

    private static function resolveTable($suffix)
    {
        global $wpdb;

        $tables = [
            'booking'      => 'booking',
            'bookingtypes' => 'bookingtypes',
        ];

        if (!isset($tables[(string) $suffix])) {
            return;
        }

        $table = $wpdb->prefix . $tables[(string) $suffix];

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $found = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($table)));

        if ($found !== $table) {
            return;
        }

        return $table;
    }
}
