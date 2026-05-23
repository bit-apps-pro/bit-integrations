<?php

/**
 * WP ERP Integration
 */

namespace BitApps\Integrations\Actions\WpErp;

use WP_Error;

class WpErpController
{
    public static function isExists()
    {
        if (!\function_exists('erp_insert_people')) {
            wp_send_json_error(__('WP ERP is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function wpErpAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshContactGroups()
    {
        self::isExists();

        $groups = [];

        if (\function_exists('erp_crm_get_contact_groups')) {
            $groups = array_map(
                function ($group) {
                    $group = (array) $group;

                    return (object) [
                        'value' => $group['id'] ?? '',
                        'label' => $group['name'] ?? '',
                    ];
                },
                (array) erp_crm_get_contact_groups(['number' => -1])
            );
        }

        wp_send_json_success(['groups' => $groups], 200);
    }

    public function refreshLifeStages()
    {
        self::isExists();

        $stages = [];

        if (\function_exists('erp_crm_get_life_stages_dropdown_raw')) {
            foreach ((array) erp_crm_get_life_stages_dropdown_raw() as $value => $label) {
                $stages[] = (object) ['value' => $value, 'label' => $label];
            }
        }

        wp_send_json_success(['stages' => $stages], 200);
    }

    public function refreshDepartments()
    {
        self::isExists();

        $out = [];

        if (\function_exists('erp_hr_get_departments')) {
            foreach ((array) erp_hr_get_departments(['number' => -1, 'no_object' => true]) as $dept) {
                $dept = (array) $dept;
                $out[] = (object) [
                    'value' => $dept['id'] ?? '',
                    'label' => $dept['title'] ?? '',
                ];
            }
        }

        wp_send_json_success(['departments' => $out], 200);
    }

    public function refreshDesignations()
    {
        self::isExists();

        $out = [];

        if (\function_exists('erp_hr_get_designations')) {
            foreach ((array) erp_hr_get_designations(['number' => -1, 'no_object' => true]) as $designation) {
                $designation = (array) $designation;
                $out[] = (object) [
                    'value' => $designation['id'] ?? '',
                    'label' => $designation['title'] ?? '',
                ];
            }
        }

        wp_send_json_success(['designations' => $out], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = $integrationDetails->utilities ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $wpErpResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($wpErpResponse)) {
            return $wpErpResponse;
        }

        return $wpErpResponse;
    }
}
