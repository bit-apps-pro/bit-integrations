<?php

/**
 * ProfilePress Integration
 */

namespace BitApps\Integrations\Actions\ProfilePress;

use WP_Error;

class ProfilePressController
{
    public static function isExists()
    {
        if (!\defined('PPRESS_VERSION_NUMBER')) {
            wp_send_json_error(
                __(
                    'ProfilePress is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshPlans()
    {
        self::isExists();

        $plans = [];

        if (class_exists('\ProfilePress\Core\Membership\Repositories\PlanRepository')) {
            $repository = new \ProfilePress\Core\Membership\Repositories\PlanRepository();

            $plans = array_map(
                function ($plan) {
                    return (object) [
                        'value' => $plan->get_id(),
                        'label' => $plan->get_name(),
                    ];
                },
                $repository->retrieveAll()
            );
        }

        $response['plans'] = $plans;
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
}
