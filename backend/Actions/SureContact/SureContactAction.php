<?php

namespace BitApps\Integrations\Actions\SureContact;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class SureContactAction
{
    /**
     * Credentials are read off the connection by the client, so nothing needs
     * flattening onto flow_details or the request params. The slug is still declared —
     * client() passes it to getConnectionHandler(), which rejects another app's connection_id.
     */
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'SureContact',
        'fields'   => [],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return self::validationError($integId, __('Field map is required for SureContact api', 'bit-integrations'));
        }

        $client = SureContactHelper::client($integrationDetails->connection_id ?? 0);

        if ($client === null) {
            return self::validationError($integId, __('A SureContact connection with an API Key is required', 'bit-integrations'));
        }

        return (new SureContactService($integrationDetails, $integId, $client))->execute($fieldValues, $fieldMap);
    }

    private static function validationError($integId, $message)
    {
        $error = new WP_Error('REQ_FIELD_EMPTY', $message);
        LogHandler::save($integId, 'record', 'validation', $error);

        return $error;
    }
}
