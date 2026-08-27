<?php

namespace BitApps\Integrations\Actions\Flodesk;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $apiClient;

    public function __construct($integrationDetails, $integId, ApiClient $apiClient)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->apiClient = $apiClient;
    }

    public function execute($fieldValues, $fieldMap)
    {
        $fieldData = static::generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_or_update_subscriber';
        $settings = $this->settings();
        $default = [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
            'code'    => 400,
        ];

        switch ($mainAction) {
            case 'create_or_update_subscriber':
                $response = Hooks::apply(Config::withPrefix('flodesk_create_or_update_subscriber'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'unsubscribe_subscriber':
                $response = Hooks::apply(Config::withPrefix('flodesk_unsubscribe_subscriber'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_subscriber_to_segments':
                $response = Hooks::apply(Config::withPrefix('flodesk_add_subscriber_to_segments'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'remove_subscriber_from_segments':
                $response = Hooks::apply(Config::withPrefix('flodesk_remove_subscriber_from_segments'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_segment':
                $response = Hooks::apply(Config::withPrefix('flodesk_create_segment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_custom_field':
                $response = Hooks::apply(Config::withPrefix('flodesk_create_custom_field'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_subscriber_to_workflow':
                $response = Hooks::apply(Config::withPrefix('flodesk_add_subscriber_to_workflow'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'remove_subscriber_from_workflow':
                $response = Hooks::apply(Config::withPrefix('flodesk_remove_subscriber_from_workflow'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Flodesk', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ($fieldMap as $map) {
            $triggerField = $map->formField;
            $flodeskField = $map->flodeskField;

            if (empty($flodeskField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$flodeskField] = Common::replaceFieldWithValue($map->customValue, $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$flodeskField] = $fieldValues[$triggerField];
            }
        }

        return $data;
    }

    private function settings()
    {
        $details = $this->_integrationDetails;

        return array_merge(
            (array) ($details->utilities ?? []),
            [
                'segment_ids' => $details->segment_ids ?? [],
                'color_code'  => $details->color_code ?? '',
                'workflow_id' => $details->workflow_id ?? '',
            ]
        );
    }
}
