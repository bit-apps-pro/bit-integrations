<?php

/**
 * FluentCart Record Api
 */

namespace BitApps\Integrations\Actions\FluentCart;

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
        if (!\defined('FLUENTCART_PLUGIN_PATH')) {
            return [
                'success' => false,
                'message' => __('FluentCart is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_order';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_order':
                $response = Hooks::apply(Config::withPrefix('fluentcart_create_order'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_create_order` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_create_order', $response, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'order';
                $actionType = 'create_order';

                break;

            case 'delete_order':
                $response = Hooks::apply(Config::withPrefix('fluentcart_delete_order'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_delete_order` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_delete_order', $response, $fieldData);
                $type = 'order';
                $actionType = 'delete_order';

                break;

            case 'update_order_status':
                $response = Hooks::apply(Config::withPrefix('fluentcart_update_order_status'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_update_order_status` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_update_order_status', $response, $fieldData);
                $type = 'order';
                $actionType = 'update_order_status';

                break;

            case 'update_payment_status':
                $response = Hooks::apply(Config::withPrefix('fluentcart_update_payment_status'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_update_payment_status` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_update_payment_status', $response, $fieldData);
                $type = 'order';
                $actionType = 'update_payment_status';

                break;

            case 'update_shipping_status':
                $response = Hooks::apply(Config::withPrefix('fluentcart_update_shipping_status'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_update_shipping_status` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_update_shipping_status', $response, $fieldData);
                $type = 'order';
                $actionType = 'update_shipping_status';

                break;

            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('fluentcart_create_customer'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_create_customer` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_create_customer', $response, $fieldData);
                $type = 'customer';
                $actionType = 'create_customer';

                break;

            case 'update_customer':
                $response = Hooks::apply(Config::withPrefix('fluentcart_update_customer'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_update_customer` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_update_customer', $response, $fieldData);
                $type = 'customer';
                $actionType = 'update_customer';

                break;

            case 'delete_customer':
                $response = Hooks::apply(Config::withPrefix('fluentcart_delete_customer'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_delete_customer` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_delete_customer', $response, $fieldData);
                $type = 'customer';
                $actionType = 'delete_customer';

                break;

            case 'create_product':
                $response = Hooks::apply(Config::withPrefix('fluentcart_create_product'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_create_product` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_create_product', $response, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'product';
                $actionType = 'create_product';

                break;

            case 'delete_product':
                $response = Hooks::apply(Config::withPrefix('fluentcart_delete_product'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_delete_product` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_delete_product', $response, $fieldData);
                $type = 'product';
                $actionType = 'delete_product';

                break;

            case 'create_coupon':
                $response = Hooks::apply(Config::withPrefix('fluentcart_create_coupon'), $defaultResponse, $fieldData, $this->_integrationDetails);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_create_coupon` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_create_coupon', $response, $fieldData, $this->_integrationDetails);
                $type = 'coupon';
                $actionType = 'create_coupon';

                break;

            case 'delete_coupon':
                $response = Hooks::apply(Config::withPrefix('fluentcart_delete_coupon'), $defaultResponse, $fieldData);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_fluentcart_delete_coupon` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_fluentcart_delete_coupon', $response, $fieldData);
                $type = 'coupon';
                $actionType = 'delete_coupon';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'FluentCart';
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
            $actionValue = $item->fluentCartField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue) ? Common::replaceFieldWithValue($item->customValue, $fieldValues) : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
