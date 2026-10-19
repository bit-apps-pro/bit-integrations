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
        $mainAction = $integrationDetails->mainAction;
        $selectedMembership = $integrationDetails->selectedMembership;
        if (
            empty($integId)
            || empty($mainAction) || empty($selectedMembership)
        ) {
            return new WP_Error('REQ_FIELD_EMPTY', __('module, There is an some error.', 'bit-integrations'));
        }
        $userId = ActionUser::resolve($integrationDetails, $fieldValues);

        if (is_wp_error($userId)) {
            return $userId;
        }

        $recordApiHelper = new PaidMembershipProService($integrationDetails, $integId);
        $paidMemberpressApiResponse = $recordApiHelper->execute(
            $mainAction,
            $selectedMembership,
            $userId
        );

        if (is_wp_error($paidMemberpressApiResponse)) {
            return $paidMemberpressApiResponse;
        }

        return $paidMemberpressApiResponse;
    }
}
