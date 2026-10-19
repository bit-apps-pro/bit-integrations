<?php

namespace BitApps\Integrations\Actions\MailMint;

use WP_Error;

class MailMintAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            // translators: %s: Integration name

            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mail Mint'));
        }
        $recordApiHelper = new MailMintService($integrationDetails, $integId);
        $mailMintApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );

        if (is_wp_error($mailMintApiResponse)) {
            return $mailMintApiResponse;
        }

        return $mailMintApiResponse;
    }
}
