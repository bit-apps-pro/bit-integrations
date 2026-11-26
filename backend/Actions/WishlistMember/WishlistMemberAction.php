<?php

namespace BitApps\Integrations\Actions\WishlistMember;

use WP_Error;

class WishlistMemberAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $action = $integrationDetails->action;

        if (empty($fieldMap) || empty($action)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Wishlist Member'));
        }

        $recordApiHelper = new WishlistMemberService($integId, $integrationDetails);

        return $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $action
        );
    }
}
