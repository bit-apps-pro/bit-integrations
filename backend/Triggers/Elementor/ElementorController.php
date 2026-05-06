<?php

namespace BitApps\Integrations\Triggers\Elementor;

use BitApps\Integrations\Config;
use BitApps\Integrations\Flow\Flow;

final class ElementorController
{
    public static function info()
    {
        $plugin_path = 'elementor-pro/elementor-pro.php';

        return [
            'name'              => 'Elementor',
            'title'             => __('Elementor is the platform web creators choose to build professional WordPress websites, grow their skills, and build their business. Start for free today!', 'bit-integrations'),
            'type'              => 'custom_form_submission',
            'is_active'         => self::pluginActive(),
            'documentation_url' => 'https://bit-integrations.com/wp-docs/trigger/elementor-form-integrations/',
            'tutorial_url'      => 'https://youtube.com/playlist?list=PL7c6CDwwm-ALGg0fZNLDIHjh1QJPcDSXp&si=HIKa9m0-yjPSXP2p',
            'tasks'             => [
                'action' => 'elementor/get',
                'method' => 'get',
            ],
            'fetch' => [
                'action' => 'trigger/test',
                'method' => 'post',
            ],
            'fetch_remove' => [
                'action' => 'trigger/test/remove',
                'method' => 'post',
            ],
            'isPro' => false
        ];
    }

    public function getAllTasks()
    {
        if (!self::pluginActive()) {
            // translators: %s: Placeholder value
            wp_send_json_error(\sprintf(__('%s is not installed or activated', 'bit-integrations'), 'Elementor'));
        }

        wp_send_json_success([
            ['form_name' => __('Form Submission', 'bit-integrations'), 'triggered_entity_id' => 'elementor_pro/forms/new_record', 'skipPrimaryKey' => false]
        ]);
    }

    public static function pluginActive($option = null)
    {
        return (bool) (is_plugin_active('elementor-pro/elementor-pro.php') || is_plugin_active('elementor/elementor.php'));
    }

    public static function handle_elementor_submit($record)
    {
        $recordData = ElementorHelper::extractRecordData($record);
        $formData = ElementorHelper::setFields($recordData);
        $reOrganizeId = $recordData['id'] . $recordData['form_post_id'];

        if (Config::getOption('elementor_pro/forms/new_record_test') !== false) {
            Config::updateOption('elementor_pro/forms/new_record_test', [
                'formData'   => $formData,
                'primaryKey' => [(object) ['key' => 'id', 'value' => $recordData['id']]]
            ]);
        }

        $flows = Flow::exists('Elementor', ['elementor_pro/forms/new_record', $recordData['id'], $reOrganizeId]);
        if (!$flows) {
            return;
        }

        foreach ($flows as $flow) {
            $flowDetails = static::parseFlowDetails($flow->flow_details);

            if (!isset($flowDetails->primaryKey) && ($flow->triggered_entity_id == $recordData['id'] || $flow->triggered_entity_id == $reOrganizeId)) {
                $data = ElementorHelper::prepareDataForFlow($record);
                Flow::execute('Elementor', $flow->triggered_entity_id, $data, [$flow]);

                continue;
            }

            if (\is_array($flowDetails->primaryKey) && ElementorHelper::isPrimaryKeysMatch($recordData, $flowDetails)) {
                $data = array_column($formData, 'value', 'name');
                Flow::execute('Elementor', $flow->triggered_entity_id, $data, [$flow]);
            }
        }

        return ['type' => 'success'];
    }

    private static function parseFlowDetails($flowDetails)
    {
        return \is_string($flowDetails) ? json_decode($flowDetails) : $flowDetails;
    }
}
