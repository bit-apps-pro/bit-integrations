<?php

namespace BitApps\Integrations\Actions\Memberpress;

use MeprOptions;
use WP_Error;

class MemberpressController
{
    // private $_integrationID;

    // public function __construct($integrationID)
    // {
    //     $this->_integrationID = $integrationID;
    // }

    public static function pluginActive($option = null)
    {
        if (is_plugin_active('memberpress/memberpress.php')) {
            return $option === 'get_name' ? 'memberpress/memberpress.php' : true;
        }

        return false;
    }

    public function getAllMembership($label = null, $option_code = 'MPPRODUCT', $args = [])
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        if (self::pluginActive()) {
            $posts = get_posts([
                'post_type'      => 'memberpressproduct',
                'posts_per_page' => 999,
                'post_status'    => 'publish',
                // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- MemberPress products are filtered by period metadata.
                'meta_query' => [
                    'relation' => 'OR',
                    [
                        'key'     => '_mepr_product_period_type',
                        'value'   => 'lifetime',
                        'compare' => '!=',
                    ],
                    [
                        'key'     => '_mepr_product_period_type',
                        'value'   => 'lifetime',
                        'compare' => '=',
                    ],
                ],
            ]);

            foreach ($posts as $post) {
                $allMembership[] = [
                    'membershipId'    => $post->ID,
                    'membershipTitle' => $post->post_title,
                ];
            }
            wp_send_json_success($allMembership, 200);
        }
        // translators: %s: Plugin name
        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'Memberpress'));
    }

    public static function allPaymentGateway()
    {
        if (!self::pluginActive()) {
            // translators: %s: Plugin name
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'Memberpress'));
        }
        $mepr_options = MeprOptions::fetch();

        $pms = array_keys($mepr_options->integrations);
        $initGateways[] = [
            'paymentId'    => 'manual',
            'paymentTitle' => 'Manual',
        ];
        $gateways = [];

        if (!empty($pms) && \is_array($pms)) {
            foreach ($pms as $pm_id) {
                $obj = $mepr_options->payment_method($pm_id);
                $gateways[] = [
                    'paymentId'    => $obj->id,
                    'paymentTitle' => $obj->name,
                ];
            }
        }
        $finalGateways = array_merge($gateways, $initGateways);
        wp_send_json_success($finalGateways, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        $selectedMembership = $integrationDetails->selectedMembership;
        if (
            empty($integId)
            || empty($mainAction) || empty($selectedMembership)
        ) {
            // translators: %s: Integration name

            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'memberpress'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $memberpressApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );

        if (is_wp_error($memberpressApiResponse)) {
            return $memberpressApiResponse;
        }

        return $memberpressApiResponse;
    }
}
