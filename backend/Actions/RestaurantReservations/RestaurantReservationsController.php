<?php

namespace BitApps\Integrations\Actions\RestaurantReservations;

use WP_Error;

class RestaurantReservationsController
{
    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(
                __(
                    'Five Star Restaurant Reservations is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshStatuses()
    {
        self::isExists();

        global $rtb_controller;

        $statuses = [];

        foreach ((array) ($rtb_controller->cpts->booking_statuses ?? []) as $status => $statusConfig) {
            $statuses[] = (object) [
                'value' => $status,
                'label' => $statusConfig['label'] ?? $status,
            ];
        }

        wp_send_json_success(['statuses' => $statuses], 200);
    }

    public function refreshLocations()
    {
        self::isExists();

        global $rtb_controller;

        $locations = [];

        if (!empty($rtb_controller->locations->post_type) && taxonomy_exists($rtb_controller->locations->location_taxonomy)) {
            foreach ($rtb_controller->locations->get_location_options() as $termId => $name) {
                $locations[] = (object) [
                    'value' => (int) $termId,
                    'label' => $name,
                ];
            }
        }

        wp_send_json_success(['locations' => $locations], 200);
    }

    public function refreshTables()
    {
        self::isExists();

        global $rtb_controller;

        $tables = [];

        if (empty($rtb_controller->settings)) {
            wp_send_json_success(['tables' => $tables], 200);
        }

        foreach ($rtb_controller->settings->get_form_table_options() as $tableNumber => $label) {
            if ($tableNumber === '' || $label === '') {
                continue;
            }

            $tables[] = (object) [
                'value' => (string) $tableNumber,
                'label' => $label,
            ];
        }

        wp_send_json_success(['tables' => $tables], 200);
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
        return \defined('RTB_VERSION') && class_exists('rtbBooking');
    }
}
