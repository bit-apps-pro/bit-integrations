<?php

namespace BitApps\Integrations\Actions\WeDocs;

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
        if (!class_exists('WeDocs')) {
            $response = [
                'success' => false,
                'message' => __('weDocs is not installed or activated', 'bit-integrations'),
            ];

            LogHandler::save($this->_integrationID, ['type' => 'weDocs', 'type_name' => 'check'], 'error', $response);

            return $response;
        }

        $mainAction = $this->_integrationDetails->mainAction ?? '';
        $fieldData = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $payload = $this->buildPayload($fieldData);

        $defaultResponse = [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_documentation':
                $response = Hooks::apply(Config::withPrefix('wedocs_create_documentation'), $defaultResponse, $payload);
                $actionType = 'create_documentation';

                break;

            case 'create_section':
                $response = Hooks::apply(Config::withPrefix('wedocs_create_section'), $defaultResponse, $payload);
                $actionType = 'create_section';

                break;

            case 'create_article':
                $response = Hooks::apply(Config::withPrefix('wedocs_create_article'), $defaultResponse, $payload);
                $actionType = 'create_article';

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
        LogHandler::save($this->_integrationID, ['type' => 'weDocs', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private function buildPayload($payload)
    {
        if (!isset($payload['documentation_id']) && isset($this->_integrationDetails->selectedDocumentationId)) {
            $payload['documentation_id'] = $this->_integrationDetails->selectedDocumentationId;
        }

        if (!isset($payload['section_id']) && isset($this->_integrationDetails->selectedSectionId)) {
            $payload['section_id'] = $this->_integrationDetails->selectedSectionId;
        }

        return $payload;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        if (!\is_array($fieldMap)) {
            return $dataFinal;
        }

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->weDocsField ?? '';

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
