<?php

/**
 * Zoom Record Api
 */

namespace BitApps\Integrations\Actions\Zoom;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class RecordApiHelper
{
    private const PAGE_SIZE = 300;

    private const PAGE_LIMIT = 10;

    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function deleteMeetingRegistrant($meetingId, $finalData, $tokenDetails)
    {
        $email = $finalData['email'] ?? '';

        if (empty($email)) {
            return new WP_Error(Config::withPrefix('zoom_email_empty'), __('Email is required to delete an attendee', 'bit-integrations'));
        }

        $registrant = null;
        foreach (['approved', 'pending'] as $status) {
            $registrant = $this->findByEmail("https://api.zoom.us/v2/meetings/{$meetingId}/registrants", 'registrants', $email, $tokenDetails, ['status' => $status]);

            if ($registrant !== null) {
                break;
            }
        }

        if (is_wp_error($registrant)) {
            return $registrant;
        }

        if ($registrant === null) {
            // translators: %s: attendee email address
            return new WP_Error(Config::withPrefix('zoom_registrant_not_found'), wp_sprintf(__('No attendee found with email %s', 'bit-integrations'), $email));
        }

        $response = HttpHelper::request("https://api.zoom.us/v2/meetings/{$meetingId}/registrants/{$registrant->id}", 'DELETE', null, self::authHeader($tokenDetails));

        if (is_wp_error($response) || HttpHelper::$responseCode !== 204) {
            return $response;
        }

        return (object) [
            'message'       => __('Attendee deleted successfully', 'bit-integrations'),
            'registrant_id' => $registrant->id,
            'email'         => $email,
        ];
    }

