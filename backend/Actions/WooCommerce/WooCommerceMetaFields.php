<?php

/**
 * WooCommerce Fields.
 */

namespace BitApps\Integrations\Actions\WooCommerce;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\Hooks;

class WooCommerceMetaFields
{
    public static function metaBoxFields($module)
    {
        $fileTypes = [
            'image',
            'image_upload',
            'file_advanced',
            'file_upload',
            'single_image',
            'file',
            'image_advanced',
            'video'
        ];

        $metaBoxFields = [];
        $metaBoxUploadFields = [];

        if (\function_exists('rwmb_get_registry') && \function_exists('rwmb_get_object_fields')) {
            if ($module === 'customer') {
                $field_registry = \rwmb_get_registry('field');
                $meta_boxes = $field_registry->get_by_object_type($object_type = 'user');
                $metaFields = isset($meta_boxes['user']) && \is_array($meta_boxes['user']) ? array_values($meta_boxes['user']) : [];
            } else {
                $metaFields = array_values(\rwmb_get_object_fields($module));
            }

            foreach ($metaFields as $index => $field) {
                if (!\in_array($field['type'], $fileTypes)) {
                    $metaBoxFields[$index] = (object) [
                        'fieldKey'  => $field['id'],
                        'fieldName' => 'Metabox Field - ' . $field['name'],
                        'required'  => $field['required'],
                    ];
                } else {
                    $metaBoxUploadFields[$index] = (object) [
                        'fieldKey'  => $field['id'],
                        'fieldName' => 'Metabox Field - ' . $field['name'],
                        'required'  => $field['required'],
                    ];
                }
            }
        }

        return ['meta_fields' => $metaBoxFields, 'upload_fields' => $metaBoxUploadFields];
    }

    public static function getProductModuleFields($module)
    {
        $metaBox = static::metaBoxFields($module);
        $acfFields = static::getACFFields(['product']);

        return [
            'fields'        => array_merge(WooCommerceStaticFields::productBasicFields(), $acfFields['fields'], $metaBox['meta_fields']),
            'upload_fields' => array_merge(WooCommerceStaticFields::productUploadFields(), $acfFields['uploadFields'], $metaBox['upload_fields']),
            'required'      => ['post_title', '_sku']
        ];
    }

    public static function getOrderModuleFields($module)
    {
        $metaBoxOrder = static::metaBoxFields($module);
        $metaBoxCustomer = static::metaBoxFields('customer');

        $checkoutFields = WooCommerceStaticFields::checkoutBasicFields();
        $customerFields = WooCommerceStaticFields::customerFields();
        $billingFields = WooCommerceStaticFields::billingFields();
        $ShippingFields = WooCommerceStaticFields::shippingFields();
        $fieldLineItems = WooCommerceStaticFields::lineItemsFields();
        $flexibleCheckoutFields = static::getFlexibleCheckoutFields();

        $fieldsOrder = array_merge($checkoutFields, $billingFields, $ShippingFields, $flexibleCheckoutFields, $metaBoxOrder['meta_fields']);
        $fieldsCustomer = array_merge($customerFields, $billingFields, $ShippingFields, $flexibleCheckoutFields, $metaBoxCustomer['meta_fields']);

        uksort($fieldsOrder, 'strnatcasecmp');
        uksort($fieldsCustomer, 'strnatcasecmp');
        uksort($fieldLineItems, 'strnatcasecmp');

        $requiredCustomerFields = ['user_login', 'user_email'];
        $requiredLineItemFields = ['sku', 'quantity'];

        $responseOrder = [
            'fields'       => $fieldsOrder,
            'uploadFields' => [],
            'required'     => []
        ];
        $responseCustomer = [
            'fields'       => $fieldsCustomer,
            'uploadFields' => [],
            'required'     => $requiredCustomerFields
        ];

        $responseLine = [
            'fields'       => $fieldLineItems,
            'uploadFields' => [],
            'required'     => $requiredLineItemFields
        ];

        return [$responseOrder, $responseCustomer, $responseLine];
    }

    private static function getACFFields(array $types)
    {
        $fields = [];
        $uploadFields = [];
        $filterFile = ['file', 'image', 'gallery'];
        $acfFieldGroups = Helper::acfGetFieldGroups($types);

        foreach ($acfFieldGroups as $group) {
            $acfFields = acf_get_fields($group['ID']);

            foreach ($acfFields as $field) {
                if (\in_array($field['type'], $filterFile)) {
                    $uploadFields[$field['label']] = (object) [
                        'fieldKey'  => $field['_name'],
                        'fieldName' => $field['label'],
                        'required'  => $field['required'] == 1 ? true : false,
                    ];
                } else {
                    $fields[$field['label']] = (object) [
                        'fieldKey'  => $field['_name'],
                        'fieldName' => $field['label'],
                        'required'  => $field['required'] == 1 ? true : false,
                    ];
                }
            }
        }

        return ['fields' => $fields, 'uploadFields' => $uploadFields];
    }

    private static function getFlexibleCheckoutFields()
    {
        $checkoutFields = [];
        $fields = Hooks::apply(Config::withPrefix('woocommerce_flexible_checkout_fields'), []);

        if (empty($fields)) {
            /**
             * @deprecated 2.7.8 Use `bit_integrations_woocommerce_flexible_checkout_fields` filter instead.
             * @since 2.7.8
             */
            $fields = Hooks::apply('btcbi_woocommerce_flexible_checkout_fields', []);
        }

        foreach ($fields as $field) {
            $checkoutFields[$field->fieldName] = (object) [
                'fieldKey'  => $field->fieldKey,
                'fieldName' => $field->fieldName
            ];
        }

        return $checkoutFields;
    }
}
