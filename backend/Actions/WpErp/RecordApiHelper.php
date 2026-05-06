<?php

/**
 * WP ERP Record Api
 */

namespace BitApps\Integrations\Actions\WpErp;

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
        if (!\function_exists('erp_insert_people')) {
            return [
                'success' => false,
                'message' => __('WP ERP is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        $hookMap = [
            'createContact'          => ['hook' => 'wperp_create_contact',           'type' => 'contact'],
            'updateContact'          => ['hook' => 'wperp_update_contact',           'type' => 'contact'],
            'createCompany'          => ['hook' => 'wperp_create_company',           'type' => 'company'],
            'updateCompany'          => ['hook' => 'wperp_update_company',           'type' => 'company'],
            'createContactGroup'     => ['hook' => 'wperp_create_contact_group',     'type' => 'contact_group'],
            'addContactToGroup'      => ['hook' => 'wperp_add_contact_to_group',     'type' => 'contact_group'],
            'removeContactFromGroup' => ['hook' => 'wperp_remove_contact_from_group', 'type' => 'contact_group'],
            'addNote'                => ['hook' => 'wperp_add_note',                 'type' => 'note'],
            'createTask'             => ['hook' => 'wperp_create_task',              'type' => 'task'],
            'createDepartment'       => ['hook' => 'wperp_create_department',        'type' => 'department'],
            'createDesignation'      => ['hook' => 'wperp_create_designation',       'type' => 'designation'],
            'createHoliday'          => ['hook' => 'wperp_create_holiday',           'type' => 'holiday'],
            'createExpense'          => ['hook' => 'wperp_create_expense',           'type' => 'expense'],
            'createPayment'          => ['hook' => 'wperp_create_payment',           'type' => 'payment'],
        ];

        if (!isset($hookMap[$mainAction])) {
            $response = [
                'success' => false,
                'message' => __('Invalid action', 'bit-integrations')
            ];
            $type = 'WpErp';
            $actionType = 'unknown';
        } else {
            $entry = $hookMap[$mainAction];
            $response = Hooks::apply(
                Config::withPrefix($entry['hook']),
                $defaultResponse,
                $fieldData,
                $utilities,
            );
            $type = $entry['type'];
            $actionType = $mainAction;
        }

        $responseType = (!is_wp_error($response) && isset($response['success']) && $response['success']) ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->wpErpField;

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
