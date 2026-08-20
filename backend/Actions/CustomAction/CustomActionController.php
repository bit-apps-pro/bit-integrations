<?php

namespace BitApps\Integrations\Actions\CustomAction;

use BitApps\Integrations\Core\Util\Capabilities;
use BitApps\Integrations\Core\Util\CustomFuncValidator;
use BitApps\Integrations\Log\LogHandler;
use Throwable;

class CustomActionController
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

    public function execute($integrationData, $fieldValues)
    {
        $integId = $integrationData->id;

        $funcFileLocation = CustomFuncValidator::resolveCustomFunctionFile(
            $integrationData->flow_details->funcFileLocation ?? ''
        );
        $isExits = $funcFileLocation !== '';
        $isSuccessfullyRun = true;
        $additionalData = null;

        ob_start();
        if ($isExits) {
            $trigger = (array) $fieldValues;

            try {
                include "{$funcFileLocation}";
            } catch (Throwable $th) {
                $isSuccessfullyRun = false;
                LogHandler::save($integId, $th->getMessage(), 'error', __('Custom action Failed', 'bit-integrations'));
            }
            $additionalData = ob_get_clean();
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => 'custom_action', 'type_name' => 'custom action']), 'error', wp_json_encode('Custom action file not found'));

            return;
        }
        if ($isSuccessfullyRun) {
            LogHandler::save($integId, wp_json_encode(['type' => 'custom_action', 'type_name' => 'custom action']), 'success', wp_json_encode('Custom action successfully run' . !empty($additionalData) ? wp_json_encode($additionalData) : ''));
        }

        return true;
    }
}
