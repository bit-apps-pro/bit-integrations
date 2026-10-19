<?php

namespace BitApps\Integrations\Actions\ClickWhale;

class ClickWhaleHelper
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
}
