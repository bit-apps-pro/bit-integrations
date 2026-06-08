<?php

namespace BitApps\Integrations\Actions\IvyForms;

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
        if (!class_exists('\IvyForms\Plugin\Plugin')) {
            return [
                'success' => false,
                'message' => __('IvyForms is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $formId = (int) ($this->_integrationDetails->formId ?? 0);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_entry';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_entry':
                $response = Hooks::apply(
                    Config::withPrefix('ivy_forms_create_entry'),
                    $defaultResponse,
                    $fieldData,
                    $formId
                );
                $actionType = 'create_entry';

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
                $actionType = 'unknown';

                break;
        }

        $responseType = (!is_wp_error($response) && isset($response['success']) && $response['success']) ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'IvyForms', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $data = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->ivyFormsField ?? '';

            if (empty($actionValue)) {
                continue;
            }

            $data[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $data;
    }
}
