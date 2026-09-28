<?php

/**
 * WP ERP Integration
 */

namespace BitApps\Integrations\Actions\WpErp;

class WpErpHelper
{
    public static function isExists()
    {
        if (!\function_exists('erp_insert_people')) {
            wp_send_json_error(__('WP ERP is not activated or not installed', 'bit-integrations'), 400);
        }
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
}
