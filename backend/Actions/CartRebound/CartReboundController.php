<?php

namespace BitApps\Integrations\Actions\CartRebound;

use WP_Error;

class CartReboundController
{
    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(__('Cart Rebound is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public function refreshTemplates()
    {
        self::isExists();

        $templates = [];

        foreach (cart_rebound(\CartRebound\Mail\TemplateStore::class)->all() as $template) {
            $templates[] = (object) [
                'value' => (string) $template['id'],
                'label' => empty($template['is_default'])
                    ? (string) $template['name']
                    // translators: %s: Template name
                    : \sprintf(__('%s (Default)', 'bit-integrations'), $template['name']),
            ];
        }

        wp_send_json_success(['templates' => $templates], 200);
    }

    public function refreshCoupons()
    {
        self::isExists();

        $coupons = [];

        foreach (get_posts(['post_type' => 'shop_coupon', 'post_status' => 'publish', 'posts_per_page' => -1, 'orderby' => 'title', 'order' => 'ASC']) as $post) {
            if ($post->post_title !== '') {
                $coupons[] = (object) ['value' => $post->post_title, 'label' => $post->post_title];
            }
        }

        wp_send_json_success(['coupons' => $coupons], 200);
    }

    public function refreshOrderStatuses()
    {
        self::isExists();

        $statuses = [];

        if (\function_exists('wc_get_order_statuses')) {
            foreach (wc_get_order_statuses() as $status => $label) {
                $statuses[] = (object) [
                    'value' => strpos($status, 'wc-') === 0 ? substr($status, 3) : $status,
                    'label' => $label,
                ];
            }
        }

        wp_send_json_success(['statuses' => $statuses], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    public static function isPluginActive()
    {
        return \defined('CART_REBOUND_VERSION') && \function_exists('cart_rebound');
    }
}
