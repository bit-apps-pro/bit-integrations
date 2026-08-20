<?php

/**
 * Secure Custom Fields Record Api
 */

namespace BitApps\Integrations\Actions\SecureCustomFields;

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

    public function execute($fieldValues, $fieldMap)
    {
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        if (!SecureCustomFieldsController::isPluginActive()) {
            $response = [
                'success' => false,
                'message' => __('Secure Custom Fields is not installed or activated', 'bit-integrations'),
            ];
            LogHandler::save($this->_integrationID, ['type' => 'SecureCustomFields', 'type_name' => $mainAction], 'error', $response);

            return $response;
        }

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'update_post_acf_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_post_acf_value'), $defaultResponse, static::generateReqDataFromFieldMap($fieldMap, $fieldValues));

                break;

            case 'update_user_acf_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_user_acf_value'), $defaultResponse, static::generateReqDataFromFieldMap($fieldMap, $fieldValues));

                break;

            case 'update_option_acf_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_option_acf_value'), $defaultResponse, static::generateReqDataFromFieldMap($fieldMap, $fieldValues));

                break;

            case 'update_group_field_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_group_field_value'), $defaultResponse, $this->buildGroupPayload($fieldValues));

                break;

            case 'update_repeater_field_value':
                $response = Hooks::apply(Config::withPrefix('secure_custom_fields_update_repeater_field_value'), $defaultResponse, $this->buildRepeaterPayload($fieldValues));

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

            $dataFinal[$item->secureCustomFieldsField] = static::resolveMappedValue($item, $fieldValues);
        }

        return $dataFinal;
    }

    private function buildGroupPayload($fieldValues)
    {
        $details = $this->_integrationDetails;
        $fields  = [];

        foreach ($details->field_map ?? [] as $item) {
            $subField = isset($item->subFieldName) ? trim($item->subFieldName) : '';

            if ($subField === '') {
                continue;
            }

            $fields[$subField] = static::resolveMappedValue($item, $fieldValues);
        }

        return [
            'post_id'    => Common::replaceFieldWithValue($details->postId ?? '', $fieldValues),
            'group_name' => Common::replaceFieldWithValue($details->groupName ?? '', $fieldValues),
            'fields'     => $fields,
        ];
    }

    private function buildRepeaterPayload($fieldValues)
    {
        $details = $this->_integrationDetails;
        $rows    = [];

        foreach ($details->field_map ?? [] as $item) {
            $subField = isset($item->subFieldName) ? trim($item->subFieldName) : '';

            if ($subField === '') {
                continue;
            }

            $rawRowIndex = isset($item->rowIndex) ? trim((string) $item->rowIndex) : '';

            if ($rawRowIndex === '') {
                continue;
            }

            $resolvedRowIndex = Common::replaceFieldWithValue($rawRowIndex, $fieldValues);

            if (!is_numeric($resolvedRowIndex)) {
                continue;
            }

            $rowIndex = (int) $resolvedRowIndex;

            $rows[$rowIndex][$subField] = static::resolveMappedValue($item, $fieldValues);
        }

        return [
            'post_id'       => Common::replaceFieldWithValue($details->postId ?? '', $fieldValues),
            'repeater_name' => Common::replaceFieldWithValue($details->repeaterName ?? '', $fieldValues),
            'rows'          => $rows,
        ];
    }

    private static function resolveMappedValue($item, $fieldValues)
    {
        $triggerValue = $item->formField ?? '';

        if ($triggerValue === 'custom' && isset($item->customValue)) {
            return Common::replaceFieldWithValue($item->customValue, $fieldValues);
        }

        return $fieldValues[$triggerValue] ?? '';
    }
}
