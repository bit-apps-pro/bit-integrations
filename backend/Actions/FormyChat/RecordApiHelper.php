<?php

namespace BitApps\Integrations\Actions\FormyChat;

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
        if (!\defined('FORMYCHAT_VERSION')) {
            return [
                'success' => false,
                'message' => __('FormyChat is not installed or activated', 'bit-integrations'),
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $metaData = static::generateMetaDataFromMetaMap($this->_integrationDetails->meta_map ?? [], $fieldValues);
        if (!empty($metaData)) {
            $fieldData['_meta'] = $metaData;
        }

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_lead';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_lead':
                $response = Hooks::apply(
                    Config::withPrefix('formy_chat_create_lead'),
                    $defaultResponse,
                    $fieldData,
                    $this->_integrationDetails->widgetId ?? null
                );
                $actionType = 'create_lead';

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
                $actionType = 'unknown';

                break;
        }

        $responseType = (!is_wp_error($response) && isset($response['success']) && $response['success']) ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'FormyChat', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $data = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->formyChatField ?? '';

            if (empty($actionValue)) {
                continue;
            }

            $data[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $data;
    }

    protected static function generateMetaDataFromMetaMap($metaMap, $fieldValues)
    {
        $data = [];
        foreach ($metaMap as $item) {
            $formField = $item->formField ?? '';
            $metaKey = $item->metaKey ?? '';

            if (empty($formField) || empty($metaKey)) {
                continue;
            }

            $data[$metaKey] = $formField === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$formField] ?? '');
        }

        return $data;
    }
}
