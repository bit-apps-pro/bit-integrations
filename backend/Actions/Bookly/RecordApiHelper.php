<?php

namespace BitApps\Integrations\Actions\Bookly;

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
        if (!class_exists('Bookly\Lib\Entities\Appointment')) {
            return [
                'success' => false,
                'message' => __('Bookly is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_appointment';

        $default = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_appointment':
                $response = Hooks::apply(Config::withPrefix('bookly_create_appointment'), $default, $fieldData, $utilities);
                $type = 'appointment';
                $actionType = 'create_appointment';

                break;

            case 'update_appointment_status':
                $response = Hooks::apply(Config::withPrefix('bookly_update_appointment_status'), $default, $fieldData, $utilities);
                $type = 'appointment';
                $actionType = 'update_appointment_status';

                break;

            case 'delete_appointment':
                $response = Hooks::apply(Config::withPrefix('bookly_delete_appointment'), $default, $fieldData);
                $type = 'appointment';
                $actionType = 'delete_appointment';

                break;

            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('bookly_create_customer'), $default, $fieldData);
                $type = 'customer';
                $actionType = 'create_customer';

                break;

            case 'update_customer':
                $response = Hooks::apply(Config::withPrefix('bookly_update_customer'), $default, $fieldData);
                $type = 'customer';
                $actionType = 'update_customer';

                break;

            case 'delete_customer':
                $response = Hooks::apply(Config::withPrefix('bookly_delete_customer'), $default, $fieldData);
                $type = 'customer';
                $actionType = 'delete_customer';

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
                $type = 'Bookly';
                $actionType = 'unknown';

                break;
        }

        $responseType = !is_wp_error($response) && isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->booklyField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
