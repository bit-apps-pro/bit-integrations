<?php

namespace BitApps\Integrations\Actions\FluentCrm;

use WP_Error;

class FluentCrmAction
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;

        $fieldMap = $integrationDetails->field_map;
        $defaultDataConf = $integrationDetails->default;
        $list_id = isset($integrationDetails->list_id) ? $integrationDetails->list_id : null;
        $tags = $integrationDetails->tags;
        $actions = $integrationDetails->actions;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Fluent CRM'));
        }

        $recordApiHelper = new FluentCrmService($this->_integrationID);

        $fluentCrmApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $actions,
            $list_id,
            $tags,
            $actionName
        );

        if (is_wp_error($fluentCrmApiResponse)) {
            return $fluentCrmApiResponse;
        }

        return $fluentCrmApiResponse;
    }
}
