<?php

/**
 * SureMembers Integration
 */

namespace BitApps\Integrations\Actions\SureMembers;

use SureMembers\Inc\Access_Groups;

class SureMembersHelper
{
    public static function checkedSureMembersExists()
    {
        if (!is_plugin_active('suremembers/suremembers.php')) {
            wp_send_json_error(
                __(
                    'SureMembers Plugin is not active or not installed',
                    'bit-integrations'
                ),
                400
            );
        } else {
            return true;
        }
    }

    public function getGroups()
    {
        self::checkedSureMembersExists();

        $accessGroups = Access_Groups::get_active();

        if (empty($accessGroups)) {
            wp_send_json_error(
                __(
                    'No access groups found!',
                    'bit-integrations'
                ),
                400
            );
        }

        foreach ($accessGroups as $key => $accessGroup) {
            $groups[] = (object) ['label' => $accessGroup, 'value' => (string) $key];
        }

        wp_send_json_success($groups, 200);
    }
}
