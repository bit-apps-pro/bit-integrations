<?php

namespace BitApps\Integrations\Actions\TablePress;

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

    public function execute($fieldValues, $fieldMap)
    {
        if (!TablePressController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('TablePress is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        $type = 'table';

        switch ($mainAction) {
            case 'create_table':
                $response = Hooks::apply(Config::withPrefix('tablepress_create_table'), $defaultResponse, $fieldData);

                break;

            case 'update_table':
                $response = Hooks::apply(Config::withPrefix('tablepress_update_table'), $defaultResponse, $fieldData);

                break;

            case 'add_row':
                $type = 'row';
                $response = Hooks::apply(Config::withPrefix('tablepress_add_row'), $defaultResponse, $fieldData);

                break;

            case 'update_row':
                $type = 'row';
                $response = Hooks::apply(Config::withPrefix('tablepress_update_row'), $defaultResponse, $fieldData);

                break;

            case 'delete_row':
                $type = 'row';
                $response = Hooks::apply(Config::withPrefix('tablepress_delete_row'), $defaultResponse, $fieldData);

                break;

            case 'set_row_visibility':
                $type = 'row';
                $response = Hooks::apply(Config::withPrefix('tablepress_set_row_visibility'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'add_column':
                $type = 'column';
                $response = Hooks::apply(Config::withPrefix('tablepress_add_column'), $defaultResponse, $fieldData);

                break;

            case 'delete_column':
                $type = 'column';
                $response = Hooks::apply(Config::withPrefix('tablepress_delete_column'), $defaultResponse, $fieldData);

                break;

            case 'set_column_visibility':
                $type = 'column';
                $response = Hooks::apply(Config::withPrefix('tablepress_set_column_visibility'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'update_cell':
                $type = 'cell';
                $response = Hooks::apply(Config::withPrefix('tablepress_update_cell'), $defaultResponse, $fieldData);

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
            $actionValue = $item->tablePressField ?? '';

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
