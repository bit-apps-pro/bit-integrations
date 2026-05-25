<?php

namespace BitApps\Integrations\Actions\Autonami;

use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Log\LogHandler;
use BWFCRM_Fields;
use BWFCRM_Lists;
use BWFCRM_Tag;
use WP_Error;

class AutonamiController
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function checkedExistsAutonami()
    {
        if (!class_exists('BWFCRM_Contact')) {
            wp_send_json_error(__('Autonami Pro Plugin is not active or installed', 'bit-integrations'), 400);
        } else {
            return true;
        }
    }

    public static function autonamiListsAndTags()
    {
        self::checkedExistsAutonami();

        $lists = BWFCRM_Lists::get_lists();
        $autonamiList = [];
        foreach ($lists as $list) {
            $autonamiList[$list['name']] = (object) [
                'id'    => $list['ID'],
                'title' => $list['name']
            ];
        }

        $tags = BWFCRM_Tag::get_tags();
        $autonamiTags = [];
        foreach ($tags as $tag) {
            $autonamiTags[$tag['name']] = (object) [
                'id'    => $tag['ID'],
                'title' => $tag['name']
            ];
        }

        $response['autonamiList'] = $autonamiList;
        $response['autonamiTags'] = $autonamiTags;
        wp_send_json_success($response, 200);
    }

    public static function autonamiFields()
    {
        self::checkedExistsAutonami();

        $fieldOptions = [];
        $fieldOptions['Email'] = (object) [
            'key'      => 'email',
            'label'    => 'Email',
            'type'     => 'primary',
            'required' => true
        ];
        foreach (BWFCRM_Fields::get_default_fields() as $key => $column) {
            $fieldOptions[$column] = (object) [
                'key'   => $key,
                'label' => $column,
                'type'  => 'primary'
            ];
        }
        foreach (BWFCRM_Fields::get_custom_fields(1, 1) as $field) {
            $fieldOptions[$field['slug']] = (object) [
                'key'   => $field['slug'],
                'label' => $field['name'],
                'type'  => 'custom',
            ];
        }
        $response['autonamiFields'] = $fieldOptions;
        wp_send_json_success($response, 200);
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

        $recordApiHelper = new RecordApiHelper($this->_integrationID);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $actions, $lists, $tags);
    }
}
