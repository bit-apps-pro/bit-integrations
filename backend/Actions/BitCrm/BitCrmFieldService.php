<?php

namespace BitApps\Integrations\Actions\BitCrm;

use Throwable;

if (!defined('ABSPATH')) {
    exit;
}

final class BitCrmFieldService
{
    public const TYPE_LOOKUP = 'lookup';

    public const TYPE_SELECT = 'select';

    private const SERVICES = [
        'lead'    => 'BitApps\Crm\Services\LeadService',
        'contact' => 'BitApps\Crm\Services\ContactService',
        'company' => 'BitApps\Crm\Services\CompanyService',
        'deal'    => 'BitApps\Crm\Services\DealService',
        'product' => 'BitApps\CrmPro\Services\ProductService',
    ];

    private const LOOKUP_TYPES = ['lookup_select', 'lookup_autocomplete'];

    private const GROUP_FIELDS_KEY = 'group_fields';

    public static function fields(string $module)
    {
        if (!isset(self::SERVICES[$module]) || !class_exists(self::SERVICES[$module])) {
            return [];
        }

        $service = self::SERVICES[$module];

        try {
            $fields = (new $service())->fields();
        } catch (Throwable $th) {
            return [];
        }

        return \is_array($fields) ? self::normalizeAll($fields) : [];
    }

    private static function normalizeAll(array $fields)
    {
        $normalized = [];

        foreach ($fields as $field) {
            $field = (array) $field;

            if (($field['type'] ?? '') === 'section') {
                continue;
            }

            if (!empty($field[self::GROUP_FIELDS_KEY]) && \is_array($field[self::GROUP_FIELDS_KEY])) {
                array_push($normalized, ...self::normalizeAll($field[self::GROUP_FIELDS_KEY]));

                continue;
            }

            $row = self::normalize($field);

            if ($row !== null) {
                $normalized[] = $row;
            }
        }

        return $normalized;
    }

    private static function normalize(array $field)
    {
        $key = (string) ($field['field_key'] ?? '');

        if ($key === '') {
            return;
        }

        $label = (string) ($field['label'] ?? '');

        $row = [
            'key'      => $key,
            'label'    => $label === '' ? $key : $label,
            'required' => !empty($field['required']),
            'type'     => (string) ($field['type'] ?? 'text'),
            'isCustom' => false,
        ];

        if (!empty($field['is_custom'])) {
            if (empty($field['status'])) {
                return;
            }

            $row['key'] = BitCrmCustomField::PREFIX . $key;
            $row['isCustom'] = true;

            return $row;
        }

        if (\in_array($row['type'], self::LOOKUP_TYPES, true)) {
            $row['type'] = self::TYPE_LOOKUP;
            $row['relatedModule'] = (string) ($field['related_module'] ?? '');

            return $row;
        }

        $options = self::options($field);

        if (!empty($options)) {
            $row['type'] = self::TYPE_SELECT;
            $row['options'] = $options;

            $default = $field['default_value'] ?? '';

            if ($default !== '' && $default !== null && !\is_array($default)) {
                $row['defaultValue'] = self::toOptionValue($default);
            }
        }

        return $row;
    }

    private static function options(array $field)
    {
        if (empty($field['options']) || !\is_array($field['options'])) {
            return [];
        }

        $options = [];

        foreach ($field['options'] as $option) {
            $option = (array) $option;
            $value = $option['value'] ?? $option['key'] ?? $option['id'] ?? '';

            if ($value === '' || $value === null || \is_array($value)) {
                continue;
            }

            $label = $option['label'] ?? $option['name'] ?? $option['title'] ?? $value;

            $options[] = [
                'label' => \is_array($label) ? self::toOptionValue($value) : self::toOptionValue($label),
                'value' => self::toOptionValue($value),
            ];
        }

        return $options;
    }

    private static function toOptionValue($value)
    {
        if (\is_bool($value)) {
            return $value ? '1' : '0';
        }

        return (string) $value;
    }
}
