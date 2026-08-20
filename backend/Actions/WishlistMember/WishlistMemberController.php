<?php

/**
 * Wishlist Member Integration
 */

namespace BitApps\Integrations\Actions\WishlistMember;

use WP_Error;

/**
 * Provide functionality for Wishlist Member integration
 */
class WishlistMemberController
{
    /**
     * Check if WishlistMember is installed.
     *
     * @return bool
     */
    public static function isPluginInstalled()
    {
        return class_exists('WLMAPI') || class_exists('WishListMember');
    }

    /**
     * Get wishlist levels
     */
    public function getLevels()
    {
        $allLevels = [];

        if (\function_exists('wlmapi_get_levels')) {
            $levels = wlmapi_get_levels();

            if (isset($levels['levels']['level'])) {
                $allLevels = array_map(
                    function ($level) {
                        return (object) [
                            'value' => $level['id'],
                            'label' => $level['name']
                        ];
                    },
                    $levels['levels']['level']
                );
            }
        }

        wp_send_json_success($allLevels, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $action = $integrationDetails->action;

        if (empty($fieldMap) || empty($action)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Wishlist Member'));
        }

        $recordApiHelper = new RecordApiHelper($integId, $integrationDetails);

        return $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $action
        );
    }
}
