<?php

namespace BitApps\Integrations\Actions\SliceWp;

class SliceWpHelper
{
    public static function pluginActive($option = null)
    {
        if (is_plugin_active('slicewp/index.php')) {
            return $option === 'get_name' ? 'slicewp/index.php' : true;
        }

        return false;
    }
}
