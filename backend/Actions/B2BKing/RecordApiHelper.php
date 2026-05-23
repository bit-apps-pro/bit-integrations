<?php

namespace BitApps\Integrations\Actions\B2BKing;

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
        if (!\defined('B2BKINGCORE_DIR')) {
            return [
                'success' => false,
                'message' => __('B2BKing is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'approve_customer';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        $email = $fieldData['user_email'] ?? '';

        if (empty($email)) {
            $errorResponse = [
                'success' => false,
                'message' => __('User email is required', 'bit-integrations'),
            ];
            LogHandler::save($this->_integrationID, ['type' => 'B2BKing', 'type_name' => $mainAction], 'error', $errorResponse);

            return $errorResponse;
        }

        switch ($mainAction) {
            case 'update_customer_group':
                $groupId = isset($utilities->selected_group) ? $utilities->selected_group : '';
                $response = Hooks::apply(Config::withPrefix('b2bking_update_customer_group'), $defaultResponse, $email, $groupId);
                $actionType = 'update_customer_group';

                break;

            case 'approve_customer':
                $response = Hooks::apply(Config::withPrefix('b2bking_approve_customer'), $defaultResponse, $email);
                $actionType = 'approve_customer';

                break;

            case 'enable_b2b_for_user':
                $response = Hooks::apply(Config::withPrefix('b2bking_enable_b2b_for_user'), $defaultResponse, $email);
                $actionType = 'enable_b2b_for_user';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations'),
                ];
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'B2BKing', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->b2bKingField;

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
