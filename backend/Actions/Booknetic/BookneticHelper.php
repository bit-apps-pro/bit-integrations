<?php

namespace BitApps\Integrations\Actions\Booknetic;

class BookneticHelper
{
    private const OPTION_LIMIT = 500;

    private const MODEL_OPTIONS = [
        'locations'           => 'BookneticApp\Models\Location',
        'services'            => 'BookneticApp\Models\Service',
        'staff'               => 'BookneticApp\Models\Staff',
        'customer_categories' => 'BookneticApp\Models\CustomerCategory',
        'location_categories' => 'BookneticApp\Models\LocationCategory',
        'service_categories'  => 'BookneticApp\Models\ServiceCategory',
        'extra_categories'    => 'BookneticApp\Models\ExtraCategory',
    ];

    public static function isExists()
    {
        if (!class_exists('BookneticApp\Providers\Core\Bootstrap')) {
            wp_send_json_error(__('Booknetic is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public function refreshOptions($requestParams)
    {
        self::isExists();

        $type = sanitize_key($requestParams->type ?? '');

        switch ($type) {
            case 'customers':
                $options = self::customerOptions();

                break;
            case 'statuses':
                $options = self::statusOptions();

                break;
            case 'payment_gateways':
                $options = self::paymentGatewayOptions();

                break;
            case 'users':
                $options = self::userOptions();

                break;
            default:
                if (!isset(self::MODEL_OPTIONS[$type])) {
                    wp_send_json_error(__('The option type is not valid.', 'bit-integrations'), 400);
                }

                $options = self::modelOptions(self::MODEL_OPTIONS[$type]);

                break;
        }

        wp_send_json_success(['options' => $options], 200);
    }

    private static function modelOptions($modelClass)
    {
        if (!class_exists($modelClass)) {
            return [];
        }

        $options = [];

        foreach ($modelClass::query()->orderBy('id DESC')->limit(self::OPTION_LIMIT)->fetchAll() as $record) {
            $label = (string) ($record->name ?? '');
            $options[] = [
                'value' => (string) $record->id,
                'label' => $label !== '' ? $label : '#' . (int) $record->id,
            ];
        }

        return $options;
    }

    private static function customerOptions()
    {
        if (!class_exists('BookneticApp\Models\Customer')) {
            return [];
        }

        $options = [];

        foreach (\BookneticApp\Models\Customer::query()->orderBy('id DESC')->limit(self::OPTION_LIMIT)->fetchAll() as $customer) {
            $name = trim($customer->first_name . ' ' . $customer->last_name);
            $label = $name !== '' ? $name : '#' . (int) $customer->id;

            if (!empty($customer->email)) {
                $label .= ' (' . $customer->email . ')';
            }

            $options[] = ['value' => (string) $customer->id, 'label' => $label];
        }

        return $options;
    }

    private static function statusOptions()
    {
        if (!class_exists('BookneticApp\Providers\Helpers\Helper')) {
            return [];
        }

        $options = [];

        foreach (\BookneticApp\Providers\Helpers\Helper::getAppointmentStatuses() as $value => $status) {
            $options[] = ['value' => (string) $value, 'label' => $status['title'] ?? $value];
        }

        return $options;
    }

    private static function paymentGatewayOptions()
    {
        if (!class_exists('BookneticApp\Providers\Common\PaymentGatewayService')) {
            return [];
        }

        $options = [];

        foreach (\BookneticApp\Providers\Common\PaymentGatewayService::getGateways() as $value => $gateway) {
            $options[] = ['value' => (string) $value, 'label' => $gateway->getTitle()];
        }

        return $options;
    }

    private static function userOptions()
    {
        $options = [];

        foreach (get_users(['fields' => ['ID', 'display_name', 'user_email'], 'number' => self::OPTION_LIMIT]) as $user) {
            $options[] = [
                'value' => (string) $user->ID,
                'label' => ($user->display_name ?: $user->user_email) . ' (' . $user->user_email . ')',
            ];
        }

        return $options;
    }
}
