<?php

namespace BitApps\Integrations\Triggers\Breakdance;

class BreakdanceHelper
{
    public static function setFields($data, $form)
    {
        // Create a mapping for quick access
        $formFields = array_column($form, null, 'name');
        $allFields = [
            // translators: %s: Placeholder value
            ['name' => self::findKeyPath($data, 'formId'), 'type' => 'text', 'label' => wp_sprintf(__('Form Id (%s)', 'bit-integrations'), $data['formId']), 'value' => $data['formId']],
            // translators: %s: Placeholder value
            ['name' => self::findKeyPath($data, 'postId'), 'type' => 'text', 'label' => wp_sprintf(__('Post Id (%s)', 'bit-integrations'), $data['postId']), 'value' => $data['postId']]
        ];

        foreach ($data['fields'] as $key => $value) {
            $formKey = "fields[{$key}]";
            if (isset($formFields[$formKey]) && $formFields[$formKey]['type'] != 'file') {
                if (!\is_string($value)) {
                    $label = $formFields[$formKey]['type'];
                } else {
                    $label = \strlen($value) > 20 ? substr($value, 0, 20) . '...' : $value;
                }

                $allFields[] = [
                    'name'  => self::findKeyPath($data['fields'], $key, ['fields']),
                    'type'  => $formFields[$formKey]['type'],
                    'label' => $formFields[$formKey]['label'] . ' (' . $label . ')',
                    'value' => $value
                ];
            }
        }

        foreach ($data['files'] as $key => $files) {
            $formKey = "fields[{$key}]";
            if (isset($formFields[$formKey])) {
                $urls = array_column($files, 'url');

                $allFields[] = [
                    'name'  => self::findKeyPath($data['files'], $key, ['files']),
                    'type'  => $formFields[$formKey]['type'],
                    'label' => $formFields[$formKey]['label'],
                    'value' => $urls
                ];
            }
        }

        return $allFields;
    }

    public static function findKeyPath(array $data, string $searchKey, array $currentPath = [])
    {
        foreach ($data as $key => $value) {
            $path = $currentPath;
            $path[] = $key;

            if (\is_object($value)) {
                $value = (array) $value;
            }
            if ($key === $searchKey) {
                return implode('.', $path);
            }
            if (\is_array($value)) {
                $foundPath = self::findKeyPath($value, $searchKey, $path);
                if ($foundPath) {
                    return $foundPath;
                }
            }
        }
    }
}
