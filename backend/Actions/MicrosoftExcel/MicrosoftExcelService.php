<?php

namespace BitApps\Integrations\Actions\MicrosoftExcel;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class MicrosoftExcelService
{
    private const SETTING_KEYS = ['workbook_id', 'worksheet_id'];

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
        $mainAction = $this->_integrationDetails->mainAction ?? '';
        $settings = $this->settings();
        $default = [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
            'code'    => 400,
        ];

        switch ($mainAction) {
            case 'add_worksheet_row':
                $response = Hooks::apply(Config::withPrefix('microsoft_excel_add_worksheet_row'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_worksheet_row':
                $response = Hooks::apply(Config::withPrefix('microsoft_excel_update_worksheet_row'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'clear_worksheet':
                $response = Hooks::apply(Config::withPrefix('microsoft_excel_clear_worksheet'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_worksheet':
                $response = Hooks::apply(Config::withPrefix('microsoft_excel_add_worksheet'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_worksheet':
                $response = Hooks::apply(Config::withPrefix('microsoft_excel_delete_worksheet'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_table':
                $response = Hooks::apply(Config::withPrefix('microsoft_excel_create_table'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_table':
                $response = Hooks::apply(Config::withPrefix('microsoft_excel_delete_table'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'MicrosoftExcel', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ((array) $fieldMap as $map) {
            $triggerField = $map->formField ?? '';
            $excelField = $map->microsoftExcelField ?? '';

            if (empty($excelField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$excelField] = Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$excelField] = $fieldValues[$triggerField];
            }
        }

        return $data;
    }

    private function settings()
    {
        $details = $this->_integrationDetails;
        $settings = [];

        foreach (self::SETTING_KEYS as $key) {
            if (isset($details->{$key}) && $details->{$key} !== '') {
                $settings[$key] = $details->{$key};
            }
        }

        foreach ((array) ($details->utilities ?? []) as $key => $value) {
            if ($value !== '' && $value !== null && $value !== []) {
                $settings[preg_replace('/^selected_/', '', (string) $key)] = $value;
            }
        }

        return $settings;
    }
}
