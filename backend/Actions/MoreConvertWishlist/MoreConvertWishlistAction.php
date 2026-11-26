<?php

namespace BitApps\Integrations\Actions\MoreConvertWishlist;

use WP_Error;

class MoreConvertWishlistAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new MoreConvertWishlistService($integrationDetails, $integId);
        $moreConvertWishlistResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($moreConvertWishlistResponse)) {
            return $moreConvertWishlistResponse;
        }

        return $moreConvertWishlistResponse;
    }
}
