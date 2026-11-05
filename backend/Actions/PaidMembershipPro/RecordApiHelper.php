<?php

namespace BitApps\Integrations\Actions\PaidMembershipPro;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use PMPro_Field_Group;

class RecordApiHelper
{
    public const ADD_MEMBERSHIP = '1';

    public const REMOVE_MEMBERSHIP = '2';

    public const UPDATE_PROFILE = '3';

    public const DIRECTORY_VISIBILITY = '4';

    private const DIRECTORY_META_KEY = 'pmpromd_hide_directory';

    private const UNSUPPORTED_FIELD_TYPES = ['file', 'html'];

    private const MULTI_VALUE_FIELD_TYPES = ['checkbox_grouped', 'select2', 'multiselect'];

    private const PRIVILEGED_CAPABILITIES = ['manage_options', 'promote_users', 'list_users', 'edit_posts'];

    private $integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField ?? '';
            $actionValue = $value->paidmembershipproFormField ?? '';

            if ($triggerValue === '' || $actionValue === '') {
                continue;
            }

            $mappedValue = $triggerValue === 'custom'
                ? Common::replaceFieldWithValue($value->customValue ?? '', $data)
                : ($data[$triggerValue] ?? null);

            if (!self::isEmptyValue($mappedValue)) {
                $dataFinal[$actionValue] = $mappedValue;
            }
        }

        return $dataFinal;
    }

    public function addUserMembershipLevel($membership_level, $user_id)
    {
        $current_level = pmpro_getMembershipLevelForUser($user_id);

        if (!empty($current_level) && absint($current_level->ID) == absint($membership_level)) {
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'add user', 'type_name' => 'Add the user to a membership level']), 'error', wp_json_encode(__('User is already a member of the specified level.', 'bit-integrations')));

            return;
        }
        global $wpdb;
        $cache_key = Config::withPrefix('pmpro_membership_level_') . absint($membership_level);
        $cache_group = Config::VAR_PREFIX;
        $pmpro_membership_level = wp_cache_get($cache_key, $cache_group);

        if (false === $pmpro_membership_level) {
            $membership_table = esc_sql($wpdb->pmpro_membership_levels);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared -- Reading PMPro levels table directly; static table name from PMPro.
            $pmpro_membership_level = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $membership_table . ' WHERE id = %d', $membership_level));
            wp_cache_set($cache_key, $pmpro_membership_level, $cache_group, 10 * MINUTE_IN_SECONDS);
        }

        if (null === $pmpro_membership_level) {
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'add user', 'type_name' => 'Add the user to a membership level']), 'error', wp_json_encode(__('There is no membership level with the specified ID.', 'bit-integrations')));

            return;
        }

        $isAssigned = null;
        if (!empty($pmpro_membership_level->expiration_number)) {
            $data = [
                'user_id'         => $user_id,
                'membership_id'   => $pmpro_membership_level->id,
                'code_id'         => 0,
                'initial_payment' => 0,
                'billing_amount'  => 0,
                'cycle_number'    => 0,
                'cycle_period'    => 0,
                'billing_limit'   => 0,
                'trial_amount'    => 0,
                'trial_limit'     => 0,
            ];

            $isAssigned = pmpro_changeMembershipLevel($data, absint($user_id));
        } else {
            $isAssigned = pmpro_changeMembershipLevel(absint($membership_level), absint($user_id));
        }

        if ($isAssigned === true) {
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'add user', 'type_name' => 'Add the user to a membership level']), 'success', wp_json_encode(__('User membership level added successfully', 'bit-integrations')));

            return;
        }
        LogHandler::save($this->integrationID, wp_json_encode(['type' => 'add user', 'type_name' => 'Add the user to a membership level']), 'error', wp_json_encode(__('Failed to add membership level', 'bit-integrations')));
    }

    public function removeUserFromMembershipLevel($membership_level, $user_id)
    {
        $user_membership_levels = $this->get_user_membership_levels($user_id);

        if ('any' === $membership_level) {
            if (empty($user_membership_levels)) {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'remove user', 'type_name' => 'Remove the user to all membership level']), 'error', wp_json_encode(__('User does not belong to any membership levels', 'bit-integrations')));

                return;
            }

            foreach ($user_membership_levels as $membership_level) {
                $cancel_level = pmpro_cancelMembershipLevel(absint($membership_level), absint($user_id));
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'remove user', 'type_name' => 'Remove the user to a membership level']), 'success', wp_json_encode(__('User removed from all membership level successfully', 'bit-integrations')));
            }
        }

        if (!\in_array($membership_level, $user_membership_levels, true)) {
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'remove user', 'type_name' => 'Remove the user to all membership level']), 'error', wp_json_encode(__('User was not a member of the specified level', 'bit-integrations')));

            return;
        }

        if (pmpro_cancelMembershipLevel(absint($membership_level), absint($user_id))) {
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'remove user', 'type_name' => 'Remove the user to a membership level']), 'success', wp_json_encode(__('User removed from membership level successfully', 'bit-integrations')));

            return;
        }
    }

    public function execute(
        $mainAction,
        $selectedMembership,
        $userId,
        $fieldValues = []
    ) {
        $apiResponse = true;
        if ($mainAction === self::ADD_MEMBERSHIP) {
            $this->addUserMembershipLevel($selectedMembership, $userId);
        } elseif ($mainAction === self::REMOVE_MEMBERSHIP) {
            $this->removeUserFromMembershipLevel($selectedMembership, $userId);
        } elseif ($mainAction === self::UPDATE_PROFILE) {
            $this->updateUserProfile($fieldValues, $userId);
        } elseif ($mainAction === self::DIRECTORY_VISIBILITY) {
            $this->updateDirectoryVisibility($this->_integrationDetails->directoryVisibility ?? '', $userId);
        }

        return $apiResponse;
    }

    public static function profileFields()
    {
        $fields = [];
        $coreFields = self::coreProfileFields();

        foreach ($coreFields as $key => $label) {
            $fields[] = ['key' => $key, 'label' => $label, 'required' => false];
        }

        foreach (self::customProfileFields() as $field) {
            if (isset($coreFields[$field->name])) {
                continue;
            }

            $fields[] = ['key' => $field->name, 'label' => $field->label ?: $field->name, 'required' => false];
        }

        return $fields;
    }

    public function updateUserProfile($fieldValues, $userId)
    {
        $logType = wp_json_encode(['type' => 'update profile', 'type_name' => 'Update the user profile']);
        $data = $this->generateReqDataFromFieldMap($fieldValues, $this->_integrationDetails->field_map ?? []);

        if (empty($data)) {
            LogHandler::save($this->integrationID, $logType, 'error', wp_json_encode(__('No mapped profile field has a value.', 'bit-integrations')));

            return;
        }

        if (!get_userdata($userId)) {
            LogHandler::save($this->integrationID, $logType, 'error', wp_json_encode(__('User not found.', 'bit-integrations')));

            return;
        }

        $coreData = $this->sanitizeCoreProfileData(array_intersect_key($data, self::coreProfileFields()));

        if (isset($coreData['user_email']) && strcasecmp(get_userdata($userId)->user_email, $coreData['user_email']) === 0) {
            unset($coreData['user_email']);
        }

        if (isset($coreData['user_email'])) {
            $emailError = $this->validateProfileEmail($coreData['user_email'], $userId);

            if ($emailError) {
                LogHandler::save($this->integrationID, $logType, 'error', wp_json_encode($emailError));

                return;
            }
        }

        if (!empty($coreData)) {
            $result = wp_update_user(['ID' => $userId] + $coreData);

            if (is_wp_error($result)) {
                LogHandler::save($this->integrationID, $logType, 'error', wp_json_encode($result->get_error_message()));

                return;
            }
        }

        $skipped = $this->saveCustomProfileFields(array_diff_key($data, self::coreProfileFields()), $userId);
        $updated = array_values(array_diff(array_keys($data), $skipped));

        if (empty($updated)) {
            LogHandler::save($this->integrationID, $logType, 'error', wp_json_encode(['message' => __('None of the mapped fields can be saved.', 'bit-integrations'), 'skipped' => $skipped]));

            return;
        }

        LogHandler::save($this->integrationID, $logType, 'success', wp_json_encode(['message' => __('User profile updated successfully', 'bit-integrations'), 'updated' => $updated, 'skipped' => $skipped]));
    }

    public function updateDirectoryVisibility($visibility, $userId)
    {
        $logType = wp_json_encode(['type' => 'directory visibility', 'type_name' => 'Show or hide the user in the member directory']);

        if (!\function_exists('pmpromd_save_extra_profile_fields')) {
            LogHandler::save($this->integrationID, $logType, 'error', wp_json_encode(__('Paid Memberships Pro - Member Directory Add On is not active.', 'bit-integrations')));

            return;
        }

        if (!\in_array($visibility, ['show', 'hide'], true)) {
            LogHandler::save($this->integrationID, $logType, 'error', wp_json_encode(__('Directory visibility must be show or hide.', 'bit-integrations')));

            return;
        }

        if (!get_userdata($userId)) {
            LogHandler::save($this->integrationID, $logType, 'error', wp_json_encode(__('User not found.', 'bit-integrations')));

            return;
        }

        update_user_meta($userId, self::DIRECTORY_META_KEY, $visibility === 'hide' ? '1' : '');

        $message = $visibility === 'hide'
            ? __('User hidden from the member directory', 'bit-integrations')
            : __('User shown in the member directory', 'bit-integrations');

        if ($visibility === 'show' && \function_exists('pmpro_hasMembershipLevel') && !pmpro_hasMembershipLevel(null, $userId)) {
            $message = __('User is set to show in the member directory, but the directory lists only active members and this user has no membership level.', 'bit-integrations');
        }

        LogHandler::save($this->integrationID, $logType, 'success', wp_json_encode($message));
    }

    protected function get_user_membership_levels($user_id = 0)
    {
        if (!\function_exists('pmpro_getMembershipLevelsForUser')) {
            return [];
        }
        $user_membership_levels = pmpro_getMembershipLevelsForUser($user_id);

        return array_map(
            function ($membership_level) {
                return $membership_level->ID;
            },
            $user_membership_levels
        );
    }

    private static function isEmptyValue($value)
    {
        return $value === null || $value === '' || $value === [];
    }

    private static function coreProfileFields()
    {
        return [
            'user_email'   => __('Email', 'bit-integrations'),
            'first_name'   => __('First Name', 'bit-integrations'),
            'last_name'    => __('Last Name', 'bit-integrations'),
            'display_name' => __('Display Name', 'bit-integrations'),
            'nickname'     => __('Nickname', 'bit-integrations'),
            'user_url'     => __('Website', 'bit-integrations'),
            'description'  => __('Biographical Info', 'bit-integrations'),
        ];
    }

    private static function customProfileFields()
    {
        if (!class_exists('PMPro_Field_Group')) {
            return [];
        }

        $fields = [];

        foreach (PMPro_Field_Group::get_all() as $group) {
            foreach ($group->get_fields() as $field) {
                if (!empty($field->name) && !\in_array($field->type, self::UNSUPPORTED_FIELD_TYPES, true)) {
                    $fields[$field->name] = $field;
                }
            }
        }

        return $fields;
    }

    private function sanitizeCoreProfileData($data)
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            $value = \is_array($value) ? implode(', ', array_filter($value, 'is_scalar')) : (string) $value;

            if ($key === 'user_email') {
                $sanitized[$key] = sanitize_email($value);
            } elseif ($key === 'user_url') {
                $sanitized[$key] = esc_url_raw($value);
            } elseif ($key === 'description') {
                $sanitized[$key] = sanitize_textarea_field($value);
            } else {
                $sanitized[$key] = sanitize_text_field($value);
            }
        }

        return $sanitized;
    }

    private function validateProfileEmail($email, $userId)
    {
        if (($this->_integrationDetails->userSource ?? '') === 'email') {
            return __('The email address can\'t be changed when the user is matched by email.', 'bit-integrations');
        }

        if (!is_email($email)) {
            return __('The email address isn\'t correct.', 'bit-integrations');
        }

        $ownerId = email_exists($email);

        if ($ownerId && (int) $ownerId !== (int) $userId) {
            return __('This email is already registered to another user.', 'bit-integrations');
        }

        foreach (self::PRIVILEGED_CAPABILITIES as $capability) {
            if (user_can($userId, $capability)) {
                return __('The email address of a user who can edit content or manage the site can\'t be changed by this action.', 'bit-integrations');
            }
        }

        return '';
    }

    private function saveCustomProfileFields($data, $userId)
    {
        $fields = self::customProfileFields();
        $skipped = [];

        foreach ($data as $name => $value) {
            if (!isset($fields[$name])) {
                $skipped[] = $name;

                continue;
            }

            $this->saveCustomProfileField($fields[$name], $this->sanitizeCustomFieldValue($fields[$name], $value), $userId);
        }

        return $skipped;
    }

    private function sanitizeCustomFieldValue($field, $value)
    {
        $isMultiValue = \in_array($field->type, self::MULTI_VALUE_FIELD_TYPES, true) || ($field->type === 'select' && !empty($field->multiple));

        if ($isMultiValue && !\is_array($value)) {
            $value = array_values(array_filter(array_map('trim', explode(',', (string) $value)), 'strlen'));
        }

        if (\is_array($value)) {
            return array_map('sanitize_text_field', $value);
        }

        return $field->type === 'textarea' ? sanitize_textarea_field($value) : sanitize_text_field($value);
    }

    private function saveCustomProfileField($field, $value, $userId)
    {
        if (self::hasCustomSaveFunction($field)) {
            \call_user_func($field->save_function, $userId, $field->name, $value, $field);

            return;
        }

        $userTableFields = (array) apply_filters('pmpro_user_table_fields', ['user_url']);

        if (\in_array($field->name, $userTableFields, true)) {
            wp_update_user(['ID' => $userId, $field->name => $field->name === 'user_url' ? esc_url_raw($value) : $value]);

            return;
        }

        if (isset($field->taxonomy) && !empty($field->taxonomy)) {
            $this->saveTaxonomyField($field, $value, $userId);

            return;
        }

        update_user_meta($userId, $field->meta_key, $value);
    }

    private static function hasCustomSaveFunction($field)
    {
        if (!isset($field->save_function) || !\is_callable($field->save_function)) {
            return false;
        }

        $saveFunction = $field->save_function;

        return !(\is_array($saveFunction) && ($saveFunction[0] ?? null) === $field);
    }

    private function saveTaxonomyField($field, $value, $userId)
    {
        $terms = [];

        foreach ((array) $value as $term) {
            if (is_numeric($term)) {
                $termObject = get_term_by('ID', $term, $field->taxonomy);

                if (!$termObject) {
                    continue;
                }

                $term = $termObject->name;
            }

            $terms[] = $term;
        }

        wp_set_object_terms($userId, $terms, $field->taxonomy, false);
        clean_object_term_cache($userId, $field->taxonomy);
        update_user_meta($userId, str_replace('pmprorhprefix_', '', $field->name), $value);
    }
}
