<?php

namespace BitApps\Integrations\Actions\Bookit;

use Bookit\Classes\Admin\SettingsController;
use Bookit\Classes\Database\Appointments;
use Bookit\Classes\Database\Categories;
use Bookit\Classes\Database\Customers;
use Bookit\Classes\Database\Payments;
use Bookit\Classes\Database\Services;
use Bookit\Classes\Database\Staff;
use WP_Error;

class BookitController
{
    public static function isExists()
    {
        if (!self::isPluginActive()) {
            wp_send_json_error(__('Bookit is not active. Install and activate Bookit.', 'bit-integrations'), 400);
        }
    }

    public function refreshServices()
    {
        self::isExists();

        $services = [];

        foreach ((array) Services::get_all_with_category() as $service) {
            $services[] = (object) [
                'value' => (string) $service->id,
                'label' => empty($service->category) ? $service->title : \sprintf('%s (%s)', $service->title, $service->category),
            ];
        }

        wp_send_json_success(['services' => $services], 200);
    }

    public function refreshStaff()
    {
        self::isExists();

        $staff = [];

        foreach ((array) Staff::get_all_shorted() as $member) {
            $name = stripslashes($member['full_name']);
            $staff[] = (object) [
                'value' => (string) $member['id'],
                'label' => empty($member['email']) ? $name : \sprintf('%s (%s)', $name, $member['email']),
            ];
        }

        wp_send_json_success(['staff' => $staff], 200);
    }

    public function refreshCustomers()
    {
        self::isExists();

        $customers = [];

        foreach ((array) Customers::get_all() as $customer) {
            $customers[] = (object) [
                'value' => (string) $customer['id'],
                'label' => \sprintf('%s (%s)', stripslashes($customer['full_name']), $customer['email']),
            ];
        }

        wp_send_json_success(['customers' => $customers], 200);
    }

    public function refreshCategories()
    {
        self::isExists();

        $categories = [];

        foreach ((array) Categories::get_all() as $category) {
            $categories[] = (object) ['value' => (string) $category['id'], 'label' => $category['name']];
        }

        wp_send_json_success(['categories' => $categories], 200);
    }

    public function refreshPaymentMethods()
    {
        self::isExists();

        $labels = [
            'locally'       => __('Pay Locally', 'bit-integrations'),
            'stripeConnect' => __('Stripe Connect', 'bit-integrations'),
            'paypal'        => __('PayPal', 'bit-integrations'),
            'stripe'        => __('Stripe', 'bit-integrations'),
            'woocommerce'   => __('WooCommerce', 'bit-integrations'),
        ];
        $settings = (array) SettingsController::get_settings();
        $paymentMethods = [];

        foreach ((array) ($settings['payments'] ?? []) as $method => $config) {
            if (!empty($config['enabled']) && \in_array($method, Payments::$typeList, true)) {
                $paymentMethods[] = (object) ['value' => $method, 'label' => $labels[$method] ?? $method];
            }
        }

        wp_send_json_success(['paymentMethods' => $paymentMethods], 200);
    }

    public function refreshWpUsers()
    {
        self::isExists();

        wp_send_json_success(['wpUsers' => self::getUserOptions()], 200);
    }

    public function refreshStaffWpUsers()
    {
        self::isExists();

        wp_send_json_success(['staffWpUsers' => self::getUserOptions(['role__not_in' => ['administrator']])], 200);
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

    public static function isPluginActive()
    {
        return \defined('BOOKIT_VERSION') && class_exists(Appointments::class);
    }

    private static function getUserOptions($args = [])
    {
        $users = get_users(array_merge(['fields' => ['ID', 'display_name', 'user_email'], 'orderby' => 'display_name'], $args));

        return array_map(
            static function ($user) {
                return (object) ['value' => (string) $user->ID, 'label' => \sprintf('%s (%s)', $user->display_name, $user->user_email)];
            },
            $users
        );
    }
}
