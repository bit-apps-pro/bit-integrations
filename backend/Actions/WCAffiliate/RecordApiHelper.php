<?php

/**
 * WC Affiliate Record API
 */

namespace BitApps\Integrations\Actions\WCAffiliate;

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
        if (
            !class_exists('\WC_Affiliate\Models\Affiliate')
            || !class_exists('\WC_Affiliate\Models\Referral')
            || !class_exists('\WC_Affiliate\Models\Transaction')
        ) {
            return [
                'success' => false,
                'message' => __('WC Affiliate is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $fieldData = $this->mergeFixedFieldValues($fieldData);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_affiliate';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_affiliate':
                $response = Hooks::apply(
                    Config::withPrefix('wcaffiliate_create_affiliate'),
                    $defaultResponse,
                    $fieldData
                );
                $type = 'affiliate';
                $actionType = 'create_affiliate';

                break;

            case 'update_affiliate_status':
                $response = Hooks::apply(
                    Config::withPrefix('wcaffiliate_update_affiliate_status'),
                    $defaultResponse,
                    $fieldData
                );
                $type = 'affiliate';
                $actionType = 'update_affiliate_status';

                break;

            case 'create_referral':
                $response = Hooks::apply(
                    Config::withPrefix('wcaffiliate_create_referral'),
                    $defaultResponse,
                    $fieldData
                );
                $type = 'referral';
                $actionType = 'create_referral';

                break;

            case 'update_referral_status':
                $response = Hooks::apply(
                    Config::withPrefix('wcaffiliate_update_referral_status'),
                    $defaultResponse,
                    $fieldData
                );
                $type = 'referral';
                $actionType = 'update_referral_status';

                break;

            case 'create_transaction':
                $response = Hooks::apply(
                    Config::withPrefix('wcaffiliate_create_transaction'),
                    $defaultResponse,
                    $fieldData
                );
                $type = 'transaction';
                $actionType = 'create_transaction';

                break;

            case 'update_transaction_status':
                $response = Hooks::apply(
                    Config::withPrefix('wcaffiliate_update_transaction_status'),
                    $defaultResponse,
                    $fieldData
                );
                $type = 'transaction';
                $actionType = 'update_transaction_status';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'WCAffiliate';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';

        LogHandler::save(
            $this->_integrationID,
            ['type' => $type, 'type_name' => $actionType],
            $responseType,
            $response
        );

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->wcAffiliateField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }

    private function mergeFixedFieldValues($fieldData)
    {
        $fixedFieldValues = isset($this->_integrationDetails->fixedFieldValues)
            ? (array) $this->_integrationDetails->fixedFieldValues
            : [];

        if (empty($fixedFieldValues)) {
            return $fieldData;
        }

        foreach ($fixedFieldValues as $key => $value) {
            if (
                !empty($key)
                && $value !== ''
                && (!isset($fieldData[$key]) || $fieldData[$key] === '')
            ) {
                $fieldData[$key] = $value;
            }
        }

        return $fieldData;
    }
}
