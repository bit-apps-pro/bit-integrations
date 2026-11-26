<?php

namespace BitApps\Integrations\Actions\Zoom;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Config;
use BitApps\Integrations\Flow\FlowController;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class ZoomAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'zoom',
        'fields'   => [
            'clientId'    => 'client_id',
            'clientSecret' => 'client_secret',
            'accessToken' => 'access_token',
            '__object'    => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $meetingId = $integrationDetails->id;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        $defaultDataConf = $integrationDetails->default;
        $selectedAction = $integrationDetails->selectedActions;

        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = ZoomHelper::normalizeConnectionToken($integrationDetails->tokenDetails);
        $oldToken = $tokenDetails->access_token ?? '';

        if (!$isConnectionAuth) {
            $tokenDetails = ZoomHelper::tokenExpiryCheck($tokenDetails, $integrationDetails->clientId, $integrationDetails->clientSecret);
        }

        if (!$tokenDetails) {
            $message = ZoomHelper::tokenRefreshFailedMessage();
            LogHandler::save($this->integrationID, ['type' => 'contact', 'type_name' => 'add-contact'], 'error', (object) ['message' => $message]);

            return new WP_Error(Config::withPrefix('zoom_token_refresh_failed'), $message);
        }

        if (!$isConnectionAuth && $tokenDetails->access_token !== $oldToken) {
            self::saveRefreshedToken($this->integrationID, $tokenDetails);
        }
        if (
            empty($meetingId)
            || empty($fieldMap)
            || empty($defaultDataConf)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Zoom'));
        }
        $recordApiHelper = new ZoomService($integrationDetails, $integId);
        $zoomApiResponse = $recordApiHelper->execute(
            $meetingId,
            $defaultDataConf,
            $fieldValues,
            $fieldMap,
            $actions,
            $tokenDetails,
            $selectedAction
        );

        if (is_wp_error($zoomApiResponse)) {
            return $zoomApiResponse;
        }

        return $zoomApiResponse;
    }

    private static function saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $zoomDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($zoomDetails)) {
            return;
        }

        $newDetails = json_decode($zoomDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
