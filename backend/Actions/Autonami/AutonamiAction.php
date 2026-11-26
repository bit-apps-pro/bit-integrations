<?php

namespace BitApps\Integrations\Actions\Autonami;

use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class AutonamiAction
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        if (!class_exists('BWFCRM_Contact')) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'insert'], 'error', __('Autonami Pro Plugins not found', 'bit-integrations'));

            return false;
        }

        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $lists = isset($integrationDetails->lists) ? $integrationDetails->lists : [];
        $tags = isset($integrationDetails->tags) ? $integrationDetails->tags : [];
        $actions = $integrationDetails->actions;

        $triggers = ['PiotnetForms'];
        if (\in_array($fieldValues['bit-integrator%trigger_data%']['triggered_entity'], $triggers)) {
            $fieldValues = Helper::splitStringToarray($fieldValues);
        }

        if (empty($fieldMap)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Autonami'));
        }

        $recordApiHelper = new AutonamiService($this->_integrationID);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $actions, $lists, $tags);
    }
}
