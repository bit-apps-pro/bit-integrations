<?php

namespace BitApps\Integrations\controller;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Capabilities;

final class UserController
{
    public function __construct()
    {
    }

    public function getWpUsers()
    {
        if (!(Capabilities::Check(Config::withPrefix('manage_integrations')))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }

        $users = get_users(['fields' => ['display_name', 'ID']]);

        wp_send_json_success($users);
    }

    public function getUserRoles()
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        global $wp_roles;
        $roles = [];
        $key = 0;
        foreach ($wp_roles->get_names() as $index => $role) {
            $key++;
            $roles[$key]['key'] = $index;
            $roles[$key]['name'] = $role;
        }
        wp_send_json_success($roles, 200);
    }
}
