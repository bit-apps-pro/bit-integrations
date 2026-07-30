<?php

/**
 * JetEngine Integration
 */

namespace BitApps\Integrations\Actions\JetEngine;

use Jet_Engine\Modules\Custom_Content_Types\Module;
use Jet_Engine_CPT;
use Jet_Engine_Tools;
use WP_Error;

/**
 * Provide functionality for JetEngine integration
 */
class JetEngineController
{
    public static function checkedJetEngineExists()
    {
        if (!is_plugin_active('jet-engine/jet-engine.php')) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not active or not installed', 'bit-integrations'), 'JetEngine Plugin'), 400);
        } else {
            return true;
        }
    }

    public function getMenuIcons()
    {
        self::checkedJetEngineExists();

        $JetEngineCPT = new Jet_Engine_CPT();
        $iconsOptions = $JetEngineCPT->get_icons_options();

        foreach ($iconsOptions as $icon) {
            $iconsOptionsList[] = (object) [
                'label' => $icon,
                'value' => 'dashicons-' . $icon
            ];
        }

        if (!empty($iconsOptionsList)) {
            wp_send_json_success($iconsOptionsList, 200);
        }

        wp_send_json_error(__('Icon options fetching failed!', 'bit-integrations'), 400);
    }

    public function getMenuPosition()
    {
        self::checkedJetEngineExists();

        $menuPositions = Jet_Engine_Tools::get_available_menu_positions();
        $menuPositionList = [];

        foreach ($menuPositions as $item) {
            $menuPositionList[] = (object) [
                'label' => $item['label'],
                'value' => (string) $item['value']
            ];
        }

        if (!empty($menuPositionList)) {
            wp_send_json_success($menuPositionList, 200);
        }

        wp_send_json_error(__('Menu position fetching failed!', 'bit-integrations'), 400);
    }

    public function getSupports()
    {
        self::checkedJetEngineExists();

        $JetEngineCPT = new Jet_Engine_CPT();
        $supportsOptions = $JetEngineCPT->get_supports_options();

        if (!empty($supportsOptions)) {
            wp_send_json_success($supportsOptions, 200);
        }

        wp_send_json_error(__('Support options fetching failed!', 'bit-integrations'), 400);
    }

    public function getTaxPostTypes()
    {
        self::checkedJetEngineExists();

        $postTypes = Jet_Engine_Tools::get_post_types_for_js();

        if (!empty($postTypes)) {
            wp_send_json_success($postTypes, 200);
        }

        wp_send_json_error(__('Post types fetching failed!', 'bit-integrations'), 400);
    }

    public function getRelationTypes()
    {
        self::checkedJetEngineExists();

        $types = jet_engine()->relations->types_helper->get_types_for_js();
        $typeList = [];

        if (!empty($types)) {
            foreach ($types as $type) {
                $typeList = array_merge($typeList, $type['options']);
            }
        }

        if (!empty($typeList)) {
            wp_send_json_success($typeList, 200);
        }

        wp_send_json_error(__('Relation types fetching failed!', 'bit-integrations'), 400);
    }

    public function getCPTList()
    {
        self::checkedJetEngineExists();

        $cpts = jet_engine()->cpt->data->get_items();
        $cptList = [];

        foreach ($cpts as $item) {
            $labels = maybe_unserialize($item['labels']);

            $cptList[] = (object) [
                'label' => $labels['name'],
                'value' => (string) $item['id']
            ];
        }

        if (empty($cptList)) {
            wp_send_json_error('No custom post types found!', 400);
        }

        wp_send_json_success($cptList, 200);
    }

    public function getCCTList()
    {
        self::checkedJetEngineExists();

        $ccts = Module::instance()->manager->data->get_items();
        $cctList = [];

        foreach ($ccts as $item) {
            $args = maybe_unserialize($item['args']);

            $cctList[] = (object) [
                'label' => $args['name'],
                'value' => (string) $item['id']
            ];
        }

        if (empty($cctList)) {
            wp_send_json_error('No custom content types types found!', 400);
        }

        wp_send_json_success($cctList, 200);
    }

    public function getTaxList()
    {
        self::checkedJetEngineExists();

        $taxonomies = jet_engine()->taxonomies->data->get_items();
        $taxList = [];

        foreach ($taxonomies as $item) {
            $labels = maybe_unserialize($item['labels']);

            $taxList[] = (object) [
                'label' => $labels['name'],
                'value' => (string) $item['id']
            ];
        }

        if (empty($taxList)) {
            wp_send_json_error('No taxonomies found!', 400);
        }

        wp_send_json_success($taxList, 200);
    }

    public function getRelationList()
    {
        self::checkedJetEngineExists();

        $relations = jet_engine()->relations->data->get_item_for_register();
        $relationList = [];

        foreach ($relations as $item) {
            $labels = maybe_unserialize($item['labels']);

            $relationList[] = (object) [
                'label' => $labels['name'],
                'value' => (string) $item['id']
            ];
        }

        if (empty($relationList)) {
            wp_send_json_error('No realtions found!', 400);
        }

        wp_send_json_success($relationList, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        self::checkedJetEngineExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $actions = (array) $integrationDetails->actions;

        if (empty($fieldMap) || empty($selectedTask)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task are required for JetEngine', 'bit-integrations'));
        }

        $createCPTSelectedOptions = [
            'selectedMenuPosition' => $integrationDetails->selectedMenuPosition,
            'selectedMenuIcon'     => $integrationDetails->selectedMenuIcon,
            'selectedSupports'     => $integrationDetails->selectedSupports,
            'selectedCPT'          => isset($integrationDetails->selectedCPT) ? $integrationDetails->selectedCPT : '',
            'selectedCCT'          => isset($integrationDetails->selectedCCT) ? $integrationDetails->selectedCCT : '',
        ];

        $taxOptions = [
            'selectedTaxPostTypes' => $integrationDetails->selectedTaxPostTypes,
            'selectedTaxForEdit'   => isset($integrationDetails->selectedTaxForEdit) ? $integrationDetails->selectedTaxForEdit : ''
        ];

        $relOptions = (array) $integrationDetails->relOptions;

        $recordApiHelper = new RecordApiHelper($integId);
        $jetEngineResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $actions, $createCPTSelectedOptions, $taxOptions, $relOptions);

        if (is_wp_error($jetEngineResponse)) {
            return $jetEngineResponse;
        }

        return $jetEngineResponse;
    }
}
