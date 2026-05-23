<?php

/**
 * MondayCom Record Api
 */

namespace BitApps\Integrations\Actions\MondayCom;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $integrationDetails;

    private $integrationId;

    private $apiToken;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId, $apiToken)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiToken = $apiToken;
    }

    public function handleFilterResponse($response)
    {
        if ($response) {
            return $response;
        }

        // translators: %s: Placeholder value
        return (object) ['error' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')];
    }

    public function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->mondayComField ?? '';

            if (empty($actionValue)) {
                continue;
            }

            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($item->customValue ?? '', $fieldValues);
            } elseif (!empty($triggerValue)) {
                $dataFinal[$actionValue] = $fieldValues[$triggerValue] ?? '';
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap)
    {
        $fieldData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $mainAction = $this->integrationDetails->mainAction ?? '';
        $apiResponse = null;
        $responseType = null;

        $this->type = 'item';
        $this->typeName = $mainAction;

        switch ($mainAction) {
            case 'create_item':
                $this->type = 'item';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_create_item'), false, $fieldData, $this->integrationDetails, $this->apiToken);

                break;
            case 'update_item':
                $this->type = 'item';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_update_item'), false, $fieldData, $this->integrationDetails, $this->apiToken);

                break;
            case 'create_subitem':
                $this->type = 'subitem';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_create_subitem'), false, $fieldData, $this->integrationDetails, $this->apiToken);

                break;
            case 'move_item_to_group':
                $this->type = 'item';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_move_item_to_group'), false, $fieldData, $this->apiToken);

                break;
            case 'archive_item':
                $this->type = 'item';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_archive_item'), false, $fieldData, $this->apiToken);

                break;
            case 'delete_item':
                $this->type = 'item';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_delete_item'), false, $fieldData, $this->apiToken);

                break;
            case 'archive_board':
                $this->type = 'board';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_archive_board'), false, $fieldData, $this->apiToken);

                break;
            case 'archive_group':
                $this->type = 'group';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_archive_group'), false, $fieldData, $this->integrationDetails, $this->apiToken);

                break;
            case 'delete_group':
                $this->type = 'group';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_delete_group'), false, $fieldData, $this->integrationDetails, $this->apiToken);

                break;
            case 'create_group':
                $this->type = 'group';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_create_group'), false, $fieldData, $this->integrationDetails, $this->apiToken);

                break;
            case 'duplicate_group':
                $this->type = 'group';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_duplicate_group'), false, $fieldData, $this->integrationDetails, $this->apiToken);

                break;
            case 'create_column':
                $this->type = 'column';
                $apiResponse = Hooks::apply(Config::withPrefix('mondayCom_create_column'), false, $fieldData, $this->integrationDetails, $this->apiToken);

                break;
            default:
                $apiResponse = null;
        }

        $apiResponse = $this->handleFilterResponse($apiResponse);
        $responseType = $this->hasErrors($apiResponse) || !isset($apiResponse->data) ? 'error' : 'success';

        LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), $responseType, wp_json_encode($apiResponse));

        return $apiResponse;
    }

    private function hasErrors($response)
    {
        return is_wp_error($response) || !empty($response->errors) || !empty($response->error);
    }
}
