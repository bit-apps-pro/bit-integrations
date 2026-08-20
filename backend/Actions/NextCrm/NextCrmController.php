<?php

/**
 * NextCrm Integration
 */

namespace BitApps\Integrations\Actions\NextCrm;

use WP_Error;

/**
 * Provide functionality for NextCrm integration
 */
class NextCrmController
{
    public static function isExists()
    {
        if (!\defined('NEXTCRM_VERSION') || !\function_exists('nextcrm_manager')) {
            wp_send_json_error(
                __(
                    'NextCRM is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshTags()
    {
        self::isExists();

        $response['tags'] = self::toOptions(nextcrm_manager()->contact->get_tags());
        wp_send_json_success($response, 200);
    }

    public function refreshLists()
    {
        self::isExists();

        $response['lists'] = self::toOptions(nextcrm_manager()->contact->get_lists());
        wp_send_json_success($response, 200);
    }

    public function refreshCampaigns()
    {
        self::isExists();

        $response['campaigns'] = self::toOptions(nextcrm_get_campaigns());
        wp_send_json_success($response, 200);
    }

    public function refreshContactFields()
    {
        self::isExists();

        $response['contactFields'] = self::toOptions(nextcrm_get_contact_properties());
        wp_send_json_success($response, 200);
    }

    public function refreshContactTypes()
    {
        self::isExists();

        $response['contactTypes'] = self::toOptions(nextcrm_contact_types());
        wp_send_json_success($response, 200);
    }

    public function refreshContactStatuses()
    {
        self::isExists();

        $response['contactStatuses'] = self::toOptions(nextcrm_contact_status());
        wp_send_json_success($response, 200);
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

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    /**
     * NextCRM returns its dropdown sources as `[value => label]` maps.
     *
     * @param array $map
     *
     * @return array
     */
    private static function toOptions($map)
    {
        $options = [];

        foreach ((array) $map as $value => $label) {
            $options[] = (object) [
                'value' => $value,
                'label' => \is_scalar($label) ? (string) $label : (string) $value,
            ];
        }

        return $options;
    }
}
