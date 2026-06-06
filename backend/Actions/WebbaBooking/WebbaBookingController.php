<?php

/**
 * Webba Booking Integration
 */

namespace BitApps\Integrations\Actions\WebbaBooking;

use WBK_Location;
use WBK_Model_Utils;
use WBK_Service;
use WBK_Staff_Member;
use WP_Error;

/**
 * Provide functionality for Webba Booking integration
 */
class WebbaBookingController
{
    public static function isExists()
    {
        if (!class_exists('\WBK_Booking_Factory')) {
            wp_send_json_error(
                __(
                    'Webba Booking is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function webbaBookingAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshServices()
    {
        self::isExists();

        $services = [];

        if (class_exists('\WBK_Model_Utils') && class_exists('\WBK_Service')) {
            foreach (WBK_Model_Utils::get_service_ids() as $serviceId) {
                $service = new WBK_Service((int) $serviceId);

                if (!$service->is_loaded()) {
                    continue;
                }

                $services[] = (object) [
                    'value' => (int) $serviceId,
                    'label' => $service->get_name(),
                ];
            }
        }

        wp_send_json_success(['services' => $services], 200);
    }

    public function refreshStaff()
    {
        self::isExists();

        $staff = [];

        if (class_exists('\WBK_Model_Utils') && class_exists('\WBK_Staff_Member')) {
            foreach (WBK_Model_Utils::get_staff_member_ids() as $staffId) {
                $member = new WBK_Staff_Member((int) $staffId);

                if (!$member->is_loaded()) {
                    continue;
                }

                $staff[] = (object) [
                    'value' => (int) $staffId,
                    'label' => $member->get_name(),
                ];
            }
        }

        wp_send_json_success(['staff' => $staff], 200);
    }

    public function refreshCategories()
    {
        self::isExists();

        $categories = [];

        if (class_exists('\WBK_Model_Utils')) {
            foreach (WBK_Model_Utils::get_service_categories() as $categoryId => $name) {
                $categories[] = (object) [
                    'value' => (int) $categoryId,
                    'label' => $name,
                ];
            }
        }

        wp_send_json_success(['categories' => $categories], 200);
    }

    public function refreshLocations()
    {
        self::isExists();

        $locations = [];

        if (class_exists('\WBK_Model_Utils') && class_exists('\WBK_Location')) {
            foreach (WBK_Model_Utils::get_location_ids() as $locationId) {
                $location = new WBK_Location((int) $locationId);

                if (!$location->is_loaded()) {
                    continue;
                }

                $locations[] = (object) [
                    'value' => (int) $locationId,
                    'label' => $location->get_name(),
                ];
            }
        }

        wp_send_json_success(['locations' => $locations], 200);
    }

    public function refreshStatuses()
    {
        self::isExists();

        $statuses = [];

        if (class_exists('\WBK_Model_Utils')) {
            foreach (WBK_Model_Utils::get_booking_status_list() as $status => $label) {
                $statuses[] = (object) [
                    'value' => $status,
                    'label' => $label,
                ];
            }
        }

        wp_send_json_success(['statuses' => $statuses], 200);
    }

    public function refreshBookings()
    {
        self::isExists();

        global $wpdb;

        $bookings = [];
        $table = self::resolveTable('wbk_appointments');

        if ($table) {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- dropdown listing, table name validated by resolveTable()
            $rows = $wpdb->get_results("SELECT id, name FROM `{$table}` ORDER BY id DESC");

            foreach ($rows as $row) {
                $name = $row->name !== '' ? $row->name : __('Guest', 'bit-integrations');
                $bookings[] = (object) [
                    'value' => (int) $row->id,
                    'label' => '#' . $row->id . ' - ' . $name,
                ];
            }
        }

        wp_send_json_success(['bookings' => $bookings], 200);
    }

    public function refreshCoupons()
    {
        self::isExists();

        global $wpdb;

        $coupons = [];
        $table = self::resolveTable('wbk_coupons');

        if ($table) {
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- dropdown listing, table name validated by resolveTable()
            $rows = $wpdb->get_results("SELECT id, name FROM `{$table}` ORDER BY id DESC");

            foreach ($rows as $row) {
                $coupons[] = (object) [
                    'value' => (int) $row->id,
                    'label' => $row->name !== '' ? $row->name : '#' . $row->id,
                ];
            }
        }

        wp_send_json_success(['coupons' => $coupons], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    /**
     * Resolve a Webba table name by suffix and confirm it exists.
     *
     * @param string $suffix table suffix, e.g. 'wbk_appointments'
     *
     * @return null|string full table name when the table exists, null otherwise
     */
    private static function resolveTable($suffix)
    {
        global $wpdb;

        $table = get_option('wbk_db_prefix', '') . $suffix;

        if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($table))) !== $table) {
            return;
        }

        return $table;
    }
}
