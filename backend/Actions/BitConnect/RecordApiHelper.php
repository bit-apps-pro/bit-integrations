<?php

namespace BitApps\Integrations\Actions\BitConnect;

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
        if (!BitConnectController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('Bit Connect Pro is not installed or activated', 'bit-integrations')
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
            case 'create_post':
                $response = Hooks::apply(Config::withPrefix('bit_connect_create_post'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'post';

                break;

            case 'set_post_status':
                $response = Hooks::apply(Config::withPrefix('bit_connect_set_post_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'post';

                break;

            case 'vote_for_post':
                $response = Hooks::apply(Config::withPrefix('bit_connect_vote_for_post'), $defaultResponse, $fieldData);
                $type = 'post';

                break;

            case 'add_comment':
                $response = Hooks::apply(Config::withPrefix('bit_connect_add_comment'), $defaultResponse, $fieldData);
                $type = 'comment';

                break;

            case 'award_badge':
                $response = Hooks::apply(Config::withPrefix('bit_connect_award_badge'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'member';

                break;

            case 'add_member_to_group':
                $response = Hooks::apply(Config::withPrefix('bit_connect_add_member_to_group'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'group';

                break;

            case 'remove_member_from_group':
                $response = Hooks::apply(Config::withPrefix('bit_connect_remove_member_from_group'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'group';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'BitConnect';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ((array) $fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->bitConnectField ?? '';

            if (empty($triggerValue) || empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
