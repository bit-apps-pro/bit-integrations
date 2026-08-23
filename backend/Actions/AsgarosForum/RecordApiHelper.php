<?php

namespace BitApps\Integrations\Actions\AsgarosForum;

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
        if (!class_exists('AsgarosForum')) {
            $response = [
                'success' => false,
                'message' => __('Asgaros Forum is not installed or activated', 'bit-integrations'),
            ];

            LogHandler::save($this->_integrationID, ['type' => 'Asgaros Forum', 'type_name' => 'check'], 'error', $response);

            return $response;
        }

        $mainAction = $this->_integrationDetails->mainAction ?? '';
        $payload = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $defaultResponse = [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_topic':
                $response = Hooks::apply(Config::withPrefix('asgaros_forum_create_topic'), $defaultResponse, $payload);
                $actionType = 'create_topic';

                break;

            case 'create_forum':
                $response = Hooks::apply(Config::withPrefix('asgaros_forum_create_forum'), $defaultResponse, $payload);
                $actionType = 'create_forum';

                break;

            case 'post_reply_in_topic':
                $response = Hooks::apply(Config::withPrefix('asgaros_forum_post_reply_in_topic'), $defaultResponse, $payload);
                $actionType = 'post_reply_in_topic';

                break;

            case 'subscribe_user_in_forum':
                $response = Hooks::apply(Config::withPrefix('asgaros_forum_subscribe_user_in_forum'), $defaultResponse, $payload);
                $actionType = 'subscribe_user_in_forum';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations'),
                ];
                $actionType = 'unknown';

                break;
        }

        $responseType = !empty($response['success']) ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Asgaros Forum', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        if (!\is_array($fieldMap)) {
            return $dataFinal;
        }

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->asgarosForumField ?? '';

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
