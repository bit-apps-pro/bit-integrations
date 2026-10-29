<?php

namespace BitApps\Integrations\Actions\RestrictContent;

class RestrictContentHelper
{
    public static function pluginActive($option = null)
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        if (is_plugin_active('restrict-content-pro/restrict-content-pro.php')) {
            return $option === 'get_name' ? 'restrict-content-pro/restrictcontent-pro.php' : true;
        } elseif (is_plugin_active('restrict-content/restrictcontent.php')) {
            return $option === 'get_name' ? 'restrict-content/restrictcontent.php' : true;
        }

        return false;
    }

    public static function getAllLevels()
    {
        $levels = rcp_get_membership_levels(['number' => 999]);
        $data = [];
        if (!empty($levels)) {
            foreach ($levels as $level) {
                $data[] = (object) [
                    'id'   => $level->get_id(),
                    'name' => $level->get_name()
                ];
            }
            $response['levellists'] = $data;
        }
        wp_send_json_success($response, 200);
    }
}
