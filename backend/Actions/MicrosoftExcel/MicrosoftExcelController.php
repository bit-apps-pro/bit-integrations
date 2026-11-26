<?php

namespace BitApps\Integrations\Actions\MicrosoftExcel;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class MicrosoftExcelController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'MicrosoftExcel',
        'fields'   => [],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $client = MicrosoftExcelHelper::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('A Microsoft Excel connection is required', 'bit-integrations'));
            LogHandler::save($integId, ['type' => 'MicrosoftExcel', 'type_name' => $integrationDetails->mainAction ?? ''], 'validation', $error);

            return $error;
        }

        return (new MicrosoftExcelService($integrationDetails, $integId, $client))->execute($fieldValues, $integrationDetails->field_map ?? []);
    }
}
