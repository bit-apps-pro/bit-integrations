<?php

namespace BitApps\Integrations\Actions\MainWP;

use WP_Error;

if (!defined('ABSPATH')) {
    exit;
}

class MainWPController
{
    public static function isExists(): void
    {
        if (!class_exists('\MainWP\Dashboard\MainWP_DB')) {
            wp_send_json_error(
                __('MainWP Dashboard is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function mainWPAuthorize(): void
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshSites(): void
    {
        self::isExists();

        $websites = \MainWP\Dashboard\MainWP_DB::instance()->get_sites();
        $sites = [];

        if (!empty($websites)) {
            foreach ($websites as $website) {
                if (empty($website['id'])) {
                    continue;
                }
                $sites[] = [
                    'value' => (string) $website['id'],
                    'label' => ($website['name'] ?? 'Site') . ' (' . ($website['url'] ?? '') . ')',
                ];
            }
        }

        wp_send_json_success(['sites' => $sites], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }
}