    public function createMeetingRegistrant($meetingId, $data, $tokenDetails)
    {
        $data = \is_string($data) ? $data : wp_json_encode((object) $data);
        $createMeetingRegistrantEndpoint = 'https://api.zoom.us/v2/meetings/' . $meetingId . '/registrants';

        return HttpHelper::post($createMeetingRegistrantEndpoint, $data, self::authHeader($tokenDetails));
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->zoomField;

            // WP 5.1 compat: strpos() === 0 in place of str_starts_with() (WP 5.9)
            if (strpos($actionValue, 'custom_questions_') === 0 && $triggerValue === 'custom') {
                $dataFinal['custom_questions'][] = self::setCustomFieldMap(str_replace('custom_questions_', '', $value->zoomField), Common::replaceFieldWithValue($value->customValue, $data));
            } elseif (strpos($actionValue, 'custom_questions_') === 0) {
                $dataFinal['custom_questions'][] = self::setCustomFieldMap(str_replace('custom_questions_', '', $value->zoomField), $data[$triggerValue] ?? '');
            } elseif ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (isset($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function createUser($meetingId, $finalData, $tokenDetails)
    {
        $dataCreateUser = [
            'action'    => 'create',
            'user_info' => [
                'email'      => $finalData['email'] ?? '',
                'first_name' => $finalData['first_name'] ?? '',
                'last_name'  => $finalData['last_name'] ?? '',
                'type'       => 1
            ]
        ];
        $createUserEndpoint = 'https://api.zoom.us/v2/users';

        return HttpHelper::post($createUserEndpoint, wp_json_encode((object) $dataCreateUser), self::authHeader($tokenDetails));
    }

    public function deleteUser($finalData, $tokenDetails)
    {
        $email = $finalData['email'] ?? '';

        if (empty($email)) {
            return new WP_Error(Config::withPrefix('zoom_email_empty'), __('Email is required to delete a user', 'bit-integrations'));
        }

        $user = null;
        foreach (['active', 'pending', 'inactive'] as $status) {
            $user = $this->findByEmail('https://api.zoom.us/v2/users', 'users', $email, $tokenDetails, ['status' => $status]);

            if ($user !== null) {
                break;
            }
        }

        if (is_wp_error($user)) {
            return $user;
        }

        if ($user === null) {
            // translators: %s: user email address
            return new WP_Error(Config::withPrefix('zoom_user_not_found'), wp_sprintf(__('No Zoom user found with email %s', 'bit-integrations'), $email));
        }

        // Pending (invited) users come back with an empty id; Zoom accepts the email as userId instead.
        $userId = empty($user->id) ? $user->email : $user->id;
        $response = HttpHelper::request('https://api.zoom.us/v2/users/' . rawurlencode($userId), 'DELETE', null, self::authHeader($tokenDetails));

        if (is_wp_error($response) || HttpHelper::$responseCode !== 204) {
            return $response;
        }

        return (object) [
            'message' => __('User deleted successfully', 'bit-integrations'),
            'user_id' => $userId,
            'email'   => $email,
        ];
    }

    public function execute(
        $meetingId,
        $defaultDataConf,
        $fieldValues,
        $fieldMap,
        $actions,
        $tokenDetails,
        $selectedAction
    ) {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        switch ($selectedAction) {
            case 'Create Attendee':
                $apiResponse = $this->createMeetingRegistrant($meetingId, $finalData, $tokenDetails);

                break;
            case 'Delete Attendee':
                $apiResponse = $this->deleteMeetingRegistrant($meetingId, $finalData, $tokenDetails);

                break;
            case 'Create User':
                $apiResponse = $this->createUser($meetingId, $finalData, $tokenDetails);

                break;
            case 'Delete User':
                $apiResponse = $this->deleteUser($finalData, $tokenDetails);

                break;
            default:
                // translators: %s: action name
                $apiResponse = new WP_Error(Config::withPrefix('zoom_unknown_action'), wp_sprintf(__('Unknown Zoom action "%s"', 'bit-integrations'), $selectedAction));
        }

        if (is_wp_error($apiResponse)) {
            $apiResponse = (object) ['message' => $apiResponse->get_error_message()];
            LogHandler::save($this->_integrationID, ['type' => 'contact', 'type_name' => 'add-contact'], 'error', $apiResponse);
        } elseif (self::isErrorResponse($apiResponse)) {
            LogHandler::save($this->_integrationID, ['type' => 'contact', 'type_name' => 'add-contact'], 'error', $apiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'add-contact'], 'success', $apiResponse);
        }

        return $apiResponse;
    }

    private function findByEmail($endpoint, $listKey, $email, $tokenDetails, $query = [])
    {
        $nextPageToken = '';

        for ($page = 0; $page < self::PAGE_LIMIT; $page++) {
            $pageQuery = array_filter($query + ['page_size' => self::PAGE_SIZE, 'next_page_token' => $nextPageToken]);
            $response = HttpHelper::get($endpoint . '?' . http_build_query($pageQuery), null, self::authHeader($tokenDetails));

            if (is_wp_error($response)) {
                return $response;
            }

            if (!isset($response->{$listKey})) {
                return new WP_Error(Config::withPrefix('zoom_api_error'), $response->message ?? __('Unknown error from Zoom', 'bit-integrations'));
            }

            foreach ($response->{$listKey} as $item) {
                if (isset($item->email) && strcasecmp($item->email, $email) === 0) {
                    return $item;
                }
            }

            $nextPageToken = $response->next_page_token ?? '';

            if (empty($nextPageToken)) {
                break;
            }
        }

        return null;
    }

    private static function isErrorResponse($response)
    {
        if (HttpHelper::$responseCode >= 400) {
            return true;
        }

        return \is_object($response) && (property_exists($response, 'errors') || isset($response->code, $response->message));
    }

    private static function authHeader($tokenDetails)
    {
        return [
            'Authorization' => 'Bearer ' . $tokenDetails->access_token,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json'
        ];
    }

    private static function setCustomFieldMap($title, $value)
    {
        return (object) [
            'title' => $title,
            'value' => $value,
        ];
    }
}
