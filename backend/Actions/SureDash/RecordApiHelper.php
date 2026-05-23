<?php

namespace BitApps\Integrations\Actions\SureDash;

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
        if (!\defined('SUREDASHBOARD_POST_TYPE')) {
            return [
                'success' => false,
                'message' => __('SureDash is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_post';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_post':
                $response = Hooks::apply(Config::withPrefix('sure_dash_create_post'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $actionType = 'create_post';

                break;

            case 'delete_post':
                $response = Hooks::apply(Config::withPrefix('sure_dash_delete_post'), $defaultResponse, $fieldData);
                $actionType = 'delete_post';

                break;

            case 'create_comment':
                $response = Hooks::apply(Config::withPrefix('sure_dash_create_comment'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $actionType = 'create_comment';

                break;

            case 'delete_comment':
                $response = Hooks::apply(Config::withPrefix('sure_dash_delete_comment'), $defaultResponse, $fieldData);
                $actionType = 'delete_comment';

                break;

            case 'update_user_profile':
                $response = Hooks::apply(Config::withPrefix('sure_dash_update_user_profile'), $defaultResponse, $fieldData);
                $actionType = 'update_user_profile';

                break;

            case 'bookmark_item':
                $response = Hooks::apply(Config::withPrefix('sure_dash_bookmark_item'), $defaultResponse, $fieldData);
                $actionType = 'bookmark_item';

                break;

            case 'react_to_entity':
                $response = Hooks::apply(Config::withPrefix('sure_dash_react_to_entity'), $defaultResponse, $fieldData);
                $actionType = 'react_to_entity';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations'),
                ];
                $actionType = 'unknown';

                break;
        }

        $responseType = !is_wp_error($response) && isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'SureDash', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->sureDashField;

            if (!$actionValue) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
