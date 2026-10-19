<?php

namespace BitApps\Integrations\Actions\WishlistMember;

class WishlistMemberHelper
{
    public static function isPluginInstalled()
    {
        return class_exists('WLMAPI') || class_exists('WishListMember');
    }

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
}
