<?php

/**
 * ClickWhale Integration
 */

namespace BitApps\Integrations\Actions\ClickWhale;

use WP_Error;

class ClickWhaleController
{
    public static function isExists()
    {
        if (!\defined('CLICKWHALE_VERSION')) {
            wp_send_json_error(
                __(
                    'ClickWhale is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    /**
     * Users that can own a link.
     *
     * Not filtered by capability: ClickWhale registers its own admin menus under
     * 'read', so any logged-in user is a legitimate link owner and narrowing this
     * would hide valid choices. Only the three display fields are selected, so the
     * payload stays small even on a site with many users.
     */
    public function refreshAuthors()
    {
        self::isExists();

        $users = get_users(
            [
                'orderby' => 'display_name',
                'order'   => 'ASC',
                'fields'  => ['ID', 'display_name', 'user_login'],
            ]
        );

        $authors = array_map(
            function ($user) {
                return (object) [
                    'value' => $user->ID,
                    'label' => $user->display_name . ' (' . $user->user_login . ')',
                ];
            },
            $users
        );

        $response['authors'] = $authors;
        wp_send_json_success($response, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }
}
