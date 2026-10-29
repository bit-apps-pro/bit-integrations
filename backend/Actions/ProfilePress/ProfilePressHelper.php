<?php

namespace BitApps\Integrations\Actions\ProfilePress;

class ProfilePressHelper
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
}
