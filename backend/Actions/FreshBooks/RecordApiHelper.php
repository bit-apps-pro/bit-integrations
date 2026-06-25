<?php

namespace BitApps\Integrations\Actions\FreshBooks;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $_accessToken;

    private $_accountId;

    private $_businessId;

    public function __construct($integrationDetails, $integId, $accessToken, $accountId, $businessId = null)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_accessToken = $accessToken;
        $this->_accountId = $accountId;
        $this->_businessId = $businessId;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->freshBooksField;

            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (isset($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $mainAction, $utilities)
    {
        $fieldData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        $default = [
            'success' => false,
            'message' => wp_sprintf(
                __('%s plugin is not installed or activated', 'bit-integrations'),
                'Bit Integrations Pro'
            ),
        ];

        $response = Hooks::apply(
            Config::withPrefix('fresh_books_' . $mainAction),
            $default,
            $fieldData,
            $this->_accountId,
            $this->_businessId,
            $this->_accessToken,
            $this->_integrationDetails,
            $utilities
        );

        if (isset($response['success']) && $response['success']) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'freshBooks', 'type_name' => $mainAction]), 'success', wp_json_encode($response));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'freshBooks', 'type_name' => $mainAction]), 'error', wp_json_encode($response));
        }

        return $response;
    }
}
