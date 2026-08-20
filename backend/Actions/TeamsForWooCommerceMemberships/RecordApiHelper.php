<?php

/**
 * Teams for WooCommerce Memberships Record Api
 */

namespace BitApps\Integrations\Actions\TeamsForWooCommerceMemberships;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $mainAction)
    {
        if (!\function_exists('wc_memberships_for_teams')) {
            return [
                'success' => false,
                'message' => __('Teams for WooCommerce Memberships is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        if (!empty($this->_integrationDetails->selectedTeam)) {
            $fieldData['team_id'] = $this->_integrationDetails->selectedTeam;
        }
        if (!empty($this->_integrationDetails->selectedMemberRole)) {
            $fieldData['member_role'] = $this->_integrationDetails->selectedMemberRole;
        }

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'add_member_to_team':
                $response = Hooks::apply(Config::withPrefix('teams_for_wc_memberships_add_member'), $defaultResponse, $fieldData, $this->_integrationDetails);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_teams_for_wc_memberships_add_member` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_teams_for_wc_memberships_add_member', $response, $fieldData, $this->_integrationDetails);
                $type = 'team_member';
                $actionType = 'add_member_to_team';

                break;

            case 'remove_member_from_team':
                $response = Hooks::apply(Config::withPrefix('teams_for_wc_memberships_remove_member'), $defaultResponse, $fieldData, $this->_integrationDetails);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_teams_for_wc_memberships_remove_member` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_teams_for_wc_memberships_remove_member', $response, $fieldData, $this->_integrationDetails);
                $type = 'team_member';
                $actionType = 'remove_member_from_team';

                break;

            case 'invite_user_to_team':
                $response = Hooks::apply(Config::withPrefix('teams_for_wc_memberships_invite_user'), $defaultResponse, $fieldData, $this->_integrationDetails);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_teams_for_wc_memberships_invite_user` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_teams_for_wc_memberships_invite_user', $response, $fieldData, $this->_integrationDetails);
                $type = 'team_invitation';
                $actionType = 'invite_user_to_team';

                break;

            case 'update_member_role':
                $response = Hooks::apply(Config::withPrefix('teams_for_wc_memberships_update_role'), $defaultResponse, $fieldData, $this->_integrationDetails);

                /**
                 * @deprecated 2.7.8 Use `bit_integrations_teams_for_wc_memberships_update_role` filter instead.
                 * @since 2.7.8
                 */
                $response = Hooks::apply('btcbi_teams_for_wc_memberships_update_role', $response, $fieldData, $this->_integrationDetails);
                $type = 'team_member';
                $actionType = 'update_member_role';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'TeamsForWooCommerceMemberships';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->teamsForWooCommerceMembershipsField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue) ? Common::replaceFieldWithValue($item->customValue, $fieldValues) : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
