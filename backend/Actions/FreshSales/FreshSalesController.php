<?php

/**
 * FreshSales Integration
 */

namespace BitApps\Integrations\Actions\FreshSales;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for FreshSales integration
 */
class FreshSalesController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'freshsales',
        'fields'   => [
            'api_key'      => 'value',
            'bundle_alias' => 'bundle_alias',
        ],
    ];

    public function getMetaData($requestParams)
    {
        if (empty($requestParams->api_key) || empty($requestParams->bundle_alias)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        switch ($requestParams->module) {
            case 'contacts':
                $viewId = $requestParams->contact_view_id;

                break;
            case 'sales_accounts':
                $viewId = $requestParams->account_view_id;

                break;
            default:
                $viewId = '';

                break;
        }

        wp_send_json_success(static::getMetaDataRecursively($requestParams, $viewId), 200);
    }

    public function getFields($requestParams)
    {
        if (empty($requestParams->api_key) || empty($requestParams->bundle_alias) || empty($requestParams->module)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $module = $requestParams->module;

        $requestModule = '';
        if ($module === 'Deal') {
            $requestModule = 'deals';
        } elseif ($module === 'Contact') {
            $requestModule = 'contacts';
        } elseif ($module === 'Account') {
            $requestModule = 'sales_accounts';
        }

        $unnecessaryFields = (object) [
            'Account'  => ['id', 'owner_id', 'industry_type_id', 'business_type_id', 'created_at', 'updated_at', 'parent_sales_account_id', 'creater_id', 'updater_id', 'last_assigned_at', 'completed_sales_sequences', 'active_sales_sequences', 'last_contacted_via_sales_activity', 'last_contacted_sales_activity_mode', 'last_contacted_mode', 'last_contacted', 'territory_id', 'tags'],
            'Deal'     => ['deal_stage_id', 'deal_reason_id', 'closed_date', 'currency_id', 'tags', 'base_currency_amount', 'deal_payment_status_id', 'probability', 'territory_id', 'forecast_category', 'record_type_id', 'deal_type_id', 'lead_source_id', 'campaign_id', 'last_contacted_sales_activity_mode', 'last_contacted_via_sales_activity', 'active_sales_sequences', 'completed_sales_sequences', 'creater_id', 'created_at', 'updater_id', 'updated_at', 'web_form_id', 'upcoming_activities_time', 'stage_updated_time', 'last_assigned_at', 'expected_deal_value'],
            'Contact'  => ['external_id', 'owner_id', 'sales_accounts', 'subscription_status', 'subscription_types', 'unsubscription_reason', 'other_unsubscription_reason', 'whatsapp_subscription_status', 'sms_subscription_status', 'lifecycle_stage_id', 'contact_status_id', 'lost_reason_id', 'first_campaign', 'first_medium',  'first_source', 'last_campaign', 'last_medium', 'last_source', 'latest_campaign', 'latest_medium', 'latest_source', 'tags', 'time_zone', 'phone_numbers', 'territory_id', 'lead_source_id', 'campaign_id', 'last_seen_chat', 'total_sessions', 'locale', 'first_seen_chat', 'last_contacted', 'last_contacted_mode', 'last_contacted_sales_activity_mode', 'last_contacted_via_sales_activity', 'active_sales_sequences', 'completed_sales_sequences', 'last_seen', 'lead_score', 'customer_fit', 'recent_note', 'creater_id', 'created_at', 'updater_id', 'updated_at', 'web_form_ids', 'last_assigned_at'],
            'Products' => ['weighted_value', 'category', 'currency',  'weighted_value_currency',  'org_id', 'owner_id', 'contact_id', 'selectable', 'label', 'status', 'add_time', 'update_time', 'stage_change_time', 'next_activity_date', 'last_activity_date', 'won_time', 'last_incoming_mail_time', 'last_outgoing_mail_time', 'lost_time', 'close_time', 'lost_reason', 'visible_to', 'id', 'activities_count', 'done_activities_count', 'undone_activities_count', 'email_messages_count'],
        ];

        if ($module == 'Product') {
            $formattedResponse = [
                [
                    'key'      => 'name',
                    'label'    => __('Name', 'bit-integrations'),
                    'required' => true
                ],

                [
                    'key'      => 'description',
                    'label'    => __('Description', 'bit-integrations'),
                    'required' => true
                ],

                [
                    'key'      => 'sku_number',
                    'label'    => __('Sku number', 'bit-integrations'),
                    'required' => false
                ],

                [
                    'key'      => 'valid_till',
                    'label'    => __('Valid till', 'bit-integrations'),
                    'required' => false
                ],

                [
                    'key'      => 'product_code',
                    'label'    => __('Product code', 'bit-integrations'),
                    'required' => false
                ],
            ];
            wp_send_json_success($formattedResponse, 200);
        } else {
            $apiEndpoints = 'https://' . $requestParams->bundle_alias . '/api/settings/' . $requestModule . '/fields';
            $headers = [
                'Authorization' => 'Token token=' . $requestParams->api_key,
            ];
            $response = HttpHelper::get($apiEndpoints, null, $headers);

            if (isset($response) && $response) {
                $formattedResponse = [];

                foreach ($response->fields as $value) {
                    if (!\in_array($value->name, $unnecessaryFields->{$module})) {
                        $formattedResponse[] = [
                            'key'      => $value->name,
                            'label'    => $value->label,
                            'required' => $module === 'Contact' && $value->name === 'emails' ? true : $value->required,
                        ];
                    }
                }

                wp_send_json_success($formattedResponse, 200);
            } else {
                wp_send_json_error(
                    __('The token is invalid', 'bit-integrations'),
                    400
                );
            }
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $api_key = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');
        $bundle_alias = $integrationDetails->bundle_alias;
        $fieldMap = $integrationDetails->field_map;
        $module = strtolower($integrationDetails->moduleData->module);
        $actions = $integrationDetails->actions;

        if (
            empty($fieldMap)
            || empty($api_key)
            || empty($bundle_alias)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'FreshSales'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $freshSalesApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $module,
            $actions
        );

        if (is_wp_error($freshSalesApiResponse)) {
            return $freshSalesApiResponse;
        }

        return $freshSalesApiResponse;
    }

    private static function getMetaDataRecursively($requestParams, $viewId, $formattedResponse = [], $page = 1)
    {
        if ($requestParams->module == 'filters') {
            $apiEndpoints = 'https://' . $requestParams->bundle_alias . '/api/' . $requestParams->type . '/' . $requestParams->module;
        } else {
            $apiEndpoints = 'https://' . $requestParams->bundle_alias . '/api/' . $requestParams->module . '/view/' . $viewId . '?page=' . $page;
        }

        $headers = ['Authorization' => 'Token token=' . $requestParams->api_key];
        $response = HttpHelper::get($apiEndpoints, null, $headers);

        if (is_wp_error($response)) {
            return $response;
        }

        $responseData = ((array) ($response))[$requestParams->module];
        $isContactModule = $requestParams->module == 'contacts';

        foreach ($responseData as $value) {
            $formattedResponse[] = [
                'value' => $value->id,
                'label' => $isContactModule ? $value->display_name : $value->name
            ];
        }

        if (isset($response->meta->total_pages) && $response->meta->total_pages > $page) {
            $page++;
            $formattedResponse = static::getMetaDataRecursively($requestParams, $viewId, $formattedResponse, $page);
        }

        return $formattedResponse;
    }
}
