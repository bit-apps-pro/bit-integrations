<?php

/**
 * Bit CRM Integration
 */

namespace BitApps\Integrations\Actions\BitCrm;

use WP_Error;

class BitCrmController
{
    public static function isExists()
    {
        if (!class_exists('BitApps\Crm\Config')) {
            wp_send_json_error(__('Bit CRM is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function bitCrmAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshUsers()
    {
        self::ensureClass('BitApps\Crm\Services\UserService');
        wp_send_json_success(['options' => self::normalize((new \BitApps\Crm\Services\UserService())->getUsersAsOptions())]);
    }

    public static function refreshCurrencies()
    {
        self::ensureClass('BitApps\Crm\Services\CurrencyService');
        wp_send_json_success(['options' => self::normalize((new \BitApps\Crm\Services\CurrencyService())->getOtherCurrenciesAsOptions())]);
    }

    public static function refreshDealStages()
    {
        self::ensureClass('BitApps\Crm\Services\DealStageService');
        $stages = (new \BitApps\Crm\Services\DealStageService())->getStagesAsOptions(\BitApps\Crm\Services\DealStageService::STATUS_ACTIVE);
        wp_send_json_success(['options' => self::normalize($stages)]);
    }

    public static function refreshInvoiceTerms()
    {
        self::ensureClass('BitApps\Crm\Services\InvoiceTermService');
        wp_send_json_success(['options' => self::normalize((new \BitApps\Crm\Services\InvoiceTermService())->getTermsAsOptions())]);
    }

    public static function refreshContacts()
    {
        self::ensureClass('BitApps\Crm\Services\ContactService');
        wp_send_json_success(['options' => self::normalize((new \BitApps\Crm\Services\ContactService())->getEntitiesAsOptions())]);
    }

    public static function refreshCompanies()
    {
        self::ensureClass('BitApps\Crm\Services\CompanyService');
        wp_send_json_success(['options' => self::normalize((new \BitApps\Crm\Services\CompanyService())->getEntitiesAsOptions())]);
    }

    public static function refreshLeadTags()
    {
        wp_send_json_success(['options' => self::tagOptions('lead')]);
    }

    public static function refreshContactTags()
    {
        wp_send_json_success(['options' => self::tagOptions('contact')]);
    }

    public static function refreshCompanyTags()
    {
        wp_send_json_success(['options' => self::tagOptions('company')]);
    }

    public static function refreshDealTags()
    {
        wp_send_json_success(['options' => self::tagOptions('deal')]);
    }

    public static function refreshProductTags()
    {
        wp_send_json_success(['options' => self::tagOptions('product')]);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map;
        $utilities          = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integrationDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }

    private static function ensureClass($class)
    {
        self::isExists();
        if (!class_exists($class)) {
            wp_send_json_error(
                // translators: %s: fully-qualified Bit CRM class name
                \sprintf(__('Required Bit CRM component "%s" is not available. Please update Bit CRM.', 'bit-integrations'), $class),
                400
            );
        }
    }

    private static function tagOptions($module)
    {
        self::isExists();
        if (!class_exists('BitApps\Crm\Model\Tag')) {
            return [];
        }

        $tags = \BitApps\Crm\Model\Tag::where('module', $module)->get();
        if (empty($tags)) {
            return [];
        }

        $options = [];
        foreach ($tags->toArray() as $tag) {
            $options[] = ['label' => $tag['title'] ?? '', 'value' => (string) ($tag['id'] ?? '')];
        }

        return $options;
    }

    private static function normalize($items)
    {
        $options = [];
        foreach ((array) $items as $item) {
            $item  = (array) $item;
            $value = $item['value'] ?? $item['id'] ?? $item['key'] ?? '';
            $label = $item['label'] ?? $item['name'] ?? $item['title'] ?? (string) $value;
            $options[] = ['label' => (string) $label, 'value' => (string) $value];
        }

        return $options;
    }
}
