<?php

namespace BitApps\Integrations\Actions\Sendy;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integId)
    {
        $this->_integrationID = $integId;
    }

    public function insertRecord($data, $sendyUrl)
    {
        $header['Content-Type'] = 'application/x-www-form-urlencoded';
        $insertRecordEndpoint = "{$sendyUrl}/subscribe";
        $data['boolean'] = 'true';

        return HttpHelper::post($insertRecordEndpoint, $data, $header);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->sendyField;

            if ($triggerValue == 'custom' && $actionValue == 'customFieldKey' && !empty($value->customFieldKey)) {
                $dataFinal[$value->customFieldKey] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif ($triggerValue == 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif ($actionValue == 'customFieldKey' && !empty($value->customFieldKey)) {
                $dataFinal[$value->customFieldKey] = $data[$triggerValue];
            } elseif (isset($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($integId, $integrationDetails, $fieldValues, $fieldMap, $apiKey)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $mainAction = $integrationDetails->mainAction ?? 'add_subscriber';
        $default = [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'add_subscriber':
                return $this->addSubscriber($integrationDetails, $finalData);

            case 'unsubscribe':
                $response = Hooks::apply(Config::withPrefix('sendy_unsubscribe'), $default, $finalData, $integrationDetails);

                break;

            case 'delete_subscriber':
                $response = Hooks::apply(Config::withPrefix('sendy_delete_subscriber'), $default, $finalData, $integrationDetails);

                break;

            case 'create_campaign':
                $response = Hooks::apply(Config::withPrefix('sendy_create_campaign'), $default, $finalData, $integrationDetails);

                break;

            default:
                $response = ['success' => false, 'message' => __('The action is not valid. Select an action again.', 'bit-integrations')];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Sendy', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    private function addSubscriber($integrationDetails, $finalData)
    {
        $utilities = (array) ($integrationDetails->utilities ?? []);

        $finalData['list'] = $integrationDetails->list_id;
        $finalData['boolean'] = true;
        $finalData['api_key'] = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');

        if (!empty($utilities['selected_gdpr'])) {
            $finalData['gdpr'] = 'true';
        }

        if (!empty($utilities['selected_silent'])) {
            $finalData['silent'] = 'true';
        }

        $apiResponse = $this->insertRecord($finalData, rtrim($integrationDetails->sendy_url, '/'));

        if ($apiResponse === true) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'add-subscriber'], 'success', wp_json_encode(__('Subscriber added successfully', 'bit-integrations')));
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'subscriber', 'type_name' => 'add-subscriber'], 'error', wp_json_encode(is_wp_error($apiResponse) ? $apiResponse->get_error_message() : $apiResponse));
        }

        return $apiResponse;
    }
}
