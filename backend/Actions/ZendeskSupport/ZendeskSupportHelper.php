<?php

namespace BitApps\Integrations\Actions\ZendeskSupport;

use BitApps\Integrations\Core\Util\HttpHelper;

class ZendeskSupportHelper
{
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
