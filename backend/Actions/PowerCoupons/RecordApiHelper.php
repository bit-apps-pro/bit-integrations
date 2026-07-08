<?php

/**
 * Power Coupons Record Api
 */

namespace BitApps\Integrations\Actions\PowerCoupons;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Provide functionality for Power Coupons record create, update, delete.
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
     * Execute the integration.
     *
     * @param array $fieldValues Field values from trigger
     * @param array $fieldMap    Field mapping
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap)
    {
        if (!PowerCouponsController::isPluginInstalled()) {
            return [
                'success' => false,
                'message' => __('Power Coupons for WooCommerce is not installed or activated', 'bit-integrations')
            ];
        }

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_coupon';
        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $fieldData = static::applyUtilities(
            $fieldData,
            $this->_integrationDetails->utilities ?? [],
            $mainAction
        );

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        $hookMap = [
            'create_coupon'          => 'power_coupons_create_coupon',
            'update_coupon'          => 'power_coupons_update_coupon',
            'delete_coupon'          => 'power_coupons_delete_coupon',
            'toggle_auto_apply'      => 'power_coupons_toggle_auto_apply',
            'toggle_show_in_slideout' => 'power_coupons_toggle_show_in_slideout',
            'toggle_rules'           => 'power_coupons_toggle_rules',
        ];

        if (!isset($hookMap[$mainAction])) {
            $response = [
                'success' => false,
                'message' => __('Invalid action', 'bit-integrations')
            ];
        } else {
            $response = Hooks::apply(
                Config::withPrefix($hookMap[$mainAction]),
                $defaultResponse,
                $fieldData,
                $this->_integrationDetails
            );
        }

        if (is_wp_error($response)) {
            $response = [
                'success' => false,
                'message' => $response->get_error_message()
            ];
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'PowerCoupons', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            if (empty($item->powerCouponsField)) {
                continue;
            }

            $triggerValue = $item->formField ?? '';

            $dataFinal[$item->powerCouponsField] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }

    private static function applyUtilities(array $fieldData, $utilities, $mainAction)
    {
        $utilities = is_object($utilities) ? (array) $utilities : (array) $utilities;
        $actionUtilityFields = [
            'create_coupon'           => [
                'discount_type',
                'free_shipping',
                'individual_use',
                'exclude_sale_items',
                'auto_apply',
                'show_in_slideout',
                'rules_enabled',
            ],
            'update_coupon'           => [
                'discount_type',
                'free_shipping',
                'individual_use',
                'exclude_sale_items',
                'auto_apply',
                'show_in_slideout',
                'rules_enabled',
            ],
            'delete_coupon'           => ['permanent_delete'],
            'toggle_auto_apply'       => ['enabled'],
            'toggle_show_in_slideout' => ['enabled'],
            'toggle_rules'            => ['enabled'],
        ];

        if (!isset($actionUtilityFields[$mainAction])) {
            return $fieldData;
        }

        foreach ($actionUtilityFields[$mainAction] as $field) {
            if (!array_key_exists($field, $utilities)) {
                continue;
            }

            if ($mainAction === 'update_coupon' && ($utilities[$field] === '' || $utilities[$field] === null)) {
                continue;
            }

            $fieldData[$field] = $utilities[$field];
        }

        return $fieldData;
    }
}
