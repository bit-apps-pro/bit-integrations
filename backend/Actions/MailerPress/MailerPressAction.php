<?php

namespace BitApps\Integrations\Actions\MailerPress;

use BitApps\Integrations\Core\Util\Helper;
use WP_Error;

class MailerPressAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $mainAction = $integrationDetails->mainAction ?? '';
        $lists = Helper::convertStringToArray($integrationDetails->lists ?? []);
        $tags = Helper::convertStringToArray($integrationDetails->tags ?? []);

        if (empty($fieldMap)) {
            // translators: %s: Integration name
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('Field map is required for %s api', 'bit-integrations'), 'MailerPress'));
        }

        $recordApiHelper = new MailerPressService($integId);

        $mailerPressApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $lists,
            $tags,
            $mainAction
        );

        if (is_wp_error($mailerPressApiResponse)) {
            return $mailerPressApiResponse;
        }

        return $mailerPressApiResponse;
    }
}
