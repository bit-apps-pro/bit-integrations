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
     *
     * @return array
     */
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

    /**
     * Build the group payload: every mapped sub-field name => resolved value, plus the
     * group's post id and field name. Lets one action set many sub-fields of a group.
     *
     * @param array $fieldValues
     *
     * @return array{post_id: string, group_name: string, fields: array}
     */
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

    /**
     * Build the repeater payload: mapped sub-fields grouped by row index, plus the
     * repeater's post id and field name. Lets one action set many rows / sub-fields.
     *
     * @param array $fieldValues
     *
     * @return array{post_id: string, repeater_name: string, rows: array}
     */
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

            // Skip a sub-field with no row index rather than silently writing it to row 0,
            // which would collapse distinct rows onto each other.
            if ($rawRowIndex === '') {
                continue;
            }

            $resolvedRowIndex = Common::replaceFieldWithValue($rawRowIndex, $fieldValues);

            // A smart tag that resolves to a non-numeric/empty value would cast to row 0
            // and silently collide with a real row 0; skip it instead of merging rows.
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

    /**
     * Resolve a single field-map row to its value (custom smart-tag value or form field value).
     *
     * @param object $item
     * @param array  $fieldValues
     *
     * @return mixed
     */
    private static function resolveMappedValue($item, $fieldValues)
    {
        $triggerValue = $item->formField ?? '';

        if ($triggerValue === 'custom' && isset($item->customValue)) {
            return Common::replaceFieldWithValue($item->customValue, $fieldValues);
        }

        return $fieldValues[$triggerValue] ?? '';
    }
}
