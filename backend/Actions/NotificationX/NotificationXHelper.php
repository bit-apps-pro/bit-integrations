<?php

/**
 * NotificationX Integration.
 */

namespace BitApps\Integrations\Actions\NotificationX;

class NotificationXHelper
{
    public static function isExists()
    {
        if (!\defined('NOTIFICATIONX_FILE')) {
            wp_send_json_error(
                __(
                    'NotificationX is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function getNotificationsBySource($requestsParams)
    {
        self::isExists();

        if (!class_exists('NotificationX\Core\PostType')) {
            wp_send_json_error(__('NotificationX PostType class not found.', 'bit-integrations'), 400);
        }

        $action = isset($requestsParams->action) ? sanitize_text_field(wp_unslash($requestsParams->action)) : '';

        if (empty($action)) {
            wp_send_json_error(__('Action is required.', 'bit-integrations'), 400);
        }

        $sources = [
            'add_sales_notification' => 'bitintegrations_conversions',
            'add_reviews'            => 'bitintegrations_reviews',
            'add_email_subscription' => 'bitintegration_email_subscription',
        ];

        $source = $sources[$action] ?? '';

        if (empty($source)) {
            wp_send_json_error(__('Invalid action provided.', 'bit-integrations'), 400);
        }

        $notifications = \NotificationX\Core\PostType::get_instance()->get_posts(['source' => $source]);

        $options = array_map(
            function ($notification) {
                return [
                    'label' => empty($notification['title']) ? \sprintf('Notification #%d', $notification['nx_id']) : $notification['title'],
                    'value' => $notification['nx_id'],
                ];
            },
            $notifications ?: []
        );

        wp_send_json_success($options);
    }
}
