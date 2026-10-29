<?php

namespace BitApps\Integrations\Actions\CustomAction;

use BitApps\Integrations\Core\Util\Capabilities;
use BitApps\Integrations\Core\Util\CustomFuncValidator;

class CustomActionHelper
{
    public static function functionValidateHandler($data)
    {
        if (!Capabilities::Check('manage_options')) {
            wp_send_json_error(__('Custom actions require administrator permissions.', 'bit-integrations'));

            return;
        }

        if (empty($data)) {
            wp_send_json_error(__('No function content provided.', 'bit-integrations'));

            return;
        }

        if (!CustomFuncValidator::loopbackValidateContent($data)) {
            return;
        }

        wp_send_json_success(__('No syntax errors detected in your function.', 'bit-integrations'));
    }
}
