<?php

/**
 * Affiliate Integration
 */

namespace BitApps\Integrations\Actions\Affiliate;

use BitApps\Integrations\Config;
use WP_Error;

/**
 * Provide functionality for Affiliate integration
 */
class AffiliateController
{
    // private $_integrationID;

    // public function __construct($integrationID)
    // {
    //     $this->_integrationID = $integrationID;
    // }

    public static function pluginActive($option = null)
    {
        if (is_plugin_active('affiliate-wp/affiliate-wp.php')) {
            return $option === 'get_name' ? 'affiliate-wp/affiliate-wp.php' : true;
        }

        return false;
    }

    public static function getAllAffiliate()
    {
        $cache_key = Config::withPrefix('affiliate_wp_all_affiliates');
        $cache_group = Config::VAR_PREFIX;
        $affiliates = wp_cache_get($cache_key, $cache_group);

        if (false !== $affiliates) {
            return $affiliates;
        }

        $affiliates = [];

        global $wpdb;
        $affiliate_table = esc_sql($wpdb->prefix . 'affiliate_wp_affiliates');
        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
        $affiliatesIds = $wpdb->get_results(
            'SELECT affiliate_Id FROM ' . $affiliate_table
        );
        // phpcs:enable

        foreach ($affiliatesIds as $val) {
            $affiliates[] = [
                'affiliate_id'   => $val->affiliate_Id,
                'affiliate_name' => affwp_get_affiliate_name($val->affiliate_Id),
            ];
        }

        wp_cache_set($cache_key, $affiliates, $cache_group, 10 * MINUTE_IN_SECONDS);

        return $affiliates;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        if (
            empty($integId)
            || empty($mainAction) || empty($fieldMap)
        ) {
            // translators: %s: Integration name
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Affiliate api'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $affiliateApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData
        );

        if (is_wp_error($affiliateApiResponse)) {
            return $affiliateApiResponse;
        }

        return $affiliateApiResponse;
    }
}
