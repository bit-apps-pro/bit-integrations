<?php

/**
 * Teams for WooCommerce Memberships Integration.
 */

namespace BitApps\Integrations\Actions\TeamsForWooCommerceMemberships;

class TeamsForWooCommerceMembershipsHelper
{
    public static function isExists()
    {
        if (!\function_exists('wc_memberships_for_teams')) {
            wp_send_json_error(
                __(
                    'Teams for WooCommerce Memberships is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshTeams()
    {
        self::isExists();

        $teams = [];

        if (\function_exists('wc_memberships_for_teams_get_teams')) {
            $args = [
                'post_status' => 'any',
                'per_page'    => -1,
            ];

            $allTeams = wc_memberships_for_teams_get_teams(null, $args);

            $teams = array_map(
                function ($team) {
                    return (object) [
                        'team_id'   => $team->get_id(),
                        'team_name' => $team->get_name()
                    ];
                },
                $allTeams
            );
        }

        $response['teams'] = $teams;
        wp_send_json_success($response, 200);
    }

    public function refreshMemberRoles()
    {
        self::isExists();

        $roles = [];

        if (\function_exists('wc_memberships_for_teams_get_team_member_roles')) {
            $allRoles = wc_memberships_for_teams_get_team_member_roles();

            foreach ($allRoles as $value => $label) {
                $roles[] = (object) [
                    'value' => $value,
                    'label' => $label
                ];
            }
        }

        $response['roles'] = $roles;
        wp_send_json_success($response, 200);
    }
}
