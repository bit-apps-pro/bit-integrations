<?php

namespace BitApps\Integrations\Actions\GoogleSheet;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class GoogleSheetAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'googlesheet',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function resolveTokenDetails($integrationDetails, $integrationID = null)
    {
        $tokenDetails = GoogleSheetHelper::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);

        if (!empty($integrationDetails->connection_id)) {
            return $tokenDetails;
        }

        if ((\intval($tokenDetails->generates_on) + (55 * 60)) >= time()) {
            return $tokenDetails;
        }

        $newTokenDetails = GoogleSheetHelper::refreshAccessToken((object) [
            'clientId'     => $integrationDetails->clientId ?? '',
            'clientSecret' => $integrationDetails->clientSecret ?? '',
            'tokenDetails' => $tokenDetails,
        ]);

        if (!$newTokenDetails) {
            return $tokenDetails;
        }

        if (!empty($integrationID)) {
            GoogleSheetHelper::saveRefreshedToken($integrationID, $newTokenDetails);
        }

        return $newTokenDetails;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $mainAction = empty($integrationDetails->mainAction) ? 'insertRow' : $integrationDetails->mainAction;

        if ($mainAction === 'insertRow'
            && (empty($integrationDetails->spreadsheetId)
                || empty($integrationDetails->worksheetName)
                || empty($integrationDetails->field_map))
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Google sheet'));
        }

        $integrationDetails->tokenDetails = self::resolveTokenDetails($integrationDetails, $this->_integrationID);

        return (new GoogleSheetService($integrationDetails, $this->_integrationID))->execute($fieldValues, $mainAction);
    }
}
