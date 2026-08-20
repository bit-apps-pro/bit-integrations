<?php

/**
 * NinjaTables Record Api
 */

namespace BitApps\Integrations\Actions\NinjaTables;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const ACTION_ADD_ROW = 'add_row_in_table';

    private const ACTION_UPDATE_ROW = 'update_row_in_table';

    private const FILTER_ADD_ROW = 'ninjatables_add_row';

    private const FILTER_UPDATE_ROW = 'ninjatables_update_row';

    private const LOG_TYPE_ROW = 'row';

    private const LOG_TYPE_NINJA_TABLES = 'NinjaTables';

    private const LOG_ACTION_UNKNOWN = 'unknown';

    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap)
    {
        if (!$this->validateNinjaTables()) {
            return $this->getPluginNotInstalledResponse();
        }

        $fieldData = $this->prepareFieldData($fieldMap, $fieldValues);
        $mainAction = $this->getMainAction();
        $response = $this->executeAction($mainAction, $fieldData);

        $this->logResponse($mainAction, $response);

        return $response;
    }

    private function validateNinjaTables()
    {
        return \defined('NINJA_TABLES_VERSION');
    }

    private function getPluginNotInstalledResponse()
    {
        return [
            'success' => false,
            'message' => __('Ninja Tables is not installed or activated', 'bit-integrations')
        ];
    }

    private function prepareFieldData($fieldMap, $fieldValues)
    {
        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $this->addDropdownSelections($fieldData);
        $this->addRowFields($fieldData, $fieldMap, $fieldValues);

        return $fieldData;
    }

    private function addDropdownSelections(&$fieldData)
    {
        $fieldData['table_id'] = $this->_integrationDetails->selectedTable ?? '';
        $fieldData['row_id'] = $this->_integrationDetails->selectedRow ?? '';
        $fieldData['owner_id'] = $this->_integrationDetails->selectedUser ?? '';
    }

    private function addRowFields(&$fieldData, $fieldMap, $fieldValues)
    {
        if (empty($fieldMap) || !\is_array($fieldMap)) {
            return;
        }

        $rowFields = $this->processRowFields($fieldMap, $fieldValues);

        if (!empty($rowFields)) {
            $fieldData['row_fields'] = $rowFields;
        }
    }

    private function processRowFields($fieldMap, $fieldValues)
    {
        $rowFields = [];

        foreach ($fieldMap as $item) {
            if (empty($item->columnName)) {
                continue;
            }

            $columnValue = $this->getColumnValue($item, $fieldValues);
            $rowFields[$item->columnName] = $columnValue;
        }

        return $rowFields;
    }

    private function getColumnValue($item, $fieldValues)
    {
        if (!isset($item->formField)) {
            return '';
        }

        if ($this->isCustomField($item)) {
            return $this->getCustomFieldValue($item, $fieldValues);
        }

        return $fieldValues[$item->formField] ?? '';
    }

    private function isCustomField($item)
    {
        return $item->formField === 'custom' && isset($item->customValue);
    }

    private function getCustomFieldValue($item, $fieldValues)
    {
        return Common::replaceFieldWithValue($item->customValue, $fieldValues);
    }

    private function getMainAction()
    {
        return $this->_integrationDetails->mainAction ?? self::ACTION_ADD_ROW;
    }

    private function executeAction($action, $fieldData)
    {
        $defaultResponse = $this->getDefaultResponse();

        switch ($action) {
            case self::ACTION_ADD_ROW:
                return $this->executeAddRow($defaultResponse, $fieldData);

            case self::ACTION_UPDATE_ROW:
                return $this->executeUpdateRow($defaultResponse, $fieldData);

            default:
                return $this->getInvalidActionResponse();
        }
    }

    private function getDefaultResponse()
    {
        return [
            'success' => false,
            // translators: %s is the plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];
    }

    private function executeAddRow($defaultResponse, $fieldData)
    {
        return apply_filters(
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
            Config::withPrefix(self::FILTER_ADD_ROW),
            $defaultResponse,
            $fieldData
        );
    }

    private function executeUpdateRow($defaultResponse, $fieldData)
    {
        return apply_filters(
            // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
            Config::withPrefix(self::FILTER_UPDATE_ROW),
            $defaultResponse,
            $fieldData
        );
    }

    private function getInvalidActionResponse()
    {
        return [
            'success' => false,
            'message' => __('Invalid action', 'bit-integrations')
        ];
    }

    private function logResponse($action, $response)
    {
        $logData = $this->getLogData($action);
        $responseType = $this->getResponseType($response);

        LogHandler::save($this->_integrationID, $logData, $responseType, $response);
    }

    private function getLogData($action)
    {
        $type = $this->isValidAction($action) ? self::LOG_TYPE_ROW : self::LOG_TYPE_NINJA_TABLES;
        $actionType = $this->isValidAction($action) ? $action : self::LOG_ACTION_UNKNOWN;

        return [
            'type'      => $type,
            'type_name' => $actionType
        ];
    }

    private function isValidAction($action)
    {
        return \in_array(
            $action,
            [
                self::ACTION_ADD_ROW,
                self::ACTION_UPDATE_ROW
            ],
            true
        );
    }

    private function getResponseType($response)
    {
        return isset($response['success']) && $response['success'] ? 'success' : 'error';
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->columnName;

            if ($triggerValue === 'custom' && isset($value->customValue)) {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $fieldValues);
            } elseif (isset($fieldValues[$triggerValue]) && !\is_null($fieldValues[$triggerValue])) {
                $dataFinal[$actionValue] = $fieldValues[$triggerValue];
            }
        }

        return $dataFinal;
    }
}
