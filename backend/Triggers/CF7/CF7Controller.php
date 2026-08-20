<?php

namespace BitApps\Integrations\Triggers\CF7;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Flow\Flow;
use WPCF7_ContactForm;
use WPCF7_FormTagsManager;
use WPCF7_ShortcodeManager;
use WPCF7_Submission;

final class CF7Controller
{
    public static function info()
    {
        $plugin_path = 'contact-form-7/wp-contact-form-7.php';

        return [
            'name'              => 'Contact Form 7',
            'title'             => __('Just another contact form plugin. Simple but flexible', 'bit-integrations'),
            'type'              => 'form',
            'is_active'         => class_exists('WPCF7_ContactForm'),
            'documentation_url' => 'https://bit-integrations.com/wp-docs/trigger/contact-form-7-integrations/',
            'tutorial_url'      => 'https://youtube.com/playlist?list=PL7c6CDwwm-AL85-ajsYQ7LOhs1t2y6toV&si=fI1erzdRK67TQ_Ng',
            'note'              => '<p>' . __('The feature <b>Advanced Custom HTML Fields</b> is available only in the Bit Integrations Pro starting from v2.1.6 of the plugin. Please upgrade to access this feature.', 'bit-integrations') . '</p>',
            'list'              => [
                'action' => 'cf7/get',
                'method' => 'get',
            ],
            'fields' => [
                'action' => 'cf7/get/form',
                'method' => 'post',
                'data'   => ['id']
            ],
            'isPro' => false
        ];
    }

    public function getAll()
    {
        if (!class_exists('WPCF7_ContactForm')) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated.', 'bit-integrations'), 'Contact Form 7'));
        }
        $forms = WPCF7_ContactForm::find();
        $all_forms = [];
        foreach ($forms as $form) {
            $all_forms[] = (object) [
                'id'    => $form->id(),
                'title' => $form->title()
            ];
        }
        wp_send_json_success($all_forms);
    }

    public function get_a_form($data)
    {
        $fields = self::fields($data->id);
        $missing_field = null;
        if (!property_exists($data, 'id')) {
            $missing_field = 'Form ID';
        }
        if (!\is_null($missing_field)) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s can\'t be empty', 'bit-integrations'), $missing_field));
        }
        if (empty($fields)) {
            wp_send_json_error(__('Form doesn\'t exists any field', 'bit-integrations'));
        }

        $responseData['fields'] = $fields;
        wp_send_json_success($responseData);
    }

    public static function fields($form_id)
    {
        $form_text = get_post_meta($form_id, '_form', true);
        $fieldDetails = static::getFormTags($form_text);

        if (empty($fieldDetails)) {
            return $fieldDetails;
        }

        $fields = static::getCustomHtmlFields($form_text);

        foreach ($fieldDetails as $field) {
            if (!empty($field->name) && $field->type !== 'submit') {
                $fields[] = [
                    'name'  => $field->name,
                    'type'  => $field->basetype,
                    'label' => $field->name,
                ];
            }
        }

        return $fields;
    }

    public static function handle_wpcf7_submit()
    {
        $submission = WPCF7_Submission::get_instance();

        if (!$submission || !$posted_data = $submission->get_posted_data()) {
            return;
        }

        $postID = (int) $submission->get_meta('container_post_id');

        if (isset($posted_data['_wpcf7'])) {
            $form_id = $posted_data['_wpcf7'];
        } else {
            $current_form = WPCF7_ContactForm::get_current();
            $form_id = $current_form->id();
        }

        $posted_data = static::unsetPostedFileFieldValues($posted_data, $form_id);
        $files = static::setFileRoot($submission->uploaded_files());
        $posted_data = array_merge($posted_data, $files);

        if ($postID) {
            $posted_data['post_id'] = $postID;
        }

        $data = [];
        foreach ($posted_data as $key => $value) {
            if (\is_array($value) && empty($value)) {
                $data[$key] = null;
            } elseif (\is_array($value) && \count($value) == 1) {
                $data[$key] = $posted_data[$key][0];
            } else {
                $data[$key] = $posted_data[$key];
            }
        }

        if (!empty($form_id) && $flows = Flow::exists('CF7', $form_id)) {
            Flow::execute('CF7', $form_id, $data, $flows);
        }
    }

    private static function getCustomHtmlFields($form_text)
    {
        $fields = Hooks::apply(Config::withPrefix('cf7_get_advance_custom_html_fields'), $form_text);

        $fields = Hooks::apply('btcbi_cf7_get_advance_custom_html_fields', $fields);

        return \is_array($fields) ? $fields : [];
    }

    private static function getFormTags($form_text)
    {
        if (method_exists('WPCF7_FormTagsManager', 'get_instance')) {
            $formManager = WPCF7_FormTagsManager::get_instance();
            $formManager->scan($form_text);

            return $formManager->get_scanned_tags();
        }

        if (method_exists('WPCF7_ShortcodeManager', 'get_instance')) {
            $formManager = WPCF7_ShortcodeManager::get_instance();
            $formManager->do_shortcode($form_text);

            return $formManager->get_scanned_tags();
        }

        return [];
    }

    private static function unsetPostedFileFieldValues($posted_data, $form_id)
    {
        $form_text = get_post_meta($form_id, '_form', true);

        foreach (static::getFormTags($form_text) as $field) {
            if (empty($field->name) || !static::isFileField($field)) {
                continue;
            }

            unset($posted_data[$field->name]);
        }

        return $posted_data;
    }

    private static function isFileField($field)
    {
        if (!empty($field->basetype) && $field->basetype === 'file') {
            return true;
        }

        return !empty($field->type) && strpos($field->type, 'file') === 0;
    }

    private static function setFileRoot($files)
    {
        $allFiles = [];

        foreach ($files as $key => $file) {
            if (\is_array($file)) {
                $allFiles[$key] = static::setFileRoot($file);
            } else {
                $allFiles[$key] = Common::fileUrl($file);
            }
        }

        return $allFiles;
    }
}
