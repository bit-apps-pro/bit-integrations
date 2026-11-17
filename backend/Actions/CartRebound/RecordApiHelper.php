<?php

namespace BitApps\Integrations\Actions\CartRebound;

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
        if (!CartReboundController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('Cart Rebound is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        $type = 'cart';

        switch ($mainAction) {
            case 'update_cart_status':
                $response = Hooks::apply(Config::withPrefix('cart_rebound_update_cart_status'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'mark_cart_recovered':
                $response = Hooks::apply(Config::withPrefix('cart_rebound_mark_cart_recovered'), $defaultResponse, $fieldData);

                break;

            case 'send_recovery_email':
                $type = 'email';
                $response = Hooks::apply(Config::withPrefix('cart_rebound_send_recovery_email'), $defaultResponse, $fieldData, $this->_integrationDetails);

                break;

            case 'delete_cart':
                $response = Hooks::apply(Config::withPrefix('cart_rebound_delete_cart'), $defaultResponse, $fieldData);

                break;

            case 'delete_carts':
                $response = Hooks::apply(Config::withPrefix('cart_rebound_delete_carts'), $defaultResponse, $fieldData);

                break;

            case 'create_template':
                $type = 'template';
                $response = Hooks::apply(Config::withPrefix('cart_rebound_create_template'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'update_template':
                $type = 'template';
                $response = Hooks::apply(Config::withPrefix('cart_rebound_update_template'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;

            case 'delete_template':
                $type = 'template';
                $response = Hooks::apply(Config::withPrefix('cart_rebound_delete_template'), $defaultResponse, $fieldData);

                break;

            case 'set_default_template':
                $type = 'template';
                $response = Hooks::apply(Config::withPrefix('cart_rebound_set_default_template'), $defaultResponse, $fieldData);

                break;

            case 'send_test_email':
                $type = 'email';
                $response = Hooks::apply(Config::withPrefix('cart_rebound_send_test_email'), $defaultResponse, $fieldData);

                break;

            case 'unsubscribe_email':
                $type = 'unsubscribe';
                $response = Hooks::apply(Config::withPrefix('cart_rebound_unsubscribe_email'), $defaultResponse, $fieldData);

                break;

            case 'resubscribe_email':
                $type = 'unsubscribe';
                $response = Hooks::apply(Config::withPrefix('cart_rebound_resubscribe_email'), $defaultResponse, $fieldData);

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ((array) $fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->cartReboundField ?? '';

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
