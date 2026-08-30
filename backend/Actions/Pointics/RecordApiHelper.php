<?php

/**
 * Pointics Record Api
 */

namespace BitApps\Integrations\Actions\Pointics;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!\defined('POINTICS_VERSION')) {
            return [
                'success' => false,
                'message' => __('Pointics is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'adjust_points';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'adjust_points':
                $response = Hooks::apply(Config::withPrefix('pointics_adjust_points'), $defaultResponse, $fieldData);
                $type = 'points';
                $actionType = 'adjust_points';

                break;

            case 'award_channel_points':
                $response = Hooks::apply(Config::withPrefix('pointics_award_channel_points'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'points';
                $actionType = 'award_channel_points';

                break;

            case 'redeem_reward':
                $response = Hooks::apply(Config::withPrefix('pointics_redeem_reward'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'redemption';
                $actionType = 'redeem_reward';

                break;

            case 'apply_redemption':
                $response = Hooks::apply(Config::withPrefix('pointics_apply_redemption'), $defaultResponse, $fieldData);
                $type = 'redemption';
                $actionType = 'apply_redemption';

                break;

            case 'cancel_redemption':
                $response = Hooks::apply(Config::withPrefix('pointics_cancel_redemption'), $defaultResponse, $fieldData);
                $type = 'redemption';
                $actionType = 'cancel_redemption';

                break;

            case 'recompute_member_tier':
                $response = Hooks::apply(Config::withPrefix('pointics_recompute_member_tier'), $defaultResponse, $fieldData, $utilities);
                $type = 'tier';
                $actionType = 'recompute_member_tier';

                break;

            case 'send_referral_invite':
                $response = Hooks::apply(Config::withPrefix('pointics_send_referral_invite'), $defaultResponse, $fieldData);
                $type = 'referral';
                $actionType = 'send_referral_invite';

                break;

            case 'cancel_referral_invite':
                $response = Hooks::apply(Config::withPrefix('pointics_cancel_referral_invite'), $defaultResponse, $fieldData);
                $type = 'referral';
                $actionType = 'cancel_referral_invite';

                break;

            case 'complete_referral_registration':
                $response = Hooks::apply(Config::withPrefix('pointics_complete_referral_registration'), $defaultResponse, $fieldData);
                $type = 'referral';
                $actionType = 'complete_referral_registration';

                break;

            case 'complete_referral_purchase':
                $response = Hooks::apply(Config::withPrefix('pointics_complete_referral_purchase'), $defaultResponse, $fieldData);
                $type = 'referral';
                $actionType = 'complete_referral_purchase';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'Pointics';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->pointicsField;

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
