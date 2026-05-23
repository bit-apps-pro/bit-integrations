<?php

namespace BitApps\Integrations\Actions\Bookly;

use WP_Error;

class BooklyController
{
    public static function isExists()
    {
        if (!class_exists('Bookly\Lib\Entities\Appointment')) {
            wp_send_json_error(__('Bookly is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function booklyAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshStaff()
    {
        self::isExists();

        $staff = [];
        if (class_exists('Bookly\Lib\Entities\Staff')) {
            foreach (\Bookly\Lib\Entities\Staff::query()->find() as $member) {
                $staff[] = ['value' => (string) $member->getId(), 'label' => $member->getFullName()];
            }
        }

        wp_send_json_success(['staff' => $staff], 200);
    }

    public static function refreshServices()
    {
        self::isExists();

        $services = [];
        if (class_exists('Bookly\Lib\Entities\Service')) {
            foreach (\Bookly\Lib\Entities\Service::query()->find() as $service) {
                $services[] = ['value' => (string) $service->getId(), 'label' => $service->getTitle()];
            }
        }

        wp_send_json_success(['services' => $services], 200);
    }

    public static function refreshStatuses()
    {
        self::isExists();

        $statuses = [];
        if (class_exists('Bookly\Lib\Entities\CustomerAppointment')) {
            foreach (\Bookly\Lib\Entities\CustomerAppointment::getStatuses() as $status) {
                $statuses[] = [
                    'value' => $status,
                    'label' => \Bookly\Lib\Entities\CustomerAppointment::statusToString($status),
                ];
            }
        }

        wp_send_json_success(['statuses' => $statuses], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integDetails = $integrationData->flow_details;
        $integId      = $integrationData->id;
        $fieldMap     = $integDetails->field_map;
        $utilities    = $integDetails->utilities ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }
}
