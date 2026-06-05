<?php

/**
 * Secure Custom Fields Record Api
 */

namespace BitApps\Integrations\Actions\SecureCustomFields;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Secure Custom Fields field update actions.
 *
 * Free only dispatches the action through a filter; the actual work is done in
 * Bit Integrations Pro (SecureCustomFieldsRecordHelper).
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    /**
     * Execute the integration
     *
     * @param array $fieldValues Field values from form
     * @param array $fieldMap    Field mapping
     * @param array $utilities   Actions to perform
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!SecureCustomFieldsController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('Secure Custom Fields is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'update_post_acf_value';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'update_post_acf_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_post_acf_value'), $defaultResponse, $fieldData);

                break;

            case 'update_user_acf_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_user_acf_value'), $defaultResponse, $fieldData);

                break;

            case 'update_option_acf_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_option_acf_value'), $defaultResponse, $fieldData);

                break;

            case 'update_group_field_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_group_field_value'), $defaultResponse, $fieldData);

                break;

            case 'update_repeater_field_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_repeater_field_value'), $defaultResponse, $fieldData);

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations'),
                ];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'SecureCustomFields', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            if (empty($item->secureCustomFieldsField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue = $item->secureCustomFieldsField;

            $dataFinal[$actionValue] = ($triggerValue === 'custom' && isset($item->customValue))
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
