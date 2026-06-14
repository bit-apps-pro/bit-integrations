<?php

namespace BitApps\Integrations\Triggers\BitForm;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Flow\Flow;
use BitCode\BitForm\Core\Util\FileHandler;

final class BitFormController
{
    public static function info()
    {
        $plugin_path = 'bitform/bitforms.php';

        return [
            'name'              => 'Bit Form',
            'title'             => __('Contact Form Plugin - Fastest Contact Form Builder Plugin for WordPress by Bit Forms.', 'bit-integrations'),
            'slug'              => $plugin_path,
            'type'              => 'form',
            'is_active'         => self::isPluginActive(),
            'documentation_url' => 'https://bit-integrations.com/wp-docs/trigger/bit-form-integrations-as-a-trigger/',
            'tutorial_url'      => 'https://youtube.com/playlist?list=PL7c6CDwwm-AK3kOJHtdkmuc-DigLa5TSy&si=x7whwFsbtGHOeYCN',
            'list'              => [
                'action' => 'bitform/get',
                'method' => 'get',
            ],
            'fields' => [
                'action' => 'bitform/get/form',
                'method' => 'post',
                'data'   => ['id']
            ]
        ];
    }

    public function getAll()
    {
        if (!self::isPluginActive()) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated.', 'bit-integrations'), 'Bit Form'));
        }

        $forms = \BitCode\BitForm\API\BitForm_Public\BitForm_Public::getForms();
        $all_forms = [];
        foreach ($forms as $form) {
            $all_forms[] = (object) [
                'id'    => $form->id,
                'title' => $form->form_name
            ];
        }
        wp_send_json_success($all_forms);
    }

    public function get_a_form($data)
    {
        if (empty($data->id)) {
            wp_send_json_error(__('Form doesn\'t exists', 'bit-integrations'));
        }
        $fields = self::fields($data->id);
        if (empty($fields)) {
            wp_send_json_error(__('Form doesn\'t exists any field', 'bit-integrations'));
        }

        $responseData['fields'] = $fields;
        wp_send_json_success($responseData);
    }

    public static function fields($form_id)
    {
        if (!self::isPluginActive()) {
            return [];
        }

        $fieldDetails = \BitCode\BitForm\API\BitForm_Public\BitForm_Public::getFields($form_id);
        if (empty($fieldDetails)) {
            return [];
        }

        $fields = [];
        foreach ($fieldDetails as $key => $field) {
            if (isset($field->fieldName) && !isset($field->txt) && $field->typ !== 'repeater') {
                if ($field->typ === 'file-up') {
                    $fields[] = [
                        'name'  => $key,
                        'type'  => 'file',
                        'label' => $field->lbl ?? $field->fieldName
                    ];
                } elseif ($field->typ === 'decision-box') {
                    $fields[] = [
                        'name'  => $key,
                        'type'  => $field->typ,
                        'label' => $field->adminLbl ?? $field->fieldName
                    ];
                } else {
                    $fields[] = [
                        'name'  => $key,
                        'type'  => $field->typ,
                        'label' => $field->lbl ?? $field->fieldName
                    ];
                }
            }
        }

        return $fields;
    }

    public static function handle_bitform_submit($formId, $entryId, $formData, $files)
    {
        if (empty($formId)) {
            return;
        }

        $flows = Flow::exists('BitForm', $formId);

        if (empty($flows)) {
            return;
        }

        $data = [
            'form_id'  => $formId,
            'entry_id' => $entryId
        ];

        foreach ($formData as $key => $value) {
            // WP 5.1 compat: strpos() in place of str_contains() (WP 5.9)
            $data[$key] = (\is_string($value) && strpos($value, '__bf__') !== false)
                ? explode('__bf__', $value)
                : $value;
        }

        if (class_exists(FileHandler::class) && !empty($files)) {
            foreach ($files as $fieldKey => $fileGroup) {
                if (empty($fileGroup['new_name']) || !\is_array($fileGroup['new_name'])) {
                    continue;
                }

                $uploadDir = FileHandler::getEntriesFileUploadDir($formId, $entryId);
                $fileUrls = [];

                foreach ($fileGroup['new_name'] as $filename) {
                    $filePath = $uploadDir . DIRECTORY_SEPARATOR . $filename;
                    $fileUrls[] = Common::fileUrl($filePath);
                }

                $data[$fieldKey] = \count($fileUrls) > 1 ? $fileUrls : reset($fileUrls);
            }
        }

        Flow::execute('BitForm', $formId, $data, $flows);
    }

    private static function isPluginActive()
    {
        return class_exists('BitCode\\BitForm\\Plugin');
    }
}
