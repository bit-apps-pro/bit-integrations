<?php

/**
 * Ultimate Affiliate Pro Record Api
 */

namespace BitApps\Integrations\Actions\UltimateAffiliatePro;

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

    public function execute($fieldValues, $fieldMap)
    {
        if (!UltimateAffiliateProController::pluginActive()) {
            return [
                'success' => false,
                'message' => __('Ultimate Affiliate Pro is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_affiliate';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_affiliate':
                $response = Hooks::apply(
                    Config::withPrefix('ultimateaffiliatepro_create_affiliate'),
                    $defaultResponse,
                    $fieldData
                );
                $actionType = 'create_affiliate';

                break;

            case 'create_referral':
                $response = Hooks::apply(
                    Config::withPrefix('ultimateaffiliatepro_create_referral'),
                    $defaultResponse,
                    $fieldData
                );
                $actionType = 'create_referral';

                break;

            case 'insert_payment':
                $response = Hooks::apply(
                    Config::withPrefix('ultimateaffiliatepro_insert_payment'),
                    $defaultResponse,
                    $fieldData
                );
                $actionType = 'insert_payment';

                break;

            case 'change_transaction_status':
                $response = Hooks::apply(
                    Config::withPrefix('ultimateaffiliatepro_change_transaction_status'),
                    $defaultResponse,
                    $fieldData
                );
                $actionType = 'change_transaction_status';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';

        LogHandler::save(
            $this->_integrationID,
            ['type' => 'Ultimate Affiliate Pro', 'type_name' => $actionType],
            $responseType,
            $response
        );

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->ultimateAffiliateProField ?? '';

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
