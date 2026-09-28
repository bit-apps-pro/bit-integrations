<?php

namespace BitApps\Integrations\Actions\GiveWp;

class GiveWpHelper
{
    public static function pluginActive($option = null)
    {
        if (is_plugin_active('give/give.php')) {
            return $option === 'get_name' ? 'give/give.php' : true;
        }

        return false;
    }
}
