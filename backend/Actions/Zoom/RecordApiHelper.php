<?php

/**
 * Zoom Record Api
 */

namespace BitApps\Integrations\Actions\Zoom;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, upsert
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function deleteMeetingRegistrant($meetingId, $finalData, $tokenDetails)
    {
        $header = [
            'Authorization' => 'Bearer ' . $tokenDetails->access_token,
            'Content-Type'  => 'application/json'
        ];
        $endPoint = "https://api.zoom.us/v2/meetings/{$meetingId}/registrants";

        $getRegistrants = HttpHelper::get($endPoint, null, $header);

        // get registrant id using email from getRegistrants
        $registrantId = null;
        foreach ($getRegistrants->registrants as $registrant) {
            if ($registrant->email == $finalData['email']) {
                $registrantId = $registrant->id;

                break;
            }
        }
        // delete registrant using registrant id
        if ($registrantId !== null) {
            $headerDel = [
                'Authorization' => 'Bearer ' . $tokenDetails->access_token,
                'Content-Type'  => 'application/json'
            ];
            $endPointDelete = "https://api.zoom.us/v2/meetings/{$meetingId}/registrants/{$registrantId}";
            HttpHelper::request($endPointDelete, 'DELETE', null, $headerDel);
        }
    }

    public function createMeetingRegistrant($meetingId, $data, $tokenDetails)
    {
        $data = \is_string($data) ? $data : wp_json_encode((object) $data);
        $header['Authorization'] = 'Bearer ' . $tokenDetails->access_token;
        $header['Content-Type'] = 'application/json';
        $createMeetingRegistrantEndpoint = 'https://api.zoom.us/v2/meetings/' . $meetingId . '/registrants';

        return HttpHelper::post($createMeetingRegistrantEndpoint, $data, $header);
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
                $dataFinal['custom_questions'][] = self::setCustomFieldMap(str_replace('custom_questions_', '', $value->zoomField), $data[$triggerValue]);
            } elseif ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
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
                'email'      => $finalData['email'],
                'first_name' => $finalData['first_name'],
                'last_name'  => $finalData['last_name'],
                'type'       => 1
            ]
        ];
        $data = \is_string($dataCreateUser) ? $dataCreateUser : wp_json_encode((object) $dataCreateUser);
        $header['Authorization'] = 'Bearer ' . $tokenDetails->access_token;
        $header['Content-Type'] = 'application/json';
        $createUserEndpoint = 'https://api.zoom.us/v2/users';

        return HttpHelper::post($createUserEndpoint, $data, $header);
    }

    public function deleteUser($finalData, $tokenDetails)
    {
        $header = [
            'Authorization' => 'Bearer ' . $tokenDetails->access_token,
            'Content-Type'  => 'application/json'
        ];
        $endPoint = 'https://api.zoom.us/v2/users';

        $getAllUsers = HttpHelper::get($endPoint, null, $header);
        $userId = null;
        foreach ($getAllUsers->users as $user) {
            if ($user->email == $finalData['email']) {
                $userId = $user->id;

                break;
            }
        }

        if ($userId !== null) {
            $headerDel = [
                'Authorization' => 'Bearer ' . $tokenDetails->access_token,
                'Content-Type'  => 'application/json'
            ];
            $endPointDelete = "https://api.zoom.us/v2/users/{$userId}";
            HttpHelper::request($endPointDelete, 'DELETE', null, $headerDel);
        }
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
        $fieldData = [];
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = null;
        if ($selectedAction === 'Delete User') {
            $this->deleteUser($finalData, $tokenDetails);
            $apiResponse = __('User deleted successfully', 'bit-integrations');
        }

        // Delete registrant if email is present in the form
        if ($selectedAction === 'Delete Attendee') {
            $this->deleteMeetingRegistrant($meetingId, $finalData, $tokenDetails);
            $apiResponse = __('Attendee deleted successfully', 'bit-integrations');
        }

        // Create user
        if ($selectedAction === 'Create User') {
            $apiResponse = $this->createUser($meetingId, $finalData, $tokenDetails);
        }

        // api response show but it was shown when registance created
        if ($selectedAction === 'Create Attendee') {
            $apiResponse = $this->createMeetingRegistrant($meetingId, $finalData, $tokenDetails);
        }
        if (property_exists($apiResponse, 'errors')) {
            LogHandler::save($this->_integrationID, ['type' => 'contact', 'type_name' => 'add-contact'], 'error', $apiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'add-contact'], 'success', $apiResponse);
        }

        return $apiResponse;
    }

    private static function setCustomFieldMap($title, $value)
    {
        return (object) [
            'title' => $title,
            'value' => $value,
        ];
    }
}
