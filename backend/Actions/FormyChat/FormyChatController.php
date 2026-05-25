<?php

namespace BitApps\Integrations\Actions\FormyChat;

use WP_Error;

class FormyChatController
{
    public static function isExists()
    {
        if (!\defined('FORMYCHAT_VERSION')) {
            wp_send_json_error(
                __('FormyChat is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function formyChatAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshWidgets()
    {
        self::isExists();

        $widgets = [];

        if (class_exists('\FormyChat\Models\Widget')) {
            $allWidgets = \FormyChat\Models\Widget::get_names();

            if (\is_array($allWidgets)) {
                foreach ($allWidgets as $widget) {
                    if (!\is_object($widget) || !isset($widget->id, $widget->name)) {
                        continue;
                    }

                    $widgets[] = (object) [
                        'widget_id'   => (int) $widget->id,
                        'widget_name' => (string) $widget->name,
                    ];
                }
            }
        }

        wp_send_json_success(['widgets' => $widgets], 200);
    }

    public static function refreshWidgetFields($request)
    {
        self::isExists();

        $widgetId = isset($request->widgetId) ? (int) $request->widgetId : 0;

        if (empty($widgetId)) {
            wp_send_json_error(__('Widget ID is required', 'bit-integrations'), 400);
        }

        if (!class_exists('\FormyChat\Models\Widget') || !class_exists('\FormyChat\App')) {
            wp_send_json_error(__('FormyChat is not installed or activated', 'bit-integrations'), 400);
        }

        $widget = \FormyChat\Models\Widget::find($widgetId);
        if (is_wp_error($widget) || !$widget) {
            wp_send_json_error(__('Widget not found', 'bit-integrations'), 400);
        }

        $fields = \FormyChat\App::form_fields();
        if (!\is_array($fields)) {
            $fields = [];
        }

        // Insert custom dropdown if configured on this widget
        $dropdown = [];
        if (isset($widget->config['form']['custom_dropdown']) && \is_array($widget->config['form']['custom_dropdown'])) {
            $dropdown = $widget->config['form']['custom_dropdown'];
        }

        if (!empty($dropdown['enabled']) && !empty($dropdown['options']) && \is_array($dropdown['options'])) {
            $dropdownField = [
                'name'  => !empty($dropdown['name']) ? $dropdown['name'] : 'dropdown',
                'label' => !empty($dropdown['label']) ? $dropdown['label'] : 'Dropdown',
            ];

            $positions = [
                'before_message' => ['field' => 'message', 'offset' => 0],
                'after_name'     => ['field' => 'name', 'offset' => 1],
                'after_email'    => ['field' => 'email', 'offset' => 1],
                'after_phone'    => ['field' => 'phone', 'offset' => 1],
            ];

            $position  = isset($dropdown['position']) ? (string) $dropdown['position'] : 'before_message';
            $posConfig = $positions[$position] ?? $positions['before_message'];

            $insertIndex = \count($fields);
            foreach ($fields as $idx => $f) {
                if (\is_array($f) && !empty($f['name']) && (string) $f['name'] === $posConfig['field']) {
                    $insertIndex = $idx + $posConfig['offset'];
                    break;
                }
            }

            array_splice($fields, $insertIndex, 0, [$dropdownField]);
        }

        $options = [];
        foreach ($fields as $field) {
            if (!\is_array($field) || empty($field['name'])) {
                continue;
            }
            $name      = (string) $field['name'];
            $options[] = (object) [
                'label' => !empty($field['label']) ? (string) $field['label'] : $name,
                'value' => $name,
            ];
        }

        $options[] = (object) ['label' => __('Note', 'bit-integrations'), 'value' => 'note'];

        wp_send_json_success(['fields' => $options], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map;
        $utilities          = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }
}
