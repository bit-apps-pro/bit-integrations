<?php

/**
 * Charitable Record Api
 */

namespace BitApps\Integrations\Actions\Charitable;

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
        if (!class_exists('Charitable')) {
            return [
                'success' => false,
                'message' => __('Charitable is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_donation';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_donation':
                $response = Hooks::apply(Config::withPrefix('charitable_create_donation'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'donation';
                $actionType = 'create_donation';

                break;

            case 'update_donation_status':
                $response = Hooks::apply(Config::withPrefix('charitable_update_donation_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'donation';
                $actionType = 'update_donation_status';

                break;

            case 'add_donation_note':
                $response = Hooks::apply(Config::withPrefix('charitable_add_donation_note'), $defaultResponse, $fieldData);
                $type = 'donation';
                $actionType = 'add_donation_note';

                break;

            case 'delete_donation':
                $response = Hooks::apply(Config::withPrefix('charitable_delete_donation'), $defaultResponse, $fieldData, $utilities);
                $type = 'donation';
                $actionType = 'delete_donation';

                break;

            case 'create_campaign':
                $response = Hooks::apply(Config::withPrefix('charitable_create_campaign'), $defaultResponse, $fieldData, $utilities);
                $type = 'campaign';
                $actionType = 'create_campaign';

                break;

            case 'update_campaign':
                $response = Hooks::apply(Config::withPrefix('charitable_update_campaign'), $defaultResponse, $fieldData, $utilities);
                $type = 'campaign';
                $actionType = 'update_campaign';

                break;

            case 'delete_campaign':
                $response = Hooks::apply(Config::withPrefix('charitable_delete_campaign'), $defaultResponse, $fieldData, $utilities);
                $type = 'campaign';
                $actionType = 'delete_campaign';

                break;

            case 'create_donor':
                $response = Hooks::apply(Config::withPrefix('charitable_create_donor'), $defaultResponse, $fieldData, $utilities);
                $type = 'donor';
                $actionType = 'create_donor';

                break;

            case 'update_donor':
                $response = Hooks::apply(Config::withPrefix('charitable_update_donor'), $defaultResponse, $fieldData, $utilities);
                $type = 'donor';
                $actionType = 'update_donor';

                break;

            case 'create_user_profile':
                $response = Hooks::apply(Config::withPrefix('charitable_create_user_profile'), $defaultResponse, $fieldData, $utilities);
                $type = 'user';
                $actionType = 'create_user_profile';

                break;

            case 'update_user_profile':
                $response = Hooks::apply(Config::withPrefix('charitable_update_user_profile'), $defaultResponse, $fieldData, $utilities);
                $type = 'user';
                $actionType = 'update_user_profile';

                break;

            case 'mark_user_verified':
                $response = Hooks::apply(Config::withPrefix('charitable_mark_user_verified'), $defaultResponse, $fieldData, $utilities);
                $type = 'user';
                $actionType = 'mark_user_verified';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'Charitable';
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
            $actionValue = $item->charitableField;

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
