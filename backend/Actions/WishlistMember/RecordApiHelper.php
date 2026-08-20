<?php

/**
 * Wishlist Member Record Api
 */

namespace BitApps\Integrations\Actions\WishlistMember;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $integrationDetails;

    public function __construct($integId, $integrationDetails)
    {
        $this->_integrationID = $integId;
        $this->integrationDetails = $integrationDetails;
    }

    public function createLevel($finalData)
    {
        if (empty($finalData['name'])) {
            return [
                'success' => false,
                'ERROR'   => __('Level name is required field.', 'bit-integrations')
            ];
        }

        if (!\function_exists('wlmapi_create_level')) {
            return [
                'success' => false,
                'ERROR'   => __('WishlistMember API function not available.', 'bit-integrations')
            ];
        }

        return wlmapi_create_level($finalData);
    }

    public function updateLevel($finalData)
    {
        if (empty($finalData['name']) || empty($finalData['id'])) {
            return [
                'success' => false,
                'ERROR'   => __('Level id and name are required field.', 'bit-integrations')
            ];
        }

        $response = Hooks::apply(Config::withPrefix('wishlist_update_level'), false, $finalData);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_wishlist_update_level` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_wishlist_update_level', $response, $finalData);

        return self::handleFilterResponse($response);
    }

    public function deleteLevel($finalData)
    {
        if (empty($finalData['id'])) {
            return [
                'success' => false,
                'ERROR'   => __('Level id is required field.', 'bit-integrations')
            ];
        }

        $response = Hooks::apply(Config::withPrefix('wishlist_delete_level'), false, $finalData);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_wishlist_delete_level` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_wishlist_delete_level', $response, $finalData);

        return self::handleFilterResponse($response);
    }

    public function createMember($finalData)
    {
        if (empty($finalData['user_login']) || empty($finalData['user_email'])) {
            return [
                'success' => false,
                'ERROR'   => __('Username, email are required fields.', 'bit-integrations')
            ];
        }

        $levelId = null;

        if (isset($this->integrationDetails->level_id)) {
            $levelId = $this->integrationDetails->level_id;
        }

        $response = Hooks::apply(Config::withPrefix('wishlist_create_member'), false, $finalData, $levelId, $this->_integrationID);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_wishlist_create_member` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_wishlist_create_member', $response, $finalData, $levelId, $this->_integrationID);

        return self::handleFilterResponse($response);
    }

    public function handleMemberEvents($finalData, $event)
    {
        if (empty($finalData['user_email'])) {
            return [
                'success' => false,
                'ERROR'   => __('Email is a required field.', 'bit-integrations')
            ];
        }

        if ('update_member' === $event) {
            $response = Hooks::apply(Config::withPrefix('wishlist_update_member'), false, $finalData);

            /**
             * @deprecated 2.7.8 Use `bit_integrations_wishlist_update_member` filter instead.
             * @since 2.7.8
             */
            $response = Hooks::apply('btcbi_wishlist_update_member', $response, $finalData);
        } else {
            $response = Hooks::apply(Config::withPrefix('wishlist_delete_member'), false, $finalData);

            /**
             * @deprecated 2.7.8 Use `bit_integrations_wishlist_delete_member` filter instead.
             * @since 2.7.8
             */
            $response = Hooks::apply('btcbi_wishlist_delete_member', $response, $finalData);
        }

        return self::handleFilterResponse($response);
    }

    public function handleMemberAddOrRemoveFromLevel($finalData, $event)
    {
        if (empty($finalData['user_email']) || empty($this->integrationDetails->level_id)) {
            return [
                'success' => false,
                'ERROR'   => __('Email and level are required fields.', 'bit-integrations')
            ];
        }

        if ('add_member_to_level' === $event) {
            $response = Hooks::apply(Config::withPrefix('wishlist_add_member_to_level'), false, $finalData, $this->integrationDetails->level_id);

            /**
             * @deprecated 2.7.8 Use `bit_integrations_wishlist_add_member_to_level` filter instead.
             * @since 2.7.8
             */
            $response = Hooks::apply('btcbi_wishlist_add_member_to_level', $response, $finalData, $this->integrationDetails->level_id);
        } else {
            $response = Hooks::apply(Config::withPrefix('wishlist_remove_member_from_level'), false, $finalData, $this->integrationDetails->level_id);

            /**
             * @deprecated 2.7.8 Use `bit_integrations_wishlist_remove_member_from_level` filter instead.
             * @since 2.7.8
             */
            $response = Hooks::apply('btcbi_wishlist_remove_member_from_level', $response, $finalData, $this->integrationDetails->level_id);
        }

        return self::handleFilterResponse($response);
    }

    public function execute($fieldValues, $fieldMap, $action)
    {
        if (!WishlistMemberController::isPluginInstalled()) {
            return;
        }

        $finalData = static::setFieldMap($fieldMap, $fieldValues);

        switch ($action) {
            case 'create_level':
                $type = 'level';
                $type_name = 'Create Level';
                $recordApiResponse = $this->createLevel($finalData);

                break;

            case 'update_level':
                $type = 'level';
                $type_name = 'Update Level';
                $recordApiResponse = $this->updateLevel($finalData);

                break;

            case 'delete_level':
                $type = 'level';
                $type_name = 'Delete Level';
                $recordApiResponse = $this->deleteLevel($finalData);

                break;

            case 'create_member':
                $type = 'member';
                $type_name = 'Create Member';
                $recordApiResponse = $this->createMember($finalData);

                break;

            case 'update_member':
                $type = 'member';
                $type_name = 'Update Member';
                $recordApiResponse = $this->handleMemberEvents($finalData, 'update_member');

                break;

            case 'delete_member':
                $type = 'member';
                $type_name = 'Delete Member';
                $recordApiResponse = $this->handleMemberEvents($finalData, 'delete_member');

                break;

            case 'add_member_to_level':
                $type = 'member';
                $type_name = 'Add Member To Level';
                $recordApiResponse = $this->handleMemberAddOrRemoveFromLevel($finalData, 'add_member_to_level');

                break;

            case 'remove_member_from_level':
                $type = 'member';
                $type_name = 'Remove Member From Level';
                $recordApiResponse = $this->handleMemberAddOrRemoveFromLevel($finalData, 'remove_member_from_level');

                break;

            default:
                $type = 'record';
                $type_name = 'insert';
                $recordApiResponse = [
                    'success' => false,
                    'code'    => 'INVALID_ACTION',
                    // translators: %s: Placeholder value
                    'message' => wp_sprintf(__('The action %s is not supported.', 'bit-integrations'), $action),
                ];

                break;
        }

        $responseType = $recordApiResponse['success'] ? 'success' : 'error';

        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $type_name], $responseType, wp_json_encode($recordApiResponse));

        return $recordApiResponse;
    }

    private static function setFieldMap($fieldMap, $fieldValues)
    {
        $finalData = [];
        foreach ($fieldMap as $fieldPair) {
            if (empty($fieldPair->wishlistMemberField)) {
                continue;
            }

            $finalData[$fieldPair->wishlistMemberField] = ($fieldPair->formField == 'custom' && !empty($fieldPair->customValue))
            ? Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues)
            : $fieldValues[$fieldPair->formField];
        }

        return $finalData;
    }

    private static function handleFilterResponse($response)
    {
        if ($response !== false) {
            return $response;
        }

        return ['error' => wp_sprintf(__('Failed to connect to WishlistMember. Please check your configuration.', 'bit-integrations'))];
    }
}
