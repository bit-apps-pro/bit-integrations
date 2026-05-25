<?php

/**
 * Heffl CRM Record Api
 */

namespace BitApps\Integrations\Actions\HefflCRM;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert
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

    public function execute($fieldValues, $fieldMap)
    {
        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $apiKey = $this->_integrationDetails->api_key ?? '';
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_lead';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_lead':
                $response = Hooks::apply(Config::withPrefix('heffl_crm_create_lead'), $defaultResponse, $apiKey, $fieldData, $this->_integrationDetails);
                $type = 'lead';
                $actionType = 'create_lead';

                break;

            case 'create_client':
                $response = Hooks::apply(Config::withPrefix('heffl_crm_create_client'), $defaultResponse, $apiKey, $fieldData, $this->_integrationDetails);
                $type = 'client';
                $actionType = 'create_client';

                break;

            case 'create_deal':
                $response = Hooks::apply(Config::withPrefix('heffl_crm_create_deal'), $defaultResponse, $apiKey, $fieldData, $this->_integrationDetails);
                $type = 'deal';
                $actionType = 'create_deal';

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
                $type = 'HefflCRM';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            if (!\is_object($item)) {
                continue;
            }
            $triggerValue = $item->formField;
            $actionValue = $item->hefflCRMField;

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
