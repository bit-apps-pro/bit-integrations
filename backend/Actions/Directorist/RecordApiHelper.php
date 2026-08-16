<?php

/**
 * Directorist Record Api
 */

namespace BitApps\Integrations\Actions\Directorist;

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
     * Execute the integration.
     *
     * @param array $fieldValues Field values from trigger
     * @param array $fieldMap    Field mapping
     * @param array $utilities   Optional actions to perform
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!\defined('ATBDP_VERSION')) {
            return [
                'success' => false,
                'message' => __('Directorist is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_listing';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_listing':
                $response = Hooks::apply(Config::withPrefix('directorist_create_listing'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'listing';
                $actionType = 'create_listing';

                break;

            case 'update_listing':
                $response = Hooks::apply(Config::withPrefix('directorist_update_listing'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'listing';
                $actionType = 'update_listing';

                break;

            case 'delete_listing':
                $response = Hooks::apply(Config::withPrefix('directorist_delete_listing'), $defaultResponse, $fieldData, $utilities);
                $type = 'listing';
                $actionType = 'delete_listing';

                break;

            case 'change_listing_status':
                $response = Hooks::apply(Config::withPrefix('directorist_change_listing_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'listing';
                $actionType = 'change_listing_status';

                break;

            case 'set_listing_featured':
                $response = Hooks::apply(Config::withPrefix('directorist_set_listing_featured'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'listing';
                $actionType = 'set_listing_featured';

                break;

            case 'set_listing_expiry':
                $response = Hooks::apply(Config::withPrefix('directorist_set_listing_expiry'), $defaultResponse, $fieldData, $utilities);
                $type = 'listing';
                $actionType = 'set_listing_expiry';

                break;

            case 'assign_listing_terms':
                $response = Hooks::apply(Config::withPrefix('directorist_assign_listing_terms'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'listing';
                $actionType = 'assign_listing_terms';

                break;

            case 'create_category':
                $response = Hooks::apply(Config::withPrefix('directorist_create_category'), $defaultResponse, $fieldData, $utilities);
                $type = 'taxonomy';
                $actionType = 'create_category';

                break;

            case 'create_location':
                $response = Hooks::apply(Config::withPrefix('directorist_create_location'), $defaultResponse, $fieldData, $utilities);
                $type = 'taxonomy';
                $actionType = 'create_location';

                break;

            case 'create_tag':
                $response = Hooks::apply(Config::withPrefix('directorist_create_tag'), $defaultResponse, $fieldData, $utilities);
                $type = 'taxonomy';
                $actionType = 'create_tag';

                break;

            case 'add_favorite_listing':
                $response = Hooks::apply(Config::withPrefix('directorist_add_favorite_listing'), $defaultResponse, $fieldData);
                $type = 'user';
                $actionType = 'add_favorite_listing';

                break;

            case 'remove_favorite_listing':
                $response = Hooks::apply(Config::withPrefix('directorist_remove_favorite_listing'), $defaultResponse, $fieldData);
                $type = 'user';
                $actionType = 'remove_favorite_listing';

                break;

            case 'update_user_profile':
                $response = Hooks::apply(Config::withPrefix('directorist_update_user_profile'), $defaultResponse, $fieldData);
                $type = 'user';
                $actionType = 'update_user_profile';

                break;

            case 'add_review':
                $response = Hooks::apply(Config::withPrefix('directorist_add_review'), $defaultResponse, $fieldData, $utilities);
                $type = 'review';
                $actionType = 'add_review';

                break;

            case 'delete_review':
                $response = Hooks::apply(Config::withPrefix('directorist_delete_review'), $defaultResponse, $fieldData, $utilities);
                $type = 'review';
                $actionType = 'delete_review';

                break;

            case 'update_order_status':
                $response = Hooks::apply(Config::withPrefix('directorist_update_order_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'order';
                $actionType = 'update_order_status';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'Directorist';
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
            $actionValue = $item->directoristField;

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
