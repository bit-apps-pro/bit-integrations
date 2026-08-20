<?php

namespace BitApps\Integrations\Actions\BitCrm;

use Throwable;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Bit CRM lets a site define extra fields per module. They live in their own
 * tables rather than on the entity, so they are written and read through payload
 * keys and hooks of their own.
 *
 * Defining them is a Bit CRM Pro feature; without it every module has none and
 * the field maps fall back to system fields only.
 *
 * phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
 */
final class BitCrmCustomField
{
    public const PREFIX = 'cf::';

    public const MODULES = ['lead', 'contact', 'company', 'deal', 'product'];

    private const SAVE_HOOK = 'bit_crm_update_custom_fields_values';

    public static function all(string $module)
    {
        if (!\in_array($module, self::MODULES, true) || !class_exists('BitApps\CrmPro\Model\CustomField')) {
            return [];
        }

        try {
            $fields = \BitApps\CrmPro\Model\CustomField::where('module', $module)->get();
        } catch (Throwable $th) {
            return [];
        }

        if (empty($fields)) {
            return [];
        }

        $active = [];
        foreach ($fields->toArray() as $field) {
            if (empty($field['field_key']) || empty($field['status'])) {
                continue;
            }

            $active[] = $field;
        }

        return $active;
    }

    public static function values(array $fieldData, string $module)
    {
        $definitions = self::all($module);

        if (empty($definitions)) {
            return [];
        }

        $byKey = array_column($definitions, null, 'field_key');
        $values = [];

        foreach ($fieldData as $key => $value) {
            if (strpos((string) $key, self::PREFIX) !== 0) {
                continue;
            }

            $fieldKey = substr((string) $key, \strlen(self::PREFIX));

            if (!isset($byKey[$fieldKey]) || $value === null || $value === '' || $value === []) {
                continue;
            }

            $values[$fieldKey] = [
                'field_id'    => (int) $byKey[$fieldKey]['id'],
                'field_value' => self::formatValue($value, (string) ($byKey[$fieldKey]['type'] ?? '')),
            ];
        }

        return $values;
    }

    public static function withoutCustomKeys(array $values)
    {
        return array_filter(
            $values,
            static function ($key) {
                return strpos((string) $key, self::PREFIX) !== 0;
            },
            ARRAY_FILTER_USE_KEY
        );
    }

    public static function save(string $module, int $entityId, array $values)
    {
        if (empty($values) || empty($entityId)) {
            return;
        }

        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is owned by the Bit CRM plugin, not this one.
        do_action(self::SAVE_HOOK, $module, $entityId, $values);
    }

    private static function formatValue($value, string $type)
    {
        $multiValueTypes = class_exists('BitApps\CrmPro\Model\CustomField')
            ? \BitApps\CrmPro\Model\CustomField::MULTI_VALUE_FIELD_TYPES
            : ['multi-select', 'checkbox'];

        if (!\in_array($type, $multiValueTypes, true)) {
            return \is_array($value) ? implode(', ', $value) : (string) $value;
        }

        $items = \is_array($value) ? $value : explode(',', (string) $value);

        $items = array_values(
            array_filter(
                array_map('trim', array_map('strval', $items)),
                static function ($item) {
                    return $item !== '';
                }
            )
        );

        return (string) wp_json_encode($items);
    }
}
