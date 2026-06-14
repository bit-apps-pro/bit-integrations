<?php

namespace BitApps\Integrations\controller;

use BitApps\Integrations\Core\Database\AuthModel;
use BitApps\Integrations\Core\Util\Capabilities;

final class AuthDataController
{
    public function saveAuthData($requestParams)
    {
        self::ensurePermission(['manage_options', 'bit_integrations_manage_integrations', 'bit_integrations_create_integrations']);

        if (empty($requestParams->actionName) || empty($requestParams->tokenDetails) || empty($requestParams->userInfo)) {
            wp_send_json_error(['error' => 'Requested Parameters are empty']);
        }

        $tokenDetails = wp_json_encode($requestParams->tokenDetails);
        $userInfo = wp_json_encode($requestParams->userInfo);

        $sanitizedActionName = sanitize_text_field($requestParams->actionName);
        $sanitizedUserEmailAddress = sanitize_text_field($requestParams->userInfo->user->emailAddress);
        $sanitizedTokenDetails = sanitize_text_field($tokenDetails);
        $sanitizedUserInfo = sanitize_text_field($userInfo);

        if (empty($sanitizedActionName) || empty($sanitizedTokenDetails) || empty($sanitizedUserInfo) || empty($sanitizedUserEmailAddress)) {
            wp_send_json_error(['error' => 'Requested Parameters are empty']);
        }

        $emailExists = $this->checkAuthDataExist($sanitizedActionName, $sanitizedUserEmailAddress);

        if (!$emailExists) {
            $authModel = new AuthModel();
            $authModel->insert(
                [
                    'action_name'  => $sanitizedActionName,
                    'tokenDetails' => $sanitizedTokenDetails,
                    'userInfo'     => $sanitizedUserInfo,
                    'created_at'   => current_time('mysql')
                ]
            );

            return $this->getAuthData($sanitizedActionName);
        }
        wp_send_json_success(['error' => 'Email address exists.']);
    }

    public function getAuthData($request)
    {
        self::ensurePermission(['manage_options', 'bit_integrations_manage_integrations', 'bit_integrations_view_integrations', 'bit_integrations_create_integrations', 'bit_integrations_edit_integrations']);

        $actionName = sanitize_text_field(\is_object($request) ? ($request->actionName ?? '') : (\is_scalar($request) ? (string) $request : ''));
        if (empty($actionName)) {
            wp_send_json_error('Action name is not available');
            exit;
        }

        $authModel = new AuthModel();
        $result = $authModel->get(
            [
                'id',
                'action_name',
                'tokenDetails',
                'userInfo',
            ],
            ['action_name' => $actionName]
        );

        if (is_wp_error($result)) {
            wp_send_json_success(['data' => []]);
            exit;
        }

        foreach ($result as $item) {
            $item->tokenDetails = json_decode($item->tokenDetails, true);
            $item->userInfo = json_decode($item->userInfo, true);
        }

        wp_send_json_success(['data' => $result]);
        exit;
    }

    public function getAuthDataById($request)
    {
        self::ensurePermission(['manage_options', 'bit_integrations_manage_integrations', 'bit_integrations_view_integrations', 'bit_integrations_create_integrations', 'bit_integrations_edit_integrations']);

        $id = absint($request->id);
        if (empty($id)) {
            wp_send_json_error('Action name is not available');
            exit;
        }

        $authModel = new AuthModel();
        $result = $authModel->get(
            [
                'id',
                'action_name',
                'tokenDetails',
                'userInfo',
            ],
            ['id' => $id]
        );

        if (is_wp_error($result)) {
            wp_send_json_error(['data' => []]);
            exit;
        }

        foreach ($result as $item) {
            $item->tokenDetails = json_decode($item->tokenDetails, true);
            $item->userInfo = json_decode($item->userInfo, true);
        }

        wp_send_json_success(['data' => $result]);
        exit;
    }

    public function deleteAuthData($request)
    {
        self::ensurePermission(['manage_options', 'bit_integrations_manage_integrations', 'bit_integrations_delete_integrations']);

        $id = absint(\is_object($request) ? ($request->id ?? 0) : (\is_scalar($request) ? $request : 0));
        if (empty($id)) {
            wp_send_json_error(__('Invalid credential id', 'bit-integrations'));
        }

        $authModel = new AuthModel();
        $result = $authModel->delete(['id' => $id]);

        if (is_wp_error($result)) {
            wp_send_json_error(__('Failed to delete credential', 'bit-integrations'));
        }

        wp_send_json_success(__('Credential deleted successfully', 'bit-integrations'));
    }

    private static function ensurePermission(array $capabilities)
    {
        foreach ($capabilities as $capability) {
            if (Capabilities::Check($capability)) {
                return;
            }
        }

        wp_send_json_error(__("User don't have permission to access this page", 'bit-integrations'));
    }

    public function checkAuthDataExist($actionName, $emailAddress)
    {
        $authModel = new AuthModel();
        $result = $authModel->get(
            [
                'id',
                'action_name',
                'userInfo',
            ],
            ['action_name' => $actionName]
        );

        if (is_wp_error($result)) {
            return false;
        }

        foreach ($result as $item) {
            $item->userInfo = json_decode($item->userInfo, true);

            if (!empty($item->userInfo['user']['emailAddress']) && $item->userInfo['user']['emailAddress'] === $emailAddress) {
                return $emailExists = true;
            }
        }

        return false;
    }
}
