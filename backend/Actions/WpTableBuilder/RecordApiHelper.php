<?php

/**
 * WP Table Builder Record Api
 */

namespace BitApps\Integrations\Actions\WpTableBuilder;

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
        if (!\defined('WPTB_PLUGIN_DIR')) {
            return [
                'success' => false,
                'message' => __('WP Table Builder is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_table':
                $response = Hooks::apply(Config::withPrefix('wptablebuilder_create_table'), $defaultResponse, $fieldData);
                $type = 'table';
                $actionType = 'create_table';

                break;

            case 'update_table':
                $response = Hooks::apply(Config::withPrefix('wptablebuilder_update_table'), $defaultResponse, $fieldData);
                $type = 'table';
                $actionType = 'update_table';

                break;

            case 'delete_table':
                $response = Hooks::apply(Config::withPrefix('wptablebuilder_delete_table'), $defaultResponse, $fieldData, $utilities);
                $type = 'table';
                $actionType = 'delete_table';

                break;

            case 'add_row':
                $response = Hooks::apply(Config::withPrefix('wptablebuilder_add_row'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'row';
                $actionType = 'add_row';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'WpTableBuilder';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->wpTableBuilderField ?? '';

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
