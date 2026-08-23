<?php

namespace BitApps\Integrations\Triggers\WPF;

use BitApps\Integrations\Flow\Flow;

final class WPFController
{
    public function __construct()
    {
    }

    public static function info()
    {
        $plugin_path = 'wpforms-lite/wpforms.php';

        return [
            'name'              => 'WPForms',
            'title'             => __('Contact Form by WPForms - Drag & Drop Form Builder for WordPress', 'bit-integrations'),
            'slug'              => $plugin_path,
            'pro'               => 'wpforms/wpforms.php',
            'type'              => 'form',
            'is_active'         => \function_exists('WPForms'),
            'documentation_url' => 'https://bit-integrations.com/wp-docs/trigger/wpforms-integrations/',
            'tutorial_url'      => 'https://youtube.com/playlist?list=PL7c6CDwwm-AKn6NqhMqYhgi61eZELRHFK&si=gOwFHSVzkxlm2D5G',
            'list'              => [
                'action' => 'wpf/get',
                'method' => 'get',
            ],
            'fields' => [
                'action' => 'wpf/get/form',
                'method' => 'post',
                'data'   => ['id']
            ],
            'isPro' => false
        ];
    }

    public static function isExists()
    {
        return ! (!\function_exists('WPForms'))

        ;
    }

    public function getAll()
    {
        if (!\function_exists('WPForms')) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated.', 'bit-integrations'), 'WPForms'));
        }
        $forms = WPForms()->form->get();
        $all_forms = [];
        if ($forms) {
            foreach ($forms as $form) {
                $all_forms[] = (object) [
                    'id'    => $form->ID,
                    'title' => $form->post_title,
                ];
            }
        }
        wp_send_json_success($all_forms);
    }

    public function get_a_form($data)
    {
        if (!\function_exists('WPForms')) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated.', 'bit-integrations'), 'WPForms'));
        }
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
        if (!self::isExists()) {
            return [];
        }
        $form = wpforms()->form->get($form_id);

        $formData = json_decode($form->post_content, true);
        if (empty($formData) || !isset($formData['fields'])) {
            return [];
        }

        $fieldDetails = $formData['fields'];

        if (empty($fieldDetails)) {
            return $fieldDetails;
        }

        $fields = [];
        $fieldToExclude = ['divider', 'html', 'address', 'page-break', 'pagebreak', 'section', 'captcha'];
        foreach ($fieldDetails as $id => $field) {
            if (\in_array($field['type'], $fieldToExclude)) {
                continue;
            }
            if ($field['type'] == 'name' && $field['format'] != 'simple') {
                if ($field['format'] == 'first-last') {
                    $names = ['first' => 'First', 'last' => 'Last'];
                } else {
                    $names = ['first' => 'First', 'last' => 'Last', 'middle' => 'Middle'];
                }

                foreach ($names as $key => $value) {
                    $fields[] = [
                        'name'  => "{$id}:{$key}",
                        'type'  => 'text',
                        'label' => "{$value} " . $field['label'],
                    ];
                }
            } elseif ($field['type'] == 'address' && $field['format'] != 'simple') {
                $address = ['address1' => 'Address1', 'address2' => 'Address2', 'city' => 'City', 'state' => 'State', 'postal' => 'Zip Code'];
                foreach ($address as $key => $value) {
                    $fields[] = [
                        'name'  => "{$id}=>{$key}",
                        'type'  => 'text',
                        'label' => "{$value}",
                    ];
                }
            } else {
                $fields[] = [
                    'name'      => $id,
                    'type'      => $field['type'] === 'file-upload' ? 'file' : $field['type'],
                    'separator' => isset($field['multiple']) && $field['multiple'] == 1 || \in_array($field['type'], ['checkbox', 'file-upload']) ? "\n" : '',
                    'label'     => $field['label'],
                ];
            }
        }

        return $fields;
    }

    public static function wpforms_process_complete($fields, $entry, $form_data, $entry_id)
    {
        $form_id = $form_data['id'];

        if (empty($form_id)) {
            return;
        }

        $data = [];

        if (!empty($entry['post_id'])) {
            $data['post_id'] = $entry['post_id'];
        }

        foreach ($fields as $fldDetail) {
            $fieldId = $fldDetail['id'];
            $fieldValue = str_replace('&#36;', '', $fldDetail['value']);

            switch ($fldDetail['type']) {
                case 'name':
                    $data[$fieldId] = $fieldValue;
                    $data[$fieldId . ':first'] = $fldDetail['first'];
                    $data[$fieldId . ':last'] = $fldDetail['last'];
                    $data[$fieldId . ':middle'] = $fldDetail['middle'];

                    break;

                case 'file-upload':
                    $data[$fieldId] = self::setFiles($fldDetail['value_raw']);

                    break;

                default:
                    if (strpos($fieldId, '_') !== false) {
                        $fieldId = strtok($fieldId, '_');
                        $data[$fieldId] = isset($data[$fieldId])
                            ? $data[$fieldId] . ', ' . $fieldValue
                            : $fieldValue;
                    } else {
                        $data[$fieldId] = $fieldValue;
                    }

                    break;
            }
        }

        if ($flows = Flow::exists('WPF', $form_id)) {
            Flow::execute('WPF', $form_id, $data, $flows);
        }
    }

    private static function setFiles($files)
    {
        if (empty($files) || !\is_array($files)) {
            return [];
        }

        $allFiles = [];
        foreach ($files as $file) {
            $allFiles[] = $file['value'];
        }

        return $allFiles;
    }
}
