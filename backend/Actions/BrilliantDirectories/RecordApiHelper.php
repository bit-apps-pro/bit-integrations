<?php

/**
 * Brilliant Directories Record Api.
 */

namespace BitApps\Integrations\Actions\BrilliantDirectories;

use BitApps\Integrations\Config;
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

    private $_apiKey;

    private $_siteUrl;

    public function __construct($integrationDetails, $integId, $apiKey, $siteUrl)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_apiKey = $apiKey;
        $this->_siteUrl = rtrim($siteUrl, '/');
    }

    public function execute($fieldValues, $fieldMap)
    {
        $fieldData = static::generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_member';
        $context = $this->buildContext();
        $default = [
            'success' => false,
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
            'code'    => 400,
        ];

        switch ($mainAction) {
            case 'create_member':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_create_member'), $default, $fieldData, $context);

                break;

            case 'update_member':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_update_member'), $default, $fieldData, $context);

                break;

            case 'delete_member':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_delete_member'), $default, $fieldData, $context);

                break;

            case 'create_lead':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_create_lead'), $default, $fieldData, $context);

                break;

            case 'update_lead':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_update_lead'), $default, $fieldData, $context);

                break;

            case 'match_lead':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_match_lead'), $default, $fieldData, $context);

                break;

            case 'delete_lead':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_delete_lead'), $default, $fieldData, $context);

                break;

            case 'create_member_post':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_create_member_post'), $default, $fieldData, $context);

                break;

            case 'create_review':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_create_review'), $default, $fieldData, $context);

                break;

            case 'update_review':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_update_review'), $default, $fieldData, $context);

                break;

            case 'delete_review':
                $response = Hooks::apply(Config::withPrefix('brilliant_directories_delete_review'), $default, $fieldData, $context);

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
     * Connection and config the Pro handlers need to talk to BD. Bundled into one
     * argument so every action hook keeps the same 3-parameter contract.
     */
    private function buildContext()
    {
        return [
            'baseUrl' => $this->_siteUrl . '/api/v2/',
            'headers' => [
                'Accept'       => 'application/json',
                // BD only accepts form-urlencoded bodies.
                'Content-Type' => 'application/x-www-form-urlencoded',
                'X-Api-Key'    => $this->_apiKey,
            ],
            'configs' => [
                // The post type select carries `{data_id}:{data_type}` because BD requires
                // both on create but only exposes `data_type` as a post type column.
                'post_type_id'    => $this->_integrationDetails->post_type_id ?? '',
                'profession_id'   => $this->_integrationDetails->profession_id ?? '',
                'subscription_id' => $this->_integrationDetails->subscription_id ?? '',
                'top_category_id' => $this->_integrationDetails->top_category_id ?? '',
            ],
            'utilities' => (array) ($this->_integrationDetails->utilities ?? []),
        ];
    }
}
