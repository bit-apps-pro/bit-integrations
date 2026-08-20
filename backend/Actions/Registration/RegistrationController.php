<?php

namespace BitApps\Integrations\Actions\Registration;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Flow\Flow;
use BitApps\Integrations\Log\LogHandler;

final class RegistrationController
{
    /**
     * wp_insert_user / wp_update_user fields a form submission is allowed to set.
     * Deliberately excludes `role` (handled separately, admin-static only) and any
     * capability/level field, so a mapped form value can never grant privileges.
     *
     * @var string[]
     */
    private const ALLOWED_USER_FIELDS = [
        'user_pass', 'user_login', 'user_nicename', 'user_url', 'user_email',
        'display_name', 'nickname', 'first_name', 'last_name', 'description',
        'rich_editing', 'syntax_highlighting', 'comment_shortcuts', 'admin_color',
        'use_ssl', 'user_registered', 'show_admin_bar_front', 'locale',
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function createUser($userData, $flowDetails, $fieldValues)
    {
        $validationErrorMsg = $this->validationErrorMessage($userData);
        if (!empty($validationErrorMsg)) {
            LogHandler::save($this->_integrationID, 'User create', 'error', $validationErrorMsg);

            return;
        }
        $userId = wp_insert_user($userData);
        if (is_wp_error($userId) || !$userId) {
            $message = is_wp_error($userId) ? $userId->get_error_message() : 'error';

            LogHandler::save($this->_integrationID, __('New user registration', 'bit-integrations'), 'error', $message);
        } else {
            // translators: %s: Placeholder value
            LogHandler::save($this->_integrationID, __('New user registration', 'bit-integrations'), 'success', wp_sprintf(__('New user created successfully, user id : %s', 'bit-integrations'), $userId));

            $this->saveMetaData($flowDetails->meta_map, $fieldValues, $userId);

            $this->notification($flowDetails, $userId);

            if (isset($flowDetails->auto_login)) {
                wp_set_current_user($userId);
                wp_set_auth_cookie($userId);
            }
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $flowDetails = $integrationData->flow_details;
        $actionType = isset($flowDetails->action_type) ? $flowDetails->action_type : 'new_user';

        if (!\in_array($actionType, ['new_user', 'updated_user'], true)) {
            $this->executeWordPressUserAction($flowDetails, $fieldValues, $actionType);

            return;
        }

        $userFieldMap = $flowDetails->user_map;

        $specialTagValue = Flow::specialTagMappingValue($userFieldMap);
        $updatedvalues = $specialTagValue + $fieldValues;

        $userData = $this->userFieldMapping($userFieldMap, $updatedvalues, $flowDetails);

        if (isset($flowDetails->user_role)) {
            $userData['role'] = $flowDetails->user_role;
        }

        if ($actionType === 'updated_user') {
            $this->updateUser($userData, $flowDetails, $updatedvalues);
        } else {
            $this->createUser($userData, $flowDetails, $updatedvalues);
        }
    }

    private function executeWordPressUserAction($flowDetails, $fieldValues, $actionType)
    {
        $defaultResponse = [
            'success' => false,
            'message' => wp_sprintf(
                // translators: %s: Plugin name
                __('%s plugin is not installed or activated', 'bit-integrations'),
                'Bit Integrations Pro'
            ),
        ];

        $response = Hooks::apply(
            Config::withPrefix($actionType),
            $defaultResponse,
            $this->buildRequestDataFromUserMap(isset($flowDetails->user_map) ? $flowDetails->user_map : [], $fieldValues),
        );

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'WP User Registration', 'type_name' => $actionType], $responseType, $response);
    }

