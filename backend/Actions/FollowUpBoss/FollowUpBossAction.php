<?php

namespace BitApps\Integrations\Actions\FollowUpBoss;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class FollowUpBossAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'FollowUpBoss',
        'fields'   => [],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $client = FollowUpBossHelper::client($integrationDetails->connection_id ?? 0);

        if (\is_string($client)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', $client);
            LogHandler::save($integId, 'record', 'validation', $error);

            return $error;
        }

        return (new FollowUpBossService($integrationDetails, $integId, $client))->execute($fieldValues, $integrationDetails->field_map ?? []);
    }
}
