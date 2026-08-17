<?php

namespace BitApps\Integrations\Actions\UserRegistrationMembership;

use WP_Error;

/**
 * Provide functionality for User Registration and Membership integration.
 */
class UserRegistrationMembershipController
{
    public static function refreshForms()
    {
        self::checkPluginExists();

        $allForms = get_posts([
            'post_type'     => 'user_registration',
            'post_status'   => 'publish',
            'orderby'       => 'ID',
            'order'         => 'DESC',
            'no_found_rows' => true,
            'nopaging'      => true,
        ]);

        $forms = array_map(
            fn ($form) => (object) [
                'value' => $form->ID,
                'label' => $form->post_title,
            ],
            $allForms
        );

        wp_send_json_success(['forms' => $forms], 200);
    }

    public static function refreshFormFields($request)
    {
        self::checkPluginExists();

        $formId = absint($request->form_id ?? 0);

        if (empty($formId)) {
            wp_send_json_error(__('Form ID is required', 'bit-integrations'), 400);
        }

        $fields = self::getFormFields($formId);

        wp_send_json_success(['fields' => array_values($fields)], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integrationData->id);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    private static function getFormFields($formId)
    {
        if (!\function_exists('ur_get_form_fields')) {
            return [];
        }

        $formFields = ur_get_form_fields($formId);

        return array_map(
            fn ($field) => (object) [
                'label'    => $field->general_setting->label ?? $field->field_key,
                'value'    => $field->field_key,
                'required' => !empty($field->general_setting->required)
            ],
            $formFields
        );
    }

    private static function checkPluginExists()
    {
        if (!class_exists('UserRegistration')) {
            wp_send_json_error(
                __('User Registration and Membership is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }
}
