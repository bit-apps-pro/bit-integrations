<?php

/**
 * Instasent Record Api
 */

namespace BitApps\Integrations\Actions\Instasent;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, upsert
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $_authToken;

    public function __construct($auth_token, $integrationDetails, $integId)
    {
        $this->_authToken = $auth_token;
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->instasentFormField;

            if (empty($actionValue)) {
                continue;
            }

            if ($triggerValue === 'custom' && isset($value->customValue)) {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (isset($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute(
        $integrationDetails,
        $fieldValues,
        $fieldMap,
        $auth_token,
        $action,
        $utilities = null
    ) {
        $fieldData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        if ($action === 'send_sms' && isset($utilities->allowUnicode)) {
            $fieldData['allowUnicode'] = $utilities->allowUnicode;
        }

        $default = [
            'success' => false,
            'message' => __('Bit Integrations Pro is required.', 'bit-integrations'),
        ];

        switch ($action) {
            case 'send_sms':
                $apiResponse = Hooks::apply(Config::withPrefix('instasent_send_sms'), $default, $fieldData, $auth_token);
                $typeName = 'send-sms';

                break;

            case 'create_lookup':
                $apiResponse = Hooks::apply(Config::withPrefix('instasent_create_lookup'), $default, $fieldData, $auth_token);
                $typeName = 'create-lookup';

                break;

            case 'create_datasource':
                $apiResponse = Hooks::apply(Config::withPrefix('instasent_create_datasource'), $default, $fieldData, $integrationDetails, $auth_token);
                $typeName = 'create-datasource';

                break;

            case 'create_or_update_contact':
                $apiResponse = Hooks::apply(Config::withPrefix('instasent_create_or_update_contact'), $default, $fieldData, $integrationDetails, $auth_token);
                $typeName = 'create-or-update-contact';

                break;

            case 'delete_contact':
                $apiResponse = Hooks::apply(Config::withPrefix('instasent_delete_contact'), $default, $fieldData, $integrationDetails, $auth_token);
                $typeName = 'delete-contact';

                break;

            case 'create_contact_event':
                $apiResponse = Hooks::apply(Config::withPrefix('instasent_create_contact_event'), $default, $fieldData, $integrationDetails, $auth_token);
                $typeName = 'create-contact-event';

                break;

            default:
                $apiResponse = $default;
                $typeName = $action;

                break;
        }

        if (is_wp_error($apiResponse)) {
            LogHandler::save(
                $this->_integrationID,
                wp_json_encode(['type' => 'action', 'type_name' => $typeName]),
                'error',
                wp_json_encode(['message' => $apiResponse->get_error_message()])
            );

            return $apiResponse;
        }

        $apiResponse = \is_array($apiResponse) ? (object) $apiResponse : $apiResponse;

        if (
            (isset($apiResponse->success) && $apiResponse->success)
            || isset($apiResponse->id)
            || isset($apiResponse->data)
        ) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'action', 'type_name' => $typeName]), 'success', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'action', 'type_name' => $typeName]), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
