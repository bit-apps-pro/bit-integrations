<?php

namespace BitApps\Integrations\Actions\PaidMembershipPro;

use BitApps\Integrations\Core\Util\ActionUser;
use WP_Error;

class PaidMembershipProAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction ?? '';
        $selectedMembership = $integrationDetails->selectedMembership ?? '';

        if (empty($integId) || empty($mainAction)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('module, There is an some error.', 'bit-integrations'));
        }

        if (\in_array($mainAction, [PaidMembershipProService::ADD_MEMBERSHIP, PaidMembershipProService::REMOVE_MEMBERSHIP], true) && empty($selectedMembership)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Membership level is required.', 'bit-integrations'));
        }

        if ($mainAction === PaidMembershipProService::DIRECTORY_VISIBILITY && empty($integrationDetails->directoryVisibility)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Directory visibility is required.', 'bit-integrations'));
        }

        $userId = ActionUser::resolve($integrationDetails, $fieldValues);

        if (is_wp_error($userId)) {
            return $userId;
        }

        $recordApiHelper = new PaidMembershipProService($integrationDetails, $integId);

        return $recordApiHelper->execute(
            $mainAction,
            $selectedMembership,
            $userId,
            $fieldValues
        );
    }
}
