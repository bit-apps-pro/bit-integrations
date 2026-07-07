<?php

/**
 * ModernCart Record Api
 */

namespace BitApps\Integrations\Actions\ModernCart;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for ModernCart actions
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

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!\defined('MODERNCART_VER') && !class_exists('\ModernCart\Plugin_Loader')) {
            return [
                'success' => false,
                'message' => __('Modern Cart is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'add_product_to_cart';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'add_product_to_cart':
                $response = Hooks::apply(Config::withPrefix('modern_cart_add_product_to_cart'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                break;

            case 'update_cart_quantity':
                $response = Hooks::apply(Config::withPrefix('modern_cart_update_cart_quantity'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                break;

            case 'remove_product_from_cart':
                $response = Hooks::apply(Config::withPrefix('modern_cart_remove_product_from_cart'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'modern_cart', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            if (empty($item->formField) || empty($item->modernCartField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue = $item->modernCartField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
