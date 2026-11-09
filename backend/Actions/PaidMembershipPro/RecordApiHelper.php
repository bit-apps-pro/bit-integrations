<?php

namespace BitApps\Integrations\Actions\PaidMembershipPro;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    public const ADD_MEMBERSHIP = '1';

    public const REMOVE_MEMBERSHIP = '2';

    public const UPDATE_PROFILE = '3';

    public const DIRECTORY_VISIBILITY = '4';

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

    public function updateUserProfile($fieldValues, $userId)
    {
        $data = $this->generateReqDataFromFieldMap($fieldValues, $this->_integrationDetails->field_map ?? []);
        $response = Hooks::apply(Config::withPrefix('paid_membership_pro_update_profile'), self::proInactiveResponse(), $data, $userId, $this->_integrationDetails);

        $this->saveProResponse(['type' => 'update profile', 'type_name' => 'Update the user profile'], $response);
    }

    public function updateDirectoryVisibility($visibility, $userId)
    {
        $response = Hooks::apply(Config::withPrefix('paid_membership_pro_directory_visibility'), self::proInactiveResponse(), $visibility, $userId);

        $this->saveProResponse(['type' => 'directory visibility', 'type_name' => 'Show or hide the user in the member directory'], $response);
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

    private static function proInactiveResponse()
    {
        return [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];
    }

    private function saveProResponse($logType, $response)
    {
        $status = !empty($response['success']) ? 'success' : 'error';

        LogHandler::save($this->integrationID, wp_json_encode($logType), $status, wp_json_encode($response));
    }
}
