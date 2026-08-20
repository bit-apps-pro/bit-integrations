<?php

/**
 * ClickWhale Record Api
 */

namespace BitApps\Integrations\Actions\ClickWhale;

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
        if (!\defined('CLICKWHALE_VERSION')) {
            return [
                'success' => false,
                'message' => __('ClickWhale is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_link':
                $response = Hooks::apply(Config::withPrefix('clickwhale_create_link'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'link';
                $actionType = 'create_link';

                break;

            case 'update_link':
                $response = Hooks::apply(Config::withPrefix('clickwhale_update_link'), $defaultResponse, $fieldData, $utilities);
                $type = 'link';
                $actionType = 'update_link';

                break;

            case 'delete_link':
                $response = Hooks::apply(Config::withPrefix('clickwhale_delete_link'), $defaultResponse, $fieldData);
                $type = 'link';
                $actionType = 'delete_link';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'ClickWhale';
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
            $actionValue = $item->clickWhaleField;

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
