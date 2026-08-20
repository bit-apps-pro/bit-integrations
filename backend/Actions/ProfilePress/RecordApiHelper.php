<?php

/**
 * ProfilePress Record Api
 */

namespace BitApps\Integrations\Actions\ProfilePress;

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
        if (!\defined('PPRESS_VERSION_NUMBER')) {
            return [
                'success' => false,
                'message' => __('ProfilePress is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        // No fallback action: both actions write, and add_or_update_customer provisions
        // WordPress accounts. A flow that lost its mainAction should fail loudly through
        // the default branch rather than silently create users.
        $mainAction = $this->_integrationDetails->mainAction ?? '';
        $integrationDetails = $this->_integrationDetails;

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'add_new_order':
                $response = Hooks::apply(Config::withPrefix('profilepress_add_new_order'), $defaultResponse, $fieldData, $utilities, $integrationDetails);
                $type = 'order';
                $actionType = 'add_new_order';

                break;

            case 'add_or_update_customer':
                $response = Hooks::apply(Config::withPrefix('profilepress_add_or_update_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'add_or_update_customer';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'ProfilePress';
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
            $triggerValue = $item->formField;
            $actionValue = $item->profilePressField;

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
