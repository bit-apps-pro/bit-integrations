<?php

namespace BitApps\Integrations\Actions\Line;

use BitApps\Integrations\Authorization\AuthorizationType;

class LineController
{
    public const APIENDPOINT = 'https://api.line.me/v2/bot';

    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'line',
        'fields'   => [
            'accessToken' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integrationId = $integrationData->id;
        $access_token = $integrationDetails->accessToken;
        $recordApiHelper = new RecordApiHelper(self::APIENDPOINT, $access_token, $integrationId);

        return $recordApiHelper->execute($integrationDetails, $fieldValues);
    }
}
