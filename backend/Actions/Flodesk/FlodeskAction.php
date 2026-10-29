<?php

namespace BitApps\Integrations\Actions\Flodesk;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class FlodeskAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'Flodesk',
        'fields'   => [],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return self::validationError($integId, __('Field map is required for Flodesk api', 'bit-integrations'));
        }

        $apiClient = FlodeskHelper::client($integrationDetails->connection_id ?? 0);

        if ($apiClient === null) {
            return self::validationError($integId, __('A Flodesk connection with an API Key is required', 'bit-integrations'));
        }

        return (new FlodeskService($integrationDetails, $integId, $apiClient))->execute($fieldValues, $fieldMap);
    }

    private static function validationError($integId, $message)
    {
        $error = new WP_Error('REQ_FIELD_EMPTY', $message);
        LogHandler::save($integId, 'record', 'validation', $error);

        return $error;
    }
}
