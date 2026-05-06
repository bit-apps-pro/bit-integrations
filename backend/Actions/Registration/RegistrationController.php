<?php

namespace BitApps\Integrations\Actions\Registration;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Flow\Flow;
use BitApps\Integrations\Log\LogHandler;

final class RegistrationController
{
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
        $userFieldMap = $flowDetails->user_map;

        $specialTagValue = Flow::specialTagMappingValue($userFieldMap);
        $updatedvalues = $specialTagValue + $fieldValues;

        $userData = $this->userFieldMapping($userFieldMap, $updatedvalues, $flowDetails);

        if (isset($flowDetails->user_role)) {
            $userData['role'] = $flowDetails->user_role;
        }

        if (isset($flowDetails->action_type) && $flowDetails->action_type == 'updated_user') {
            $this->updateUser($userData, $flowDetails, $updatedvalues);
        } elseif (isset($flowDetails->action_type) && $flowDetails->action_type == 'new_user') {
            $this->createUser($userData, $flowDetails, $updatedvalues);
        }
    }

    private function userFieldMapping($user_map, $fieldValues, $flowDetails)
    {
        $fieldData = [];
        foreach ($user_map as $fieldPair) {
            if (!empty($fieldPair->userField) && !empty($fieldPair->formField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->userField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                } else {
                    $fieldData[$fieldPair->userField] = $fieldValues[$fieldPair->formField];
                }
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
