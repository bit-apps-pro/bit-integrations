<?php

/**
 * trello Record Api
 */

namespace BitApps\Integrations\Actions\Affiliate;

use BitApps\Integrations\Core\Util\ActionUser;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private static $integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        self::$integrationID = $integId;
    }

    public static function getIntegrationId()
    {
        return $integrationID = self::$integrationID;
    }

    public function getAssignmentList()
    {
        return $assignment_list = $this->assignment_list;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->affiliateFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public static function createAffiliateWithSpecificId($affiliateId, $statusId, $referralId, $finalData, $user_id)
    {
        switch ($statusId) {
            case '1':
                $status = 'paid';

                break;
            case '2':
                $status = 'unpaid';

                break;
            case '3':
                $status = 'pending';

                break;
            case '4':
                $status = 'reject';

                break;
        }
        switch ($referralId) {
            case '1':
                $referral = 'sale';

                break;
            case '2':
                $referral = 'opt-in';

                break;
            case '3':
                $referral = 'lead';

                break;
        }

        $user = get_user_by('id', $user_id);
        $finalData['user_id'] = $user_id;
        $finalData['type'] = $referral;
        $finalData['status'] = $status;
        $finalData['custom'] = 'this is custom field';
        $finalData['user_name'] = $user ? $user->user_login : '';
        $finalData['affiliate_id'] = $affiliateId;

        $affiliate_user_id = affwp_get_affiliate_user_id($affiliateId);
        if ($affiliate_user_id && affwp_is_affiliate($affiliate_user_id)) {
            return affwp_add_referral($finalData);
        }
        LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'group', 'type_name' => 'create-referral']), 'error', wp_json_encode('User are not affiliate'));
    }

    public static function createAffiliateFortheUser($statusId, $referralId, $finalData, $user_id)
    {
        switch ($statusId) {
            case '1':
                $status = 'paid';

                break;
            case '2':
                $status = 'unpaid';

                break;
            case '3':
                $status = 'pending';

                break;
            case '4':
                $status = 'reject';

                break;
        }
        switch ($referralId) {
            case '1':
                $referral = 'sale';

                break;
            case '2':
                $referral = 'opt-in';

                break;
            case '3':
                $referral = 'lead';

                break;
        }

        $affiliateId = affwp_get_affiliate_id($user_id);
        $user = get_user_by('id', $user_id);
        $finalData['user_id'] = $user_id;
        $finalData['type'] = $referral;
        $finalData['status'] = $status;
        $finalData['custom'] = 'this is custom field';
        $finalData['user_name'] = $user ? $user->user_login : '';
        $finalData['affiliate_id'] = $affiliateId;

        $affiliate_user_id = affwp_get_affiliate_user_id($affiliateId);
        if ($affiliate_user_id && affwp_is_affiliate($affiliate_user_id)) {
            return affwp_add_referral($finalData);
        }
        LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'referral', 'type_name' => 'create-referral']), 'error', wp_json_encode(__('User are not affiliate', 'bit-integrations')));
    }

    public function execute(
        $mainAction,
        $fieldValues,
        $integrationDetails,
        $integrationData
    ) {
        $fieldData = [];

        $userId = ActionUser::resolve($integrationDetails, $fieldValues);

        if (is_wp_error($userId)) {
            LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'referral', 'type_name' => 'create-referral']), 'error', wp_json_encode($userId->get_error_message()));

            return $userId;
        }

        if ($mainAction === '1') {
            $fieldMap = $integrationDetails->field_map;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $affiliateId = $integrationDetails->affiliate_id;
            $referralId = $integrationDetails->referralId;
            $statusId = $integrationDetails->statusId;
            $apiResponse = self::createAffiliateWithSpecificId(
                $affiliateId,
                $statusId,
                $referralId,
                $finalData,
                $userId
            );
            if ($apiResponse !== 0) {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'referral', 'type_name' => 'create-referral']), 'success', wp_json_encode(wp_sprintf(__('Created Referral id %s', 'bit-integrations'), $apiResponse)));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'referral', 'type_name' => 'create-referral']), 'error', wp_json_encode(__('Error in creating referral', 'bit-integrations')));
            }

            return $apiResponse;
        }
        if ($mainAction === '2') {
            $fieldMap = $integrationDetails->field_map;
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $referralId = $integrationDetails->referralId;
            $statusId = $integrationDetails->statusId;
            $apiResponse = self::createAffiliateFortheUser(
                $statusId,
                $referralId,
                $finalData,
                $userId
            );
            if ($apiResponse !== 0) {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'referral', 'type_name' => 'create-referral']), 'success', wp_json_encode(wp_sprintf(__('Created Referral id %s', 'bit-integrations'), $apiResponse)));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'referral', 'type_name' => 'create-referral']), 'error', wp_json_encode(__('Error in creating referral', 'bit-integrations')));
            }

            return $apiResponse;
        }
    }
}
