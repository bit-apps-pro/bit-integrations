<?php

/**
 * SureMembers Record Api
 */

namespace BitApps\Integrations\Actions\SureMembers;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use SureMembers\Inc\Access;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integId)
    {
        $this->_integrationID = $integId;
    }

    public function grantAccessToGroup($finalData, $selectedGroup)
    {
        if (empty($finalData['email']) || empty($selectedGroup)) {
            return ['success' => false, 'message' => __('Required field email or group is empty!', 'bit-integrations'), 'code' => 400];
        }

        $userId = self::getUserIdFromEmail($finalData['email']);

        if (!$userId) {
            return ['success' => false, 'message' => __('The user does not exist on your site, or the email is invalid!', 'bit-integrations'), 'code' => 400];
        }

        Access::grant($userId, $selectedGroup);

        return ['success' => true];
    }

    public function revokeAccessFromGroup($finalData, $selectedGroup)
    {
        if (empty($finalData['email']) || empty($selectedGroup)) {
            return ['success' => false, 'message' => __('Required field email or group is empty!', 'bit-integrations'), 'code' => 400];
        }

        $userId = self::getUserIdFromEmail($finalData['email']);

        if (!$userId) {
            return ['success' => false, 'message' => __('The user does not exist on your site, or the email is invalid!', 'bit-integrations'), 'code' => 400];
        }

        Access::revoke($userId, $selectedGroup);

        return ['success' => true];
    }

    public static function getUserIdFromEmail($email)
    {
        if (empty($email) || !is_email($email) || !email_exists($email)) {
            return false;
        }

        $get_user = get_user_by('email', $email);

        return $get_user->ID;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->sureMembersField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $selectedTask, $selectedGroup)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        $responseMessage = $taskType = '';

        if ($selectedTask === 'grantAccess') {
            $response = $this->grantAccessToGroup($finalData, $selectedGroup);
            $responseMessage = 'User added to the access group.';
            $taskType = 'Grant Access';
        } elseif ($selectedTask === 'revokeAccess') {
            $response = $this->revokeAccessFromGroup($finalData, $selectedGroup);
            $responseMessage = 'User removed from the access group.';
            $taskType = 'Revoke Access';
        }

        if ($response['success']) {
            $res = ['message' => $responseMessage];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Access Group', 'type_name' => $taskType]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Access Group', 'type_name' => 'Grant or revoke access']), 'error', wp_json_encode($response));
        }

        return $response;
    }
}
