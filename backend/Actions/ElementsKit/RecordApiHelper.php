<?php

namespace BitApps\Integrations\Actions\ElementsKit;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!class_exists('ElementsKit_Lite')) {
            return [
                'success' => false,
                'message' => __('ElementsKit is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_template';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_template':
                $response = Hooks::apply(Config::withPrefix('elements_kit_create_template'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'template';
                $actionType = 'create_template';

                break;

            case 'update_template':
                $response = Hooks::apply(Config::withPrefix('elements_kit_update_template'), $defaultResponse, $fieldData, $utilities);
                $type = 'template';
                $actionType = 'update_template';

                break;

            case 'update_template_activation':
                $response = Hooks::apply(Config::withPrefix('elements_kit_update_template_activation'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'template';
                $actionType = 'update_template_activation';

                break;

            case 'delete_template':
                $response = Hooks::apply(Config::withPrefix('elements_kit_delete_template'), $defaultResponse, $fieldData, $utilities);
                $type = 'template';
                $actionType = 'delete_template';

                break;

            case 'delete_widget':
                $response = Hooks::apply(Config::withPrefix('elements_kit_delete_widget'), $defaultResponse, $fieldData, $utilities);
                $type = 'widget';
                $actionType = 'delete_widget';

                break;

            case 'create_content':
                $response = Hooks::apply(Config::withPrefix('elements_kit_create_content'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'dynamic_content';
                $actionType = 'create_content';

                break;

            case 'update_content':
                $response = Hooks::apply(Config::withPrefix('elements_kit_update_content'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'dynamic_content';
                $actionType = 'update_content';

                break;

            case 'delete_content':
                $response = Hooks::apply(Config::withPrefix('elements_kit_delete_content'), $defaultResponse, $fieldData, $utilities);
                $type = 'dynamic_content';
                $actionType = 'delete_content';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'ElementsKit';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->elementsKitField;

            if (empty($triggerValue) || empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
