<?php

/**
 * MoreConvert Wishlist Record Api
 */

namespace BitApps\Integrations\Actions\MoreConvertWishlist;

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
        if (!class_exists('WLFMC') || !class_exists('WLFMC_Wishlist_Factory')) {
            return [
                'success' => false,
                'message' => __('MoreConvert Wishlist for WooCommerce is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_wishlist';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        // Route to appropriate action method
        switch ($mainAction) {
            case 'create_wishlist':
                $response = Hooks::apply(Config::withPrefix('more_convert_wishlist_create_wishlist'), $defaultResponse, $fieldData, $utilities);
                $type = 'wishlist';
                $actionType = 'create_wishlist';

                break;

            case 'update_wishlist':
                $response = Hooks::apply(Config::withPrefix('more_convert_wishlist_update_wishlist'), $defaultResponse, $fieldData, $utilities);
                $type = 'wishlist';
                $actionType = 'update_wishlist';

                break;

            case 'delete_wishlist':
                $response = Hooks::apply(Config::withPrefix('more_convert_wishlist_delete_wishlist'), $defaultResponse, $fieldData);
                $type = 'wishlist';
                $actionType = 'delete_wishlist';

                break;

            case 'add_product_to_wishlist':
                $response = Hooks::apply(Config::withPrefix('more_convert_wishlist_add_product_to_wishlist'), $defaultResponse, $fieldData, $utilities);
                $type = 'wishlist';
                $actionType = 'add_product_to_wishlist';

                break;

            case 'remove_product_from_wishlist':
                $response = Hooks::apply(Config::withPrefix('more_convert_wishlist_remove_product_from_wishlist'), $defaultResponse, $fieldData, $utilities);
                $type = 'wishlist';
                $actionType = 'remove_product_from_wishlist';

                break;

            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('more_convert_wishlist_create_customer'), $defaultResponse, $fieldData, $utilities);
                $type = 'customer';
                $actionType = 'create_customer';

                break;

            case 'subscribe_customer':
                $response = Hooks::apply(Config::withPrefix('more_convert_wishlist_subscribe_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'subscribe_customer';

                break;

            case 'unsubscribe_customer':
                $response = Hooks::apply(Config::withPrefix('more_convert_wishlist_unsubscribe_customer'), $defaultResponse, $fieldData);
                $type = 'customer';
                $actionType = 'unsubscribe_customer';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'MoreConvertWishlist';
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
            $actionValue = $item->moreConvertWishlistField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue) ? Common::replaceFieldWithValue($item->customValue, $fieldValues) : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
