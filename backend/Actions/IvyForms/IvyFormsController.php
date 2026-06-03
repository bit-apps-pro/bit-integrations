<?php

namespace BitApps\Integrations\Actions\IvyForms;

use WP_Error;

class IvyFormsController
{
    public static function isExists()
    {
        if (!class_exists('\IvyForms\Plugin\Plugin')) {
            wp_send_json_error(
                __('IvyForms is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function ivyFormsAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshForms()
    {
        self::isExists();

        $formService = self::getService('\IvyForms\Services\Form\FormService');

        if (!$formService) {
            wp_send_json_error(__('Unable to access IvyForms forms', 'bit-integrations'), 400);
        }

        $forms   = $formService->getAllForms() ?? [];
        $options = [];

        foreach ($forms as $form) {
            $options[] = (object) [
                'value' => $form->getId(),
                'label' => $form->getName(),
            ];
        }

        wp_send_json_success(['forms' => $options], 200);
    }

    public static function refreshFields($request)
    {
        self::isExists();

        $formId = isset($request->formId) ? (int) $request->formId : 0;

        if (empty($formId)) {
            wp_send_json_error(__('Form ID is required', 'bit-integrations'), 400);
        }

        $fieldService = self::getService('\IvyForms\Services\Field\FieldService');

        if (!$fieldService) {
            wp_send_json_error(__('Unable to access IvyForms fields', 'bit-integrations'), 400);
        }

        $fields  = $fieldService->getAllFields($formId) ?? [];
        $options = [];

        foreach ($fields as $field) {
            $field = self::prepareData($field);

            if (self::isSkippableField($field['type'] ?? '')) {
                continue;
            }

            $options[] = (object) [
                'value'    => $field['id'] ?? '',
                'label'    => $field['label'] ?? '',
                'required' => $field['required'] ?? false,
            ];
        }

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

    public static function getService($serviceClass)
    {
        if (!class_exists('\IvyForms\Plugin\Plugin')) {
            return;
        }

        $plugin = \IvyForms\Plugin\Plugin::getInstance();

        if (!$plugin || empty($plugin->container)) {
            return;
        }

        try {
            return $plugin->container->get($serviceClass);
        } catch (\Throwable $th) {
            return;
        }
    }

    public static function prepareData($data)
    {
        if (empty($data)) {
            return [];
        }

        if (\is_array($data)) {
            return $data;
        }

        if (\is_object($data) && method_exists($data, 'toArray')) {
            return $data->toArray();
        }

        return (array) $data;
    }

    public static function isSkippableField($type)
    {
        return \in_array($type, ['recaptcha', 'turnstile', 'hcaptcha', 'html', 'heading', 'paragraph', 'divider', 'page_break', 'submit'], true);
    }
}
