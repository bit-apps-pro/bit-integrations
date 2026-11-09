<?php

namespace BitApps\Integrations\Actions\EasyAppointments;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
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
        if (!EasyAppointmentsController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('Easy Appointments is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        $type = 'appointment';

        switch ($mainAction) {
            case 'create_appointment':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_create_appointment'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_appointment':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_update_appointment'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'change_appointment_status':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_change_appointment_status'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'cancel_appointment':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_cancel_appointment'), $defaultResponse, $fieldData, $utilities);

                break;

            case 'delete_appointment':
                $type = 'appointment';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_delete_appointment'), $defaultResponse, $fieldData);

                break;

            case 'create_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_create_customer'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_update_customer'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_customer':
                $type = 'customer';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_delete_customer'), $defaultResponse, $fieldData);

                break;

            case 'create_service':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_create_service'), $defaultResponse, $fieldData);

                break;

            case 'update_service':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_update_service'), $defaultResponse, $fieldData);

                break;

            case 'delete_service':
                $type = 'service';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_delete_service'), $defaultResponse, $fieldData);

                break;

            case 'create_location':
                $type = 'location';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_create_location'), $defaultResponse, $fieldData);

                break;

            case 'update_location':
                $type = 'location';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_update_location'), $defaultResponse, $fieldData);

                break;

            case 'delete_location':
                $type = 'location';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_delete_location'), $defaultResponse, $fieldData);

                break;

            case 'create_employee':
                $type = 'employee';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_create_employee'), $defaultResponse, $fieldData);

                break;

            case 'update_employee':
                $type = 'employee';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_update_employee'), $defaultResponse, $fieldData);

                break;

            case 'delete_employee':
                $type = 'employee';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_delete_employee'), $defaultResponse, $fieldData);

                break;

            case 'create_connection':
                $type = 'connection';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_create_connection'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_connection':
                $type = 'connection';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_update_connection'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_connection':
                $type = 'connection';
                $response = Hooks::apply(Config::withPrefix('easy_appointments_delete_connection'), $defaultResponse, $fieldData);

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ((array) $fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->easyAppointmentsField ?? '';

            if (empty($triggerValue) || empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
