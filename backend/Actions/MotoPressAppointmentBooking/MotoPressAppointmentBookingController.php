<?php

namespace BitApps\Integrations\Actions\MotoPressAppointmentBooking;

use WP_Error;

class MotoPressAppointmentBookingController
{
    private const SERVICE_POST_TYPE = 'mpa_service';

    private const EMPLOYEE_POST_TYPE = 'mpa_employee';

    private const LOCATION_POST_TYPE = 'mpa_location';

    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(__('MotoPress Appointment Booking is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public function refreshServices()
    {
        self::isExists();

        wp_send_json_success(['services' => self::getPostOptions(self::SERVICE_POST_TYPE)], 200);
    }

    public function refreshEmployees()
    {
        self::isExists();

        wp_send_json_success(['employees' => self::getPostOptions(self::EMPLOYEE_POST_TYPE)], 200);
    }

    public function refreshLocations()
    {
        self::isExists();

        wp_send_json_success(['locations' => self::getPostOptions(self::LOCATION_POST_TYPE)], 200);
    }

    public function refreshGateways()
    {
        self::isExists();

        $gateways = [];

        foreach (mpapp()->payments()->getAll() as $gateway) {
            if (method_exists($gateway, 'isOnlyPremiumAvailable') && $gateway->isOnlyPremiumAvailable()) {
                continue;
            }

            $gateways[] = (object) ['value' => $gateway->getId(), 'label' => $gateway->getName()];
        }

        wp_send_json_success(['gateways' => $gateways], 200);
    }

    public function refreshCurrencies()
    {
        self::isExists();

        $currencies = [];

        foreach (mpapp()->bundles()->currencies()->getCurrencies() as $code => $label) {
            $currencies[] = (object) ['value' => $code, 'label' => html_entity_decode($label, ENT_QUOTES)];
        }

        wp_send_json_success(['currencies' => $currencies], 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = [];

        foreach (get_users(['orderby' => 'display_name', 'fields' => ['ID', 'display_name', 'user_email']]) as $user) {
            $users[] = (object) ['value' => (int) $user->ID, 'label' => $user->display_name . ' (' . $user->user_email . ')'];
        }

        wp_send_json_success(['users' => $users], 200);
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
        return \defined('MotoPress\Appointment\VERSION') && \function_exists('mpapp');
    }

    private static function getPostOptions($postType)
    {
        $options = [];

        $posts = get_posts(
            [
                'post_type'      => $postType,
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'          => 'ASC',
            ]
        );

        foreach ($posts as $post) {
            $options[] = (object) ['value' => (int) $post->ID, 'label' => html_entity_decode($post->post_title, ENT_QUOTES) . ' (#' . $post->ID . ')'];
        }

        return $options;
    }
}
