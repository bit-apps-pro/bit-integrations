<?php

/**
 * Zendesk Support Integration
 */

namespace BitApps\Integrations\Actions\ZendeskSupport;

use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Zendesk Support integration
 */
class ZendeskSupportController
{
    public function authorize($requestParams)
    {
        if (empty($requestParams->subdomain) || empty($requestParams->email) || empty($requestParams->apiToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $baseUrl = 'https://' . $requestParams->subdomain . '.zendesk.com/api/v2';
        $headers = [
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
            'Authorization' => 'Basic ' . base64_encode($requestParams->email . '/token:' . $requestParams->apiToken),
        ];

        $response = HttpHelper::get($baseUrl . '/users/me.json', null, $headers);

        if (!is_wp_error($response) && isset($response->user) && !empty($response->user->id)) {
            wp_send_json_success(__('Authorization successful', 'bit-integrations'), 200);
        }

        wp_send_json_error(__('Invalid Zendesk subdomain, email, or API token', 'bit-integrations'), 400);
    }

    public function refreshGroups($requestParams)
    {
        $this->fetchOptions($requestParams, '/groups.json', 'groups', 'name');
    }

    public function refreshBrands($requestParams)
    {
        $this->fetchOptions($requestParams, '/brands.json', 'brands', 'name');
    }

    public function refreshTicketForms($requestParams)
    {
        $this->fetchOptions($requestParams, '/ticket_forms.json', 'ticket_forms', 'name');
    }

    public function refreshOrganizations($requestParams)
    {
        $this->fetchOptions($requestParams, '/organizations.json?per_page=100', 'organizations', 'name');
    }

    public function refreshAgents($requestParams)
    {
        $this->fetchOptions($requestParams, '/users.json?role[]=agent&role[]=admin&per_page=100', 'users', 'name');
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($actionName) || empty($integrationDetails->subdomain) || empty($integrationDetails->apiToken)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Zendesk Support'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);
    }

    private function fetchOptions($requestParams, $path, $listKey, $labelKey)
    {
        if (empty($requestParams->subdomain) || empty($requestParams->email) || empty($requestParams->apiToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $baseUrl = 'https://' . $requestParams->subdomain . '.zendesk.com/api/v2';
        $headers = [
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
            'Authorization' => 'Basic ' . base64_encode($requestParams->email . '/token:' . $requestParams->apiToken),
        ];

        $response = HttpHelper::get($baseUrl . $path, null, $headers);

        if (is_wp_error($response) || !isset($response->{$listKey})) {
            wp_send_json_error(__('Failed to fetch data from Zendesk', 'bit-integrations'), 400);
        }

        $options = [];
        foreach ($response->{$listKey} as $item) {
            $options[] = [
                'label' => $item->{$labelKey} ?? (string) $item->id,
                'value' => (string) $item->id,
            ];
        }

        wp_send_json_success($options, 200);
    }
}
