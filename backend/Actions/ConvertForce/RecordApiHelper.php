<?php

/**
 * ConvertForce Record Api
 */

namespace BitApps\Integrations\Actions\ConvertForce;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for ConvertForce actions
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

    /**
     * Execute the integration
     *
     * @param array $fieldValues Field values from form
     * @param array $fieldMap    Field mapping
     *
     * @return array
     */
    public function execute($fieldValues, $fieldMap)
    {
        if (!\defined('CONVERTFORCE_VERSION')) {
            return [
                'success' => false,
                'message' => __('ConvertForce Popup Builder is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'createCampaign';
        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'createCampaign':
                $response = Hooks::apply(Config::withPrefix('convertforce_create_campaign'), $defaultResponse, $fieldData);
                $type = 'campaign';
                $actionType = 'create_campaign';

                break;

            case 'updateCampaign':
                $response = Hooks::apply(Config::withPrefix('convertforce_update_campaign'), $defaultResponse, $fieldData);
                $type = 'campaign';
                $actionType = 'update_campaign';

                break;

            case 'updateCampaignStatus':
                $response = Hooks::apply(Config::withPrefix('convertforce_update_campaign_status'), $defaultResponse, $fieldData);
                $type = 'campaign';
                $actionType = 'update_campaign_status';

                break;

            case 'deleteCampaign':
                $response = Hooks::apply(Config::withPrefix('convertforce_delete_campaign'), $defaultResponse, $fieldData);
                $type = 'campaign';
                $actionType = 'delete_campaign';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'ConvertForce';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap ?? [] as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->convertForceField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue) ? Common::replaceFieldWithValue($item->customValue, $fieldValues) : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
