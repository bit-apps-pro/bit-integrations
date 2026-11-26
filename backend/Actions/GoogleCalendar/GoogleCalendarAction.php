<?php

namespace BitApps\Integrations\Actions\GoogleCalendar;

use BitApps\Integrations\Actions\GoogleCalendar\GoogleCalendarService as GoogleCalendarRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class GoogleCalendarAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'googlecalendar',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
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
        $actions = $integrationDetails->actions;
        $timeZone = $integrationDetails->timeZone;
        $fieldMap = $integrationDetails->field_map;
        $calendarId = $integrationDetails->calendarId;
        $reminderFieldMap = $integrationDetails->reminder_field_map;
        $descRichText = $integrationDetails->descRichText ?? '';
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = GoogleCalendarHelper::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);

        if (empty($tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'insert']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'GoogleCalendar'));

            return false;
        }

        $oldToken = $tokenDetails->access_token;

        if (!$isConnectionAuth) {
            $tokenDetails = GoogleCalendarHelper::tokenExpiryCheck(
                $tokenDetails,
                $integrationDetails->clientId ?? '',
                $integrationDetails->clientSecret ?? ''
            );

            if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
                // translators: %s: Service name
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'insert']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'GoogleCalendar'));

                return false;
            }

            if ($tokenDetails->access_token !== $oldToken) {
                GoogleCalendarHelper::saveRefreshedToken($this->integrationID, $tokenDetails);
            }
        }

        if (empty($fieldMap)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('Required fields not mapped', 'bit-integrations'));
            LogHandler::save($this->integrationID, 'record', 'validation', $error);

            return $error;
        }

        (new GoogleCalendarRecordApiHelper($tokenDetails->access_token, $calendarId, $timeZone))->executeRecordApi($this->integrationID, $fieldValues, $fieldMap, $reminderFieldMap, $actions, $descRichText);

        return true;
    }
}
