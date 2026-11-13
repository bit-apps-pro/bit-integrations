<?php

namespace BitApps\Integrations\Actions\VikRentCar;

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

        if (!VikRentCarController::isPluginActive()) {
            $response = [
                'success' => false,
                'message' => __('VikRentCar is not active. Install and activate VikRentCar.', 'bit-integrations')
            ];
            LogHandler::save($this->_integrationID, ['type' => 'VikRentCar', 'type_name' => $mainAction], 'error', $response);

            return $response;
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $defaultResponse = [
            'success' => false,
            // translators: %1$s: Plugin name
            'message' => wp_sprintf(__('%1$s is not active. Install and activate %1$s.', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_booking':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_create_booking'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'booking';

                break;

            case 'update_booking':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_update_booking'), $defaultResponse, $fieldData, $utilities);
                $type = 'booking';

                break;

            case 'confirm_booking':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_confirm_booking'), $defaultResponse, $fieldData, $utilities);
                $type = 'booking';

                break;

            case 'cancel_booking':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_cancel_booking'), $defaultResponse, $fieldData, $utilities);
                $type = 'booking';

                break;

            case 'delete_booking':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_delete_booking'), $defaultResponse, $fieldData);
                $type = 'booking';

                break;

            case 'update_rental_status':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_update_rental_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'booking';

                break;

            case 'send_booking_email':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_send_booking_email'), $defaultResponse, $fieldData, $utilities);
                $type = 'booking';

                break;

            case 'update_car':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_update_car'), $defaultResponse, $fieldData, $utilities);
                $type = 'car';

                break;

            case 'create_location':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_create_location'), $defaultResponse, $fieldData);
                $type = 'location';

                break;

            case 'update_location':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_update_location'), $defaultResponse, $fieldData);
                $type = 'location';

                break;

            case 'delete_location':
                $response = Hooks::apply(Config::withPrefix('vik_rent_car_delete_location'), $defaultResponse, $fieldData);
                $type = 'location';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Action is not valid. Select an action from the list.', 'bit-integrations')
                ];
                $type = 'VikRentCar';

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
            if (empty($item->formField) || empty($item->vikRentCarField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue = $item->vikRentCarField;

            $value = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');

            $dataFinal[$actionValue] = \is_array($value) ? implode(', ', array_filter($value, 'is_scalar')) : $value;
        }

        return $dataFinal;
    }
}
