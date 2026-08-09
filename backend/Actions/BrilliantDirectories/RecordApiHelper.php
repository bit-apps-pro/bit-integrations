<?php

/**
 * Brilliant Directories Record Api.
 */

namespace BitApps\Integrations\Actions\BrilliantDirectories;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Every Brilliant Directories action is Pro — this class only builds the payload and
 * fires the matching hook. All API traffic happens in Bit Integrations Pro.
 */
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
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_member';
        $settings = $this->settings();
        $default = [
            'success' => false,
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
            'code'    => 400,
        ];

        switch ($mainAction) {
            case 'create_member':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_create_member'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_member':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_update_member'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_member':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_delete_member'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_lead':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_create_lead'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_lead':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_update_lead'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'match_lead':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_match_lead'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_lead':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_delete_lead'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_member_post':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_create_member_post'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_review':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_create_review'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_review':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_update_review'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_review':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_delete_review'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'BrilliantDirectories', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ($fieldMap as $map) {
            $triggerField = $map->formField;
            $bdField = $map->brilliantDirectoriesField;

            if (empty($bdField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$bdField] = Common::replaceFieldWithValue($map->customValue, $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$bdField] = $fieldValues[$triggerField];
            }
        }

        return $data;
    }

    /**
     * Everything the node saved that is not a mapped field: the dropdown selections and
     * the Utilities toggles, flattened into one array. Utilities keys are prefixed
     * `selected_`, so they cannot collide with a dropdown key.
     *
     * @return array<string, mixed>
     */
    private function settings()
    {
        $details = $this->_integrationDetails;

        return array_merge(
            (array) ($details->utilities ?? []),
            [
                'post_type_id'    => $details->post_type_id ?? '',
                'profession_id'   => $details->profession_id ?? '',
                'subscription_id' => $details->subscription_id ?? '',
                'top_category_id' => $details->top_category_id ?? '',
            ]
        );
    }
}