    private function buildRequestDataFromUserMap($userMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($userMap as $mapItem) {
            if (empty($mapItem->formField) || empty($mapItem->userField)) {
                continue;
            }

            $triggerValue = $mapItem->formField;
            $actionValue = $mapItem->userField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($mapItem->customValue)
                ? Common::replaceFieldWithValue($mapItem->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }

    private function userFieldMapping($user_map, $fieldValues, $flowDetails)
    {
        $fieldData = [];
        foreach ($user_map as $fieldPair) {
            if (empty($fieldPair->userField) || empty($fieldPair->formField)) {
                continue;
            }

            $userField = $fieldPair->userField;
            $isStatic  = ($fieldPair->formField === 'custom' && isset($fieldPair->customValue));

            // Role is a privilege boundary: only honour it as a static admin literal
            // naming a real role — never a form-field value or an interpolated token,
            // which would let a submitter pick their own role.
            if ($this->isRoleField($userField)) {
                $role = $isStatic ? $this->resolveStaticRole($fieldPair->customValue) : '';
                if ($role !== '') {
                    $fieldData['role'] = $role;
                }

                continue;
            }

            // Drop anything outside the safe wp_insert_user field set (blocks
            // wp_capabilities, user_level, and similar capability-granting keys).
            if (!\in_array($userField, self::ALLOWED_USER_FIELDS, true)) {
                continue;
            }

            if ($isStatic) {
                $fieldData[$userField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
            } else {
                $fieldData[$userField] = $fieldValues[$fieldPair->formField];
            }
        }
        if (isset($flowDetails->action_type) && $flowDetails->action_type === 'updated_user') {
            unset($fieldData['user_login']);

            return $fieldData;
        }

        if (!empty($fieldData['user_email']) && empty($fieldData['user_login'])) {
            $fieldData['user_login'] = $fieldData['user_email'];
        }

        if (empty($fieldData['user_pass']) && $flowDetails->action_type !== 'updated_user') {
            $fieldData['user_pass'] = wp_generate_password(24);
        }

        return $fieldData;
    }

    private function isRoleField($field)
    {
        return \in_array(strtolower((string) $field), ['role', 'roles'], true);
    }

    /**
     * Accept a role only when it is a plain static literal (no `${...}` form token)
     * that names a currently-registered role. Returns '' otherwise.
     *
     * @param mixed $customValue
     *
     * @return string
     */
    private function resolveStaticRole($customValue)
    {
        if (!\is_string($customValue) || $customValue === '' || strpos($customValue, '${') !== false) {
            return '';
        }

        $role  = strtolower(trim($customValue));
        $roles = function_exists('wp_roles') ? wp_roles() : null;

        return ($roles && $roles->is_role($role)) ? $role : '';
    }

    /**
     * Whether a user-meta key would grant capabilities or a user level, in which
     * case a form-mapped value must never be written to it.
     *
     * @param string $metaKey
     *
     * @return bool
     */
    private function isProtectedMetaKey($metaKey)
    {
        global $wpdb;

        $key     = strtolower((string) $metaKey);
        $blocked = [
            'wp_capabilities', strtolower($wpdb->prefix . 'capabilities'),
            'wp_user_level', strtolower($wpdb->prefix . 'user_level'),
            'user_level', 'session_tokens',
        ];

        if (\in_array($key, $blocked, true)) {
            return true;
        }

        return (bool) preg_match('/(^|_)(capabilities|user_level)$/', $key);
    }

    private function userMetaMapping($user_map, $fieldValues)
    {
        $mappingField = [];
        foreach ($user_map as $fieldKey => $fieldPair) {
            if (property_exists($fieldPair, 'metaField')) {
                $mappingField[$fieldKey]['name'] = $fieldPair->metaField;
                if (!empty($fieldPair->metaField) && !empty($fieldPair->formField)) {
                    if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                        $mappingField[$fieldKey]['value'] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                    } else {
                        $mappingField[$fieldKey]['value'] = $fieldValues[$fieldPair->formField];
                    }
                }
            }
        }

        return $mappingField;
    }

    private function notification($flowDetails, $userId)
    {
        if (isset($flowDetails->user_notify)) {
            wp_new_user_notification($userId, null, 'user');
        }

        if (isset($flowDetails->admin_notify)) {
            wp_new_user_notification($userId, null, 'admin');
        }
    }

    private function saveMetaData($metaFldMap, $fieldValues, $user)
    {
        $metaFields = $this->userMetaMapping($metaFldMap, $fieldValues);
        if (\count($metaFields) > 0) {
            foreach ($metaFields as $meta) {
                if (isset($meta['name']) && (isset($meta['value']))) {
                    $metaKey = $meta['name'];
                    // Never let a form-mapped meta value grant capabilities or a level.
                    if ($this->isProtectedMetaKey($metaKey)) {
                        continue;
                    }
                    $metaValue = \is_string($meta['value']) ? trim($meta['value']) : $meta['value'];
                    if (metadata_exists('user', $user, $metaKey)) {
                        update_user_meta($user, $metaKey, $metaValue);
                    } else {
                        add_user_meta($user, $metaKey, $metaValue);
                    }
                }
            }
        }
    }

    private function validationErrorMessage($user)
    {
        $message = '';
        if (isset($user['user_login']) && username_exists($user['user_login'])) {
            $message = __('This username is already registered. Please choose another one.', 'bit-integrations');
        } elseif (isset($user['user_email']) && email_exists($user['user_email'])) {
            $message = __('This email  is already registered. Please choose another one.', 'bit-integrations');
        }

        return $message;
    }

    private function updateUser($updatedData, $flowDetails, $fieldValues)
    {
        $userId = get_current_user_id();
        if (!$userId) {
            LogHandler::save($this->_integrationID, __('User update', 'bit-integrations'), 'error', __('You are not logged in.', 'bit-integrations'));

            return;
        }
        $updatedData['ID'] = $userId;
        $updatedUser = wp_update_user($updatedData);

        if (is_wp_error($updatedUser) || !$updatedUser) {
            $message = is_wp_error($updatedUser) ? $updatedUser->get_error_message() : 'error';
            LogHandler::save($this->_integrationID, __('User update', 'bit-integrations'), 'error', $message);
        } else {
            // translators: %s: Placeholder value
            LogHandler::save($this->_integrationID, __('User update', 'bit-integrations'), 'success', wp_sprintf(__('User updated successfully, user id : %s', 'bit-integrations'), $updatedUser));
            $this->saveMetaData($flowDetails->meta_map, $fieldValues, $updatedUser);
            $this->notification($flowDetails, $updatedUser);
        }
    }
}
