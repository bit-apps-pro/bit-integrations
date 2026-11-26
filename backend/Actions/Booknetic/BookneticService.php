<?php

namespace BitApps\Integrations\Actions\Booknetic;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;
use Throwable;

class BookneticService
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!class_exists('BookneticApp\Providers\Core\Bootstrap')) {
            return [
                'success' => false,
                'message' => __('Booknetic is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? '';
        $integrationDetails = $this->_integrationDetails;
        $default = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        try {
            switch ($mainAction) {
                case 'create_appointment':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_appointment'), $default, $fieldData, $utilities, $integrationDetails);

                    break;

                case 'update_appointment':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_appointment'), $default, $fieldData, $utilities);

                    break;

                case 'delete_appointment':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_appointment'), $default, $fieldData);

                    break;

                case 'reschedule_appointment':
                    $response = Hooks::apply(Config::withPrefix('booknetic_reschedule_appointment'), $default, $fieldData, $utilities);

                    break;

                case 'change_appointment_status':
                    $response = Hooks::apply(Config::withPrefix('booknetic_change_appointment_status'), $default, $fieldData, $integrationDetails);

                    break;

                case 'update_payment':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_payment'), $default, $fieldData, $integrationDetails);

                    break;

                case 'complete_payment':
                    $response = Hooks::apply(Config::withPrefix('booknetic_complete_payment'), $default, $fieldData);

                    break;

                case 'create_customer':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_customer'), $default, $fieldData, $utilities);

                    break;

                case 'update_customer':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_customer'), $default, $fieldData, $utilities);

                    break;

                case 'delete_customer':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_customer'), $default, $fieldData);

                    break;

                case 'assign_customer_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_assign_customer_category'), $default, $fieldData, $integrationDetails);

                    break;

                case 'create_staff':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_staff'), $default, $fieldData, $utilities, $integrationDetails);

                    break;

                case 'update_staff':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_staff'), $default, $fieldData, $utilities);

                    break;

                case 'delete_staff':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_staff'), $default, $fieldData);

                    break;

                case 'duplicate_staff':
                    $response = Hooks::apply(Config::withPrefix('booknetic_duplicate_staff'), $default, $fieldData);

                    break;

                case 'set_staff_status':
                    $response = Hooks::apply(Config::withPrefix('booknetic_set_staff_status'), $default, $fieldData, $integrationDetails);

                    break;

                case 'create_location':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_location'), $default, $fieldData, $utilities);

                    break;

                case 'update_location':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_location'), $default, $fieldData, $utilities);

                    break;

                case 'delete_location':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_location'), $default, $fieldData);

                    break;

                case 'duplicate_location':
                    $response = Hooks::apply(Config::withPrefix('booknetic_duplicate_location'), $default, $fieldData);

                    break;

                case 'set_location_status':
                    $response = Hooks::apply(Config::withPrefix('booknetic_set_location_status'), $default, $fieldData, $integrationDetails);

                    break;

                case 'create_service':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_service'), $default, $fieldData, $utilities, $integrationDetails);

                    break;

                case 'update_service':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_service'), $default, $fieldData, $utilities);

                    break;

                case 'delete_service':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_service'), $default, $fieldData);

                    break;

                case 'duplicate_service':
                    $response = Hooks::apply(Config::withPrefix('booknetic_duplicate_service'), $default, $fieldData);

                    break;

                case 'set_service_status':
                    $response = Hooks::apply(Config::withPrefix('booknetic_set_service_status'), $default, $fieldData, $integrationDetails);

                    break;

                case 'create_service_extra':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_service_extra'), $default, $fieldData, $utilities);

                    break;

                case 'update_service_extra':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_service_extra'), $default, $fieldData, $utilities);

                    break;

                case 'delete_service_extra':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_service_extra'), $default, $fieldData);

                    break;

                case 'duplicate_service_extra':
                    $response = Hooks::apply(Config::withPrefix('booknetic_duplicate_service_extra'), $default, $fieldData, $utilities);

                    break;

                case 'create_customer_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_customer_category'), $default, $fieldData, $utilities);

                    break;

                case 'update_customer_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_customer_category'), $default, $fieldData, $utilities);

                    break;

                case 'delete_customer_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_customer_category'), $default, $fieldData);

                    break;

                case 'create_location_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_location_category'), $default, $fieldData);

                    break;

                case 'update_location_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_location_category'), $default, $fieldData);

                    break;

                case 'delete_location_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_location_category'), $default, $fieldData);

                    break;

                case 'create_service_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_service_category'), $default, $fieldData, $utilities);

                    break;

                case 'update_service_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_update_service_category'), $default, $fieldData, $utilities);

                    break;

                case 'delete_service_category':
                    $response = Hooks::apply(Config::withPrefix('booknetic_delete_service_category'), $default, $fieldData);

                    break;

                case 'create_in_app_notification':
                    $response = Hooks::apply(Config::withPrefix('booknetic_create_in_app_notification'), $default, $fieldData, $integrationDetails);

                    break;

                default:
                    $response = [
                        'success' => false,
                        'message' => __('Invalid action', 'bit-integrations'),
                    ];

                    break;
            }
        } catch (Throwable $e) {
            $response = ['success' => false, 'message' => $e->getMessage()];
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Booknetic', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $data = [];

        foreach ($fieldMap as $map) {
            if (empty($map->formField) || empty($map->bookneticField)) {
                continue;
            }

            $data[$map->bookneticField] = $map->formField === 'custom'
                ? Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues)
                : ($fieldValues[$map->formField] ?? '');
        }

        return $data;
    }
}
