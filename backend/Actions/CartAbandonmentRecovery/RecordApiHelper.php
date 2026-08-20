<?php

namespace BitApps\Integrations\Actions\CartAbandonmentRecovery;

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
        if (!\defined('CARTFLOWS_CA_FILE')) {
            return [
                'success' => false,
                'message' => __('Cart Abandonment Recovery is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'delete_abandoned_cart';
        // translators: %s is the plugin name.
        $proMissingMessage = wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro');

        $defaultResponse = [
            'success' => false,
            'message' => $proMissingMessage
        ];

        switch ($mainAction) {
            case 'delete_abandoned_cart':
                $response = Hooks::apply(Config::withPrefix('cart_abandonment_recovery_delete_abandoned_cart'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $actionType = 'delete_abandoned_cart';

                break;

            case 'reschedule_recovery_emails':
                $response = Hooks::apply(Config::withPrefix('cart_abandonment_recovery_reschedule_recovery_emails'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $actionType = 'reschedule_recovery_emails';

                break;

            case 'update_cart_status':
                $response = Hooks::apply(Config::withPrefix('cart_abandonment_recovery_update_cart_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $actionType = 'update_cart_status';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $actionType = 'unknown';

                break;
        }

        $responseType = !empty($response['success']) ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'cart_abandonment_recovery', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $data = [];

        foreach ((array) $fieldMap as $map) {
            if (empty($map->formField) || empty($map->cartAbandonmentRecoveryField)) {
                continue;
            }

            $triggerValue = $map->formField;
            $actionValue = $map->cartAbandonmentRecoveryField;
            $data[$actionValue] = $triggerValue === 'custom' && isset($map->customValue)
                ? Common::replaceFieldWithValue($map->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $data;
    }
}
