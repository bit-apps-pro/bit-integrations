<?php

namespace BitApps\Integrations\Actions\CustomAction;

use BitApps\Integrations\Core\Util\CustomFuncValidator;
use BitApps\Integrations\Log\LogHandler;
use Throwable;

class CustomActionAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integId = $integrationData->id;

        // funcFileLocation arrives inside flow_details (caller-supplied JSON), so file_exists()
        // alone would include any readable PHP on the box. Only ever run a file the plugin
        // itself wrote into the custom-function directory.
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
