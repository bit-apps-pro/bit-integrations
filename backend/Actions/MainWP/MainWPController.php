<?php

namespace BitApps\Integrations\Actions\MainWP;

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

    public static function refreshSites(): void
    {
        self::isExists();

        $websites = \MainWP\Dashboard\MainWP_DB::instance()->get_sites();
        $sites = [];

        if (!empty($websites)) {
            foreach ($websites as $website) {
                $website = (array) $website;
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

        $RecordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $RecordApiHelper->execute($fieldValues, $fieldMap);
    }
}
