<?php

namespace BitApps\Integrations\Actions\Bookit;

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
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        if (!BookitController::isPluginActive()) {
            $response = [
                'success' => false,
                'message' => __('Bookit is not active. Install and activate Bookit.', 'bit-integrations')
            ];
            LogHandler::save($this->_integrationID, ['type' => 'Bookit', 'type_name' => $mainAction], 'error', $response);

            return $response;
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $defaultResponse = [
            'success' => false,
            // translators: %1$s: Plugin name
            'message' => wp_sprintf(__('%1$s is not active. Install and activate %1$s.', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_appointment':
                $response = Hooks::apply(Config::withPrefix('bookit_create_appointment'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'appointment';

                break;

            case 'update_appointment':
                $response = Hooks::apply(Config::withPrefix('bookit_update_appointment'), $defaultResponse, $fieldData, $utilities);
                $type = 'appointment';

                break;

            case 'change_appointment_status':
                $response = Hooks::apply(Config::withPrefix('bookit_change_appointment_status'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'appointment';

                break;

            case 'update_payment_status':
                $response = Hooks::apply(Config::withPrefix('bookit_update_payment_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'appointment';

                break;

            case 'delete_appointment':
                $response = Hooks::apply(Config::withPrefix('bookit_delete_appointment'), $defaultResponse, $fieldData, $utilities);
                $type = 'appointment';

                break;

            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('bookit_create_customer'), $defaultResponse, $fieldData, $utilities);
                $type = 'customer';

                break;

            case 'update_customer':
                $response = Hooks::apply(Config::withPrefix('bookit_update_customer'), $defaultResponse, $fieldData, $utilities);
                $type = 'customer';

                break;

            case 'delete_customer':
                $response = Hooks::apply(Config::withPrefix('bookit_delete_customer'), $defaultResponse, $fieldData);
                $type = 'customer';

                break;

            case 'create_staff':
                $response = Hooks::apply(Config::withPrefix('bookit_create_staff'), $defaultResponse, $fieldData, $utilities);
                $type = 'staff';

                break;

            case 'update_staff':
                $response = Hooks::apply(Config::withPrefix('bookit_update_staff'), $defaultResponse, $fieldData, $utilities);
                $type = 'staff';

                break;

            case 'delete_staff':
                $response = Hooks::apply(Config::withPrefix('bookit_delete_staff'), $defaultResponse, $fieldData);
                $type = 'staff';

                break;

            case 'assign_service_to_staff':
                $response = Hooks::apply(Config::withPrefix('bookit_assign_service_to_staff'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'staff';

                break;

            case 'remove_service_from_staff':
                $response = Hooks::apply(Config::withPrefix('bookit_remove_service_from_staff'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'staff';

                break;

            case 'update_staff_working_hours':
                $response = Hooks::apply(Config::withPrefix('bookit_update_staff_working_hours'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'staff';

                break;

            case 'create_service':
                $response = Hooks::apply(Config::withPrefix('bookit_create_service'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'service';

                break;

            case 'update_service':
                $response = Hooks::apply(Config::withPrefix('bookit_update_service'), $defaultResponse, $fieldData, $utilities);
                $type = 'service';

                break;

            case 'delete_service':
                $response = Hooks::apply(Config::withPrefix('bookit_delete_service'), $defaultResponse, $fieldData);
                $type = 'service';

                break;

            case 'create_category':
                $response = Hooks::apply(Config::withPrefix('bookit_create_category'), $defaultResponse, $fieldData);
                $type = 'category';

                break;

            case 'update_category':
                $response = Hooks::apply(Config::withPrefix('bookit_update_category'), $defaultResponse, $fieldData);
                $type = 'category';

                break;

            case 'delete_category':
                $response = Hooks::apply(Config::withPrefix('bookit_delete_category'), $defaultResponse, $fieldData);
                $type = 'category';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Action is not valid. Select an action from the list.', 'bit-integrations')
                ];
                $type = 'Bookit';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            if (empty($item->formField) || empty($item->bookitField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue = $item->bookitField;

            $value = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');

            $dataFinal[$actionValue] = \is_array($value) ? implode(', ', array_filter($value, 'is_scalar')) : $value;
        }

        return $dataFinal;
    }
}
