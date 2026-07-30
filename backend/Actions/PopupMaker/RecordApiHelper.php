<?php

/**
 * Popup Maker Record Api
 */

namespace BitApps\Integrations\Actions\PopupMaker;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Popup Maker record create, update, delete
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    /**
     * Execute the integration
     *
     * @param array $fieldValues Field values from trigger
     * @param array $fieldMap    Field mapping
     * @param array $utilities   Optional actions to perform
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!\defined('POPMAKE_VERSION')) {
            return [
                'success' => false,
                'message' => __('Popup Maker is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_popup';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_popup':
                $response = Hooks::apply(Config::withPrefix('popup_maker_create_popup'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'popup';
                $actionType = 'create_popup';

                break;

            case 'update_popup':
                $response = Hooks::apply(Config::withPrefix('popup_maker_update_popup'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'popup';
                $actionType = 'update_popup';

                break;

            case 'delete_popup':
                $response = Hooks::apply(Config::withPrefix('popup_maker_delete_popup'), $defaultResponse, $fieldData, $utilities);
                $type = 'popup';
                $actionType = 'delete_popup';

                break;

            case 'change_popup_status':
                $response = Hooks::apply(Config::withPrefix('popup_maker_change_popup_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'popup';
                $actionType = 'change_popup_status';

                break;

            case 'reset_popup_counts':
                $response = Hooks::apply(Config::withPrefix('popup_maker_reset_popup_counts'), $defaultResponse, $fieldData);
                $type = 'popup';
                $actionType = 'reset_popup_counts';

                break;

            case 'track_popup_event':
                $response = Hooks::apply(Config::withPrefix('popup_maker_track_popup_event'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'popup';
                $actionType = 'track_popup_event';

                break;

            case 'show_popup':
                $response = Hooks::apply(Config::withPrefix('popup_maker_show_popup'), $defaultResponse, $fieldData);
                $type = 'popup';
                $actionType = 'show_popup';

                break;

            case 'create_subscriber':
                $response = Hooks::apply(Config::withPrefix('popup_maker_create_subscriber'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'subscriber';
                $actionType = 'create_subscriber';

                break;

            case 'update_subscriber':
                $response = Hooks::apply(Config::withPrefix('popup_maker_update_subscriber'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'subscriber';
                $actionType = 'update_subscriber';

                break;

            case 'delete_subscriber':
                $response = Hooks::apply(Config::withPrefix('popup_maker_delete_subscriber'), $defaultResponse, $fieldData);
                $type = 'subscriber';
                $actionType = 'delete_subscriber';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'PopupMaker';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->popupMakerField;

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
