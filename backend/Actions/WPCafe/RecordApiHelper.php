<?php

/**
 * WPCafe Record Api
 */

namespace BitApps\Integrations\Actions\WPCafe;

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
        if (!class_exists('WpCafe\Init')) {
            return [
                'success' => false,
                'message' => __('WPCafe is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_reservation';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        // Route to appropriate action method
        switch ($mainAction) {
            case 'create_reservation':
                $response = Hooks::apply(Config::withPrefix('wpcafe_create_reservation'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_wpcafe_create_reservation` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_wpcafe_create_reservation', $response, $fieldData);
                $type = 'reservation';
                $actionType = 'create_reservation';

                break;

            case 'update_reservation':
                $response = Hooks::apply(Config::withPrefix('wpcafe_update_reservation'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_wpcafe_update_reservation` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_wpcafe_update_reservation', $response, $fieldData);
                $type = 'reservation';
                $actionType = 'update_reservation';

                break;

            case 'delete_reservation':
                $response = Hooks::apply(Config::withPrefix('wpcafe_delete_reservation'), $defaultResponse, $fieldData['reservation_id'] ?? 0);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_wpcafe_delete_reservation` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_wpcafe_delete_reservation', $response, $fieldData['reservation_id'] ?? 0);
                $type = 'reservation';
                $actionType = 'delete_reservation';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'WPCafe';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->wpcafeField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
