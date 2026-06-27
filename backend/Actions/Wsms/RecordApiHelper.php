<?php

/**
 * WSMS (WP SMS) Record Api
 */

namespace BitApps\Integrations\Actions\Wsms;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, update
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
     * @param array $fieldValues Field values from form
     * @param array $fieldMap    Field mapping
     * @param array $utilities   Actions to perform
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!\defined('WP_SMS_VERSION')) {
            return [
                'success' => false,
                'message' => __('WSMS (WP SMS) is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'send_sms';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        // Route to appropriate action method
        switch ($mainAction) {
            case 'send_sms':
                $response = Hooks::apply(Config::withPrefix('wsms_send_sms'), $defaultResponse, $fieldData);
                $type = 'sms';
                $actionType = 'send_sms';

                break;

            case 'add_subscriber':
                $response = Hooks::apply(Config::withPrefix('wsms_add_subscriber'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'subscriber';
                $actionType = 'add_subscriber';

                break;

            case 'update_subscriber':
                $response = Hooks::apply(Config::withPrefix('wsms_update_subscriber'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'subscriber';
                $actionType = 'update_subscriber';

                break;

            case 'delete_subscriber':
                $response = Hooks::apply(Config::withPrefix('wsms_delete_subscriber'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'subscriber';
                $actionType = 'delete_subscriber';

                break;

            case 'add_group':
                $response = Hooks::apply(Config::withPrefix('wsms_add_group'), $defaultResponse, $fieldData);
                $type = 'group';
                $actionType = 'add_group';

                break;

            case 'update_group':
                $response = Hooks::apply(Config::withPrefix('wsms_update_group'), $defaultResponse, $fieldData);
                $type = 'group';
                $actionType = 'update_group';

                break;

            case 'delete_group':
                $response = Hooks::apply(Config::withPrefix('wsms_delete_group'), $defaultResponse, $fieldData);
                $type = 'group';
                $actionType = 'delete_group';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'WSMS';
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
            $actionValue = $item->wsmsField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue) ? Common::replaceFieldWithValue($item->customValue, $fieldValues) : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
