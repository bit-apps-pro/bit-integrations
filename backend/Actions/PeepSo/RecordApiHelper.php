<?php

/**
 * PeepSo Record Api
 */

namespace BitApps\Integrations\Actions\PeepSo;

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
        if (!class_exists('PeepSo')) {
            return [
                'success' => false,
                'message' => __('PeepSo is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = self::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'add_post_activity_stream';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'add_post_activity_stream':
                $response = Hooks::apply(Config::withPrefix('peepso_add_post_activity_stream'), $defaultResponse, $fieldData);
                $type = 'activity';
                $actionType = 'add_post_activity_stream';

                break;

            case 'change_user_role':
                $response = Hooks::apply(Config::withPrefix('peepso_change_user_role'), $defaultResponse, $fieldData);
                $type = 'user';
                $actionType = 'change_user_role';

                break;

            case 'follow_user':
                $response = Hooks::apply(Config::withPrefix('peepso_follow_user'), $defaultResponse, $fieldData);
                $type = 'user';
                $actionType = 'follow_user';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'PeepSo';
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
            $triggerValue = $item->formField ?? null;
            $actionValue = $item->peepSoField ?? null;

            if (empty($triggerValue) || empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
