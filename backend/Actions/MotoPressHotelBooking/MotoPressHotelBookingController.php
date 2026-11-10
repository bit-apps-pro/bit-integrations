<?php

namespace BitApps\Integrations\Actions\MotoPressHotelBooking;

use WP_Error;

class MotoPressHotelBookingController
{
    public static function isExists()
    {
        if (!static::isPluginActive()) {
            wp_send_json_error(__('MotoPress Hotel Booking is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public function refreshAccommodationTypes()
    {
        self::isExists();

        $accommodationTypes = [];

        foreach (MPHB()->getRoomTypeRepository()->getIdTitleList() as $id => $title) {
            $accommodationTypes[] = (object) ['value' => (int) $id, 'label' => $title . ' (#' . $id . ')'];
        }

        wp_send_json_success(['accommodationTypes' => $accommodationTypes], 200);
    }

    public function refreshAccommodations($requestParams)
    {
        self::isExists();

        $accommodationTypeId = (int) ($requestParams->accommodationTypeId ?? 0);
        $repository = MPHB()->getRoomRepository();
        $accommodations = [];

        foreach ($accommodationTypeId > 0 ? $repository->getIdTitleListForRoomType($accommodationTypeId) : $repository->getIdTitleList() as $id => $title) {
            $accommodations[] = (object) ['value' => (int) $id, 'label' => $title . ' (#' . $id . ')'];
        }

        wp_send_json_success(['accommodations' => $accommodations], 200);
    }

    public function refreshRates($requestParams)
    {
        self::isExists();

        $accommodationTypeId = (int) ($requestParams->accommodationTypeId ?? 0);
        $rates = [];

        foreach ($accommodationTypeId > 0 ? MPHB()->getRateRepository()->findAllActiveByRoomType($accommodationTypeId) : [] as $rate) {
            $rates[] = (object) ['value' => (int) $rate->getId(), 'label' => $rate->getTitle() . ' (#' . $rate->getId() . ')'];
        }

        wp_send_json_success(['rates' => $rates], 200);
    }

    public function refreshCountries()
    {
        self::isExists();

        $countries = [];

        foreach (MPHB()->settings()->main()->getCountriesBundle()->getCountriesList() as $code => $name) {
            $countries[] = (object) ['value' => $code, 'label' => $name];
        }

        wp_send_json_success(['countries' => $countries], 200);
    }

    public function refreshGateways()
    {
        self::isExists();

        $gateways = [];

        foreach (MPHB()->gatewayManager()->getList() as $id => $gateway) {
            $gateways[] = (object) ['value' => $id, 'label' => $gateway->getAdminTitle()];
        }

        wp_send_json_success(['gateways' => $gateways], 200);
    }

    public function refreshNoteAuthors()
    {
        self::isExists();

        $authors = [];

        foreach (get_users(['capability' => 'edit_mphb_bookings', 'fields' => ['ID', 'display_name', 'user_email']]) as $user) {
            $authors[] = (object) ['value' => (int) $user->ID, 'label' => $user->display_name . ' (' . $user->user_email . ')'];
        }

        wp_send_json_success(['authors' => $authors], 200);
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
        return \function_exists('MPHB') && class_exists('MPHB\Entities\Booking');
    }
}
