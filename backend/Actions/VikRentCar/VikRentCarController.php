<?php

namespace BitApps\Integrations\Actions\VikRentCar;

use WP_Error;

class VikRentCarController
{
    public static function isExists()
    {
        if (!self::isPluginActive()) {
            wp_send_json_error(__('VikRentCar is not active. Install and activate VikRentCar.', 'bit-integrations'), 400);
        }
    }

    public function refreshCars()
    {
        self::isExists();

        wp_send_json_success(['cars' => self::getOptions('cars', 'name', 'name')], 200);
    }

    public function refreshLocations()
    {
        self::isExists();

        wp_send_json_success(['locations' => self::getOptions('places', 'name', 'ordering')], 200);
    }

    public function refreshCountries()
    {
        global $wpdb;

        self::isExists();

        $countriesTable = $wpdb->prefix . 'vikrentcar_countries';

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $countries = (array) $wpdb->get_results("SELECT country_3_code, country_name FROM {$countriesTable} ORDER BY country_name");

        wp_send_json_success(
            [
                'countries' => array_map(
                    static function ($country) {
                        return (object) ['value' => $country->country_3_code, 'label' => $country->country_name];
                    },
                    $countries
                ),
            ],
            200
        );
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

    public static function isPluginActive()
    {
        return \defined('VIKRENTCAR_SOFTWARE_VERSION');
    }

    private static function getOptions($table, $labelColumn, $orderColumn)
    {
        global $wpdb;

        $tableName = $wpdb->prefix . 'vikrentcar_' . $table;

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rows = (array) $wpdb->get_results("SELECT id, {$labelColumn} AS label FROM {$tableName} ORDER BY {$orderColumn}");

        return array_map(
            static function ($row) {
                return (object) ['value' => (string) $row->id, 'label' => $row->label];
            },
            $rows
        );
    }
}
