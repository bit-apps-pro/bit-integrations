<?php

namespace BitApps\Integrations\Actions\UserRegistrationMembership;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
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
        if (!class_exists('UserRegistration')) {
            $response = [
                'success' => false,
                'message' => __('User Registration and Membership is not installed or activated', 'bit-integrations')
            ];

            LogHandler::save($this->_integrationID, ['type' => 'User Registration', 'type_name' => 'check'], 'error', $response);

            return $response;
        }

        $fieldData = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_user';
        $response = $this->processAction($mainAction, $fieldData);

        $responseType = !empty($response['success']) ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'User Registration', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private function processAction($mainAction, $fieldData)
    {
        $defaultResponse = [
            'success' => false,
            // translators: %s is the plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_user':
                // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- hook is prefixed via Config::VAR_PREFIX.
                return apply_filters(Config::withPrefix('user_registration_create_user'), $defaultResponse, $fieldData, $this->_integrationDetails);

            default:
                return [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
        }
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            if (empty($item->userRegistrationField)) {
                continue;
            }

            $dataFinal[$item->userRegistrationField] = $item->formField === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$item->formField] ?? '');
        }

        return $dataFinal;
    }
}
