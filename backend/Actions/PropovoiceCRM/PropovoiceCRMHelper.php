<?php

namespace BitApps\Integrations\Actions\PropovoiceCRM;

class PropovoiceCRMHelper
{
    public static function pluginActive()
    {
        return (bool) (class_exists('Ndpv'))

        ;
    }

    public static function leadTags()
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for Propovoice tags
        $tags = $wpdb->get_results($wpdb->prepare(
            "SELECT term_id, name FROM {$wpdb->terms} WHERE term_id IN (SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE taxonomy = %s)",
            'ndpv_tag'
        ));
        wp_send_json_success($tags, 200);
    }

    public static function leadLabel()
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for Propovoice labels
        $labels = $wpdb->get_results($wpdb->prepare(
            "SELECT term_id, name FROM {$wpdb->terms} WHERE term_id IN (SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE taxonomy = %s)",
            'ndpv_lead_level'
        ));
        wp_send_json_success($labels, 200);
    }
}
